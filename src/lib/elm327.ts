/**
 * ELM327 integration layer.
 *
 * Supports three transports:
 *  - Web Bluetooth (BLE ELM327 dongles)
 *  - WebSocket (Wi-Fi ELM327 behind a local TCP->WS relay, e.g. ws://localhost:35001)
 *  - Simulator (no hardware present; drives the UI with synthetic telemetry)
 */

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
export type Transport = "ble" | "websocket" | "simulator";

export interface Telemetry {
  rpm: number | null;
  speed: number | null;
  coolant: number | null;
  load: number | null;
  voltage: number | null;
  intakeTemp: number | null;
  throttle: number | null;
  maf: number | null;
  fuelLevel: number | null;
  shortTrim: number | null;
  longTrim: number | null;
  map: number | null;
  timingAdvance: number | null;
  runTime: number | null;
  milOn: boolean | null;
  dtcCount: number | null;
  latencyMs: number;
  protocol: string;
  heartbeatAt: number;
}

export interface TroubleCode {
  code: string;
  description: string;
  status: "stored" | "pending";
}

type Listener = () => void;

/** Common BLE serial service UUIDs used by ELM327 clones. */
const BLE_SERVICES = [
  0xfff0,
  "0000fff0-0000-1000-8000-00805f9b34fb",
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
];

const INIT_COMMANDS = ["AT Z", "AT E0", "AT L0", "AT H0", "AT S1", "AT SP 0"];
/** Polled several times a second — the values a driver watches move. */
const FAST_COMMANDS = ["010C", "010D", "0104", "0111"];
/** Polled once a second — slow-moving or informational values. */
const SLOW_COMMANDS = [
  "0105",
  "010F",
  "0110",
  "012F",
  "0106",
  "0107",
  "010B",
  "010E",
  "011F",
  "ATRV",
  "0101",
];

export const DTC_DESCRIPTIONS: Record<string, string> = {
  P0100: "Mass or Volume Air Flow Circuit Malfunction",
  P0101: "Mass or Volume Air Flow Circuit Range / Performance",
  P0113: "Intake Air Temperature Sensor Circuit High Input",
  P0118: "Engine Coolant Temperature Sensor Circuit High Input",
  P0120: "Throttle / Pedal Position Sensor Circuit Malfunction",
  P0128: "Coolant Thermostat Below Regulating Temperature",
  P0131: "O2 Sensor Circuit Low Voltage (Bank 1 Sensor 1)",
  P0133: "O2 Sensor Circuit Slow Response (Bank 1 Sensor 1)",
  P0135: "O2 Sensor Heater Circuit Malfunction (Bank 1 Sensor 1)",
  P0171: "System Too Lean (Bank 1)",
  P0172: "System Too Rich (Bank 1)",
  P0174: "System Too Lean (Bank 2)",
  P0300: "Random / Multiple Cylinder Misfire Detected",
  P0301: "Cylinder 1 Misfire Detected",
  P0302: "Cylinder 2 Misfire Detected",
  P0303: "Cylinder 3 Misfire Detected",
  P0304: "Cylinder 4 Misfire Detected",
  P0325: "Knock Sensor 1 Circuit Malfunction",
  P0335: "Crankshaft Position Sensor A Circuit Malfunction",
  P0340: "Camshaft Position Sensor Circuit Malfunction",
  P0401: "Exhaust Gas Recirculation Flow Insufficient",
  P0420: "Catalyst System Efficiency Below Threshold (Bank 1)",
  P0430: "Catalyst System Efficiency Below Threshold (Bank 2)",
  P0440: "Evaporative Emission Control System Malfunction",
  P0442: "EVAP System Small Leak Detected",
  P0455: "EVAP System Large Leak Detected",
  P0500: "Vehicle Speed Sensor Malfunction",
  P0506: "Idle Control System RPM Lower Than Expected",
  P0507: "Idle Control System RPM Higher Than Expected",
  P0562: "System Voltage Low",
  P0563: "System Voltage High",
  P0700: "Transmission Control System Malfunction",
  C0035: "Left Front Wheel Speed Sensor Circuit",
  C0040: "Right Front Wheel Speed Sensor Circuit",
  B0020: "Left Side Airbag Deployment Control",
  U0100: "Lost Communication With ECM / PCM",
  U0101: "Lost Communication With TCM",
  U0121: "Lost Communication With ABS Control Module",
  U0155: "Lost Communication With Instrument Panel Cluster",
};

export function describeDtc(code: string) {
  return DTC_DESCRIPTIONS[code] ?? "Manufacturer / unlisted code — see service data";
}

const DTC_PREFIX = ["P", "C", "B", "U"] as const;

/** Decode a mode 03 / 07 payload (after the 43 / 47 header) into DTC strings. */
export function decodeDtcBytes(bytes: string[]): string[] {
  const codes: string[] = [];
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    const a = parseInt(bytes[i] ?? "0", 16);
    const b = parseInt(bytes[i + 1] ?? "0", 16);
    if (a === 0 && b === 0) continue;
    const prefix = DTC_PREFIX[(a >> 6) & 0b11] ?? "P";
    const digits =
      ((a >> 4) & 0b11).toString(16) +
      (a & 0x0f).toString(16) +
      ((b >> 4) & 0x0f).toString(16) +
      (b & 0x0f).toString(16);
    codes.push(`${prefix}${digits.toUpperCase()}`);
  }
  return codes;
}

function hexBytes(clean: string) {
  return clean
    .split(/\s+/)
    .flatMap((t) => (/^[0-9A-F]+$/.test(t) && t.length % 2 === 0 ? (t.match(/.{2}/g) ?? []) : []));
}

/** Parse a raw ELM327 ASCII response frame into a telemetry patch. */
export function parseFrame(raw: string): Partial<Telemetry> | null {
  const clean = raw
    .replace(/[\r\n>]/g, " ")
    .trim()
    .toUpperCase();
  if (!clean || clean.includes("NO DATA")) return null;

  const voltMatch = clean.match(/(\d{1,2}\.\d)V/);
  if (voltMatch) return { voltage: Number(voltMatch[1]) };

  const bytes = hexBytes(clean);
  const i = bytes.indexOf("41");
  if (i === -1 || bytes.length < i + 3) return null;

  const pid = bytes[i + 1] ?? "";
  const a = parseInt(bytes[i + 2] ?? "0", 16);
  const b = parseInt(bytes[i + 3] ?? "0", 16);
  const hasB = bytes.length > i + 3;

  switch (pid) {
    case "01":
      return { milOn: (a & 0x80) !== 0, dtcCount: a & 0x7f };
    case "04":
      return { load: Math.round((a * 100) / 255) };
    case "05":
      return { coolant: a - 40 };
    case "06":
      return { shortTrim: Math.round((a / 1.28 - 100) * 10) / 10 };
    case "07":
      return { longTrim: Math.round((a / 1.28 - 100) * 10) / 10 };
    case "0B":
      return { map: a };
    case "0C":
      return hasB ? { rpm: Math.round((a * 256 + b) / 4) } : null;
    case "0D":
      return { speed: a };
    case "0E":
      return { timingAdvance: Math.round((a / 2 - 64) * 10) / 10 };
    case "0F":
      return { intakeTemp: a - 40 };
    case "10":
      return hasB ? { maf: Math.round(((a * 256 + b) / 100) * 10) / 10 } : null;
    case "11":
      return { throttle: Math.round((a * 100) / 255) };
    case "1F":
      return hasB ? { runTime: a * 256 + b } : null;
    case "2F":
      return { fuelLevel: Math.round((a * 100) / 255) };
    default:
      return null;
  }
}

const EMPTY_TELEMETRY: Telemetry = {
  rpm: null,
  speed: null,
  coolant: null,
  load: null,
  voltage: null,
  intakeTemp: null,
  throttle: null,
  maf: null,
  fuelLevel: null,
  shortTrim: null,
  longTrim: null,
  map: null,
  timingAdvance: null,
  runTime: null,
  milOn: null,
  dtcCount: null,
  latencyMs: 0,
  protocol: "—",
  heartbeatAt: 0,
};

export class Elm327Client {
  status: ConnectionStatus = "disconnected";
  transport: Transport = "simulator";
  telemetry: Telemetry = { ...EMPTY_TELEMETRY };
  troubleCodes: TroubleCode[] = [];
  lastError: string | null = null;
  traffic: string[] = [];

  private listeners = new Set<Listener>();
  private fastTimer: ReturnType<typeof setInterval> | null = null;
  private slowTimer: ReturnType<typeof setInterval> | null = null;
  private writeChar: BluetoothRemoteGATTCharacteristic | null = null;
  private socket: WebSocket | null = null;
  private device: BluetoothDevice | null = null;
  private simThrottle = 0;
  private simFaults: string[] = ["P0171", "P0300", "U0100"];
  private simPending: string[] = ["P0442"];
  private fastIndex = 0;
  private slowIndex = 0;
  private sentAt = 0;
  private chain: Promise<unknown> = Promise.resolve();
  private pending: {
    resolve: (raw: string) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  } | null = null;
  private bleBuffer = "";
  private pollingBusy = false;

  subscribe = (fn: Listener) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  private emit() {
    this.listeners.forEach((l) => l());
  }

  private log(line: string) {
    this.traffic = [`${new Date().toLocaleTimeString()}  ${line}`, ...this.traffic].slice(0, 40);
  }

  static bleSupported() {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  async connect(transport: Transport, wsUrl = "ws://localhost:35001") {
    await this.disconnect();
    this.transport = transport;
    this.status = "connecting";
    this.lastError = null;
    this.emit();

    try {
      if (transport === "ble") await this.connectBle();
      else if (transport === "websocket") await this.connectWs(wsUrl);
      else this.telemetry.protocol = "SIM / ISO 15765-4 CAN";

      for (const cmd of INIT_COMMANDS) await this.send(cmd);
      await this.send("0101");
      this.status = "connected";
      this.startPolling();
    } catch (err) {
      await this.disconnect();
      this.status = "error";
      this.lastError = err instanceof Error ? err.message : String(err);
    }
    this.emit();
  }

  private async connectBle() {
    if (!Elm327Client.bleSupported())
      throw new Error("Web Bluetooth is not available in this browser.");
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "OBD" }, { namePrefix: "ELM" }, { namePrefix: "Vgate" }],
      optionalServices: BLE_SERVICES,
    });
    this.device = device;
    if (!device.gatt) throw new Error("This device has no BLE GATT connection.");
    const server = await device.gatt.connect();
    device.addEventListener("gattserverdisconnected", () => {
      void this.disconnect();
    });
    let write: BluetoothRemoteGATTCharacteristic | null = null;
    let notify: BluetoothRemoteGATTCharacteristic | null = null;

    for (const svcId of BLE_SERVICES) {
      try {
        const svc = await server.getPrimaryService(svcId as BluetoothServiceUUID);
        for (const ch of await svc.getCharacteristics()) {
          if (ch.properties.write || ch.properties.writeWithoutResponse) write = ch;
          if (ch.properties.notify) notify = ch;
        }
        if (write) break;
      } catch {
        /* service not present on this dongle */
      }
    }
    if (!write) throw new Error("No writable ELM327 characteristic found on this device.");
    this.writeChar = write;
    this.telemetry.protocol = "BLE / ISO 15765-4 CAN";

    if (notify) {
      await notify.startNotifications();
      notify.addEventListener("characteristicvaluechanged", (e) => {
        const v = (e.target as BluetoothRemoteGATTCharacteristic).value;
        if (!v) return;
        this.bleBuffer += new TextDecoder().decode(v);
        let index = this.bleBuffer.indexOf(">");
        while (index !== -1) {
          this.ingest(this.bleBuffer.slice(0, index));
          this.bleBuffer = this.bleBuffer.slice(index + 1);
          index = this.bleBuffer.indexOf(">");
        }
      });
    }
  }

  private connectWs(url: string) {
    return new Promise<void>((resolve, reject) => {
      const parsed = new URL(url);
      if (!["ws:", "wss:"].includes(parsed.protocol)) {
        reject(new Error("Enter a ws:// or wss:// bridge address."));
        return;
      }
      const sock = new WebSocket(url);
      this.socket = sock;
      const timer = setTimeout(() => {
        sock.close();
        reject(new Error(`Bridge did not answer at ${url}. Start the bridge on your ThinkPad.`));
      }, 6000);
      sock.onopen = () => {
        clearTimeout(timer);
        this.socket = sock;
        this.telemetry.protocol = "Wi-Fi / TCP-WS bridge";
        resolve();
      };
      sock.onerror = () => {
        clearTimeout(timer);
        reject(new Error(`Could not reach ELM327 bridge at ${url}`));
      };
      sock.onmessage = (ev) => this.ingest(String(ev.data));
      sock.onclose = () => {
        clearTimeout(timer);
        reject(new Error("Bridge closed before connecting to the dongle."));
        this.failPending(new Error("Dongle connection closed."));
        if (this.status === "connected") {
          this.stopPolling();
          this.status = "disconnected";
          this.lastError = "Dongle connection closed. Check Wi-Fi and restart the bridge.";
          this.telemetry = { ...EMPTY_TELEMETRY };
          this.emit();
        }
      };
    });
  }

  /** Raw write of an AT / OBD command string. */
  async send(command: string) {
    const request = this.chain.then(() => this.exchange(command));
    this.chain = request.catch(() => undefined);
    return request;
  }

  private async exchange(command: string): Promise<string> {
    if (this.status !== "connected" && this.status !== "connecting")
      throw new Error("Adapter not connected.");
    if (this.transport !== "simulator" && command.startsWith("RLY|"))
      throw new Error("ELM327 does not support relay control.");
    this.sentAt = performance.now();
    this.log(`TX  ${command}`);
    if (this.transport === "simulator") {
      const raw = this.simulate(command);
      this.ingest(raw);
      return raw;
    }
    const response = new Promise<string>((resolve, reject) => {
      this.pending = {
        resolve,
        reject,
        timer: setTimeout(() => {
          this.failPending(
            new Error(`No reply to ${command}. Check ignition, dongle Wi-Fi and bridge.`),
          );
          void this.disconnect();
        }, 10000),
      };
    });
    try {
      const payload = new TextEncoder().encode(`${command}\r`);
      if (this.transport === "ble" && this.writeChar) {
        if (this.writeChar.properties.write) await this.writeChar.writeValueWithResponse(payload);
        else await this.writeChar.writeValueWithoutResponse(payload);
      } else if (this.transport === "websocket" && this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(`${command}\r`);
      } else throw new Error("Adapter not connected.");
    } catch (error) {
      this.failPending(error instanceof Error ? error : new Error("Write failed."));
    }
    return response;
  }

  private failPending(error: Error) {
    const pending = this.pending;
    if (!pending) return;
    this.pending = null;
    clearTimeout(pending.timer);
    pending.reject(error);
  }

  private ingest(raw: string) {
    this.log(`RX  ${raw.replace(/[\r\n]+/g, " ").trim()}`);
    const clean = raw
      .replace(/[\r\n>]/g, " ")
      .trim()
      .toUpperCase();
    const pending = this.pending;
    this.pending = null;
    if (pending) {
      clearTimeout(pending.timer);
      if (/ERROR|UNABLE TO CONNECT|STOPPED|BUS INIT|^\?$/.test(clean))
        pending.reject(new Error(`Adapter reply: ${clean}`));
      else pending.resolve(raw);
    }
    this.telemetry.latencyMs = Math.max(1, Math.round(performance.now() - this.sentAt));
    this.telemetry.heartbeatAt = Date.now();

    const bytes = hexBytes(clean);
    const stored = bytes.indexOf("43");
    const pendingIndex = bytes.indexOf("47");
    if (stored !== -1) this.mergeCodes(decodeDtcBytes(bytes.slice(stored + 1)), "stored");
    else if (pendingIndex !== -1)
      this.mergeCodes(decodeDtcBytes(bytes.slice(pendingIndex + 1)), "pending");

    const patch = parseFrame(raw);
    if (patch) Object.assign(this.telemetry, patch);
    this.emit();
  }

  private mergeCodes(codes: string[], status: TroubleCode["status"]) {
    const others = this.troubleCodes.filter((c) => c.status !== status);
    const fresh = codes.map((code) => ({ code, description: describeDtc(code), status }));
    this.troubleCodes = [...others, ...fresh].sort((a, b) => a.code.localeCompare(b.code));
  }

  private simulate(command: string): string {
    const t = Date.now() / 1000;
    const idle = this.simThrottle;
    switch (command) {
      case "0101": {
        const count = this.simFaults.length;
        return `41 01 ${hex(count > 0 ? 0x80 | count : 0)} 07 65 04`;
      }
      case "0104":
        return `41 04 ${hex(Math.round(46 + idle * 120))}`;
      case "0105":
        return `41 05 ${hex(Math.round(129 + idle * 12))}`;
      case "0106":
        return `41 06 ${hex(Math.round(128 + Math.sin(t) * 6))}`;
      case "0107":
        return `41 07 ${hex(Math.round(130 + Math.cos(t / 2) * 4))}`;
      case "010B":
        return `41 0B ${hex(Math.round(32 + idle * 55))}`;
      case "010C": {
        const rpm = Math.round(idle * (2400 + Math.sin(t) * 380) + (idle > 0 ? 780 : 0));
        const v = rpm * 4;
        return `41 0C ${hex(v >> 8)} ${hex(v & 0xff)}`;
      }
      case "010D":
        return `41 0D ${hex(Math.round(idle * (48 + Math.sin(t / 2) * 12)))}`;
      case "010E":
        return `41 0E ${hex(Math.round(128 + idle * 24))}`;
      case "010F":
        return `41 0F ${hex(Math.round(74 + Math.sin(t / 4) * 3))}`;
      case "0110": {
        const maf = Math.round((120 + idle * 2400 + Math.sin(t) * 60) * 1);
        return `41 10 ${hex(maf >> 8)} ${hex(maf & 0xff)}`;
      }
      case "0111":
        return `41 11 ${hex(Math.round(36 + idle * 150))}`;
      case "011F": {
        const rt = Math.round(t % 3600);
        return `41 1F ${hex(rt >> 8)} ${hex(rt & 0xff)}`;
      }
      case "012F":
        return `41 2F ${hex(Math.round(168 - (t % 600) / 20))}`;
      case "ATRV":
        return `${(13.8 + Math.sin(t / 3) * 0.3).toFixed(1)}V`;
      case "03":
        return `43 ${encodeDtcs(this.simFaults)}`;
      case "07":
        return `47 ${encodeDtcs(this.simPending)}`;
      case "04":
        this.simFaults = [];
        this.simPending = [];
        return "44";
      default:
        return "OK";
    }
  }

  /** Simulator only: 0 = engine off, 1 = driving. */
  setSimThrottle(v: number) {
    this.simThrottle = v;
    this.emit();
  }

  private startPolling() {
    this.stopPolling();
    this.fastTimer = setInterval(() => {
      const cmd = FAST_COMMANDS[this.fastIndex % FAST_COMMANDS.length] ?? "010C";
      this.fastIndex += 1;
      void this.poll(cmd);
    }, 300);
    this.slowTimer = setInterval(() => {
      const cmd = SLOW_COMMANDS[this.slowIndex % SLOW_COMMANDS.length] ?? "0105";
      this.slowIndex += 1;
      void this.poll(cmd);
    }, 900);
  }

  private async poll(command: string) {
    if (this.pollingBusy || this.status !== "connected") return;
    this.pollingBusy = true;
    try {
      await this.send(command);
    } catch (error) {
      this.lastError = error instanceof Error ? error.message : "Polling failed.";
      this.emit();
    } finally {
      this.pollingBusy = false;
    }
  }

  private stopPolling() {
    if (this.fastTimer) clearInterval(this.fastTimer);
    if (this.slowTimer) clearInterval(this.slowTimer);
    this.fastTimer = null;
    this.slowTimer = null;
  }

  /** Mode 03 (stored) + mode 07 (pending) + mode 01 PID 01 (MIL status). */
  async readTroubleCodes() {
    this.stopPolling();
    try {
      const stored = await this.send("03");
      if (/NO DATA|\\?/.test(stored.toUpperCase())) {
        this.mergeCodes([], "stored");
      } else if (!hexBytes(stored.toUpperCase()).includes("43")) {
        throw new Error("ECU did not confirm the stored-code scan.");
      }
      const pending = await this.send("07");
      if (/NO DATA|\?/.test(pending)) this.mergeCodes([], "pending");
      await this.send("0101");
      return this.troubleCodes;
    } finally {
      if (this.status === "connected") this.startPolling();
    }
  }

  /** Mode 04 — clear stored DTCs and turn off the MIL, then re-read the ECM. */
  async clearTroubleCodes() {
    this.stopPolling();
    try {
      const raw = await this.send("04");
      if (!hexBytes(raw.toUpperCase()).includes("44"))
        throw new Error("ECU did not confirm clearing. Codes were not marked cleared.");
      const stored = await this.send("03");
      if (/NO DATA|\\?/.test(stored.toUpperCase())) {
        this.mergeCodes([], "stored");
      } else if (!hexBytes(stored.toUpperCase()).includes("43")) {
        throw new Error(
          "ECU confirmed the clear but did not confirm the follow-up stored-code scan.",
        );
      } else {
        const storedBytes = hexBytes(stored.toUpperCase());
        this.mergeCodes(decodeDtcBytes(storedBytes.slice(storedBytes.indexOf("43") + 1)), "stored");
      }
      const pending = await this.send("07");
      const pendingBytes = hexBytes(pending.toUpperCase());
      if (pendingBytes.includes("47"))
        this.mergeCodes(
          decodeDtcBytes(pendingBytes.slice(pendingBytes.indexOf("47") + 1)),
          "pending",
        );
      else if (/NO DATA|\?/.test(pending.toUpperCase())) this.mergeCodes([], "pending");
      await this.send("0101");
    } finally {
      if (this.status === "connected") this.startPolling();
    }
  }

  async disconnect() {
    this.stopPolling();
    this.failPending(new Error("Adapter disconnected."));
    try {
      this.socket?.close();
      if (this.device?.gatt?.connected) this.device.gatt.disconnect();
    } catch {
      /* ignore */
    }
    this.socket = null;
    this.writeChar = null;
    this.device = null;
    this.status = "disconnected";
    this.telemetry = { ...EMPTY_TELEMETRY };
    this.troubleCodes = [];
    this.bleBuffer = "";
    this.emit();
  }
}

function hex(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .toUpperCase()
    .padStart(2, "0");
}

/** Simulator helper: turn readable DTC strings back into raw response bytes. */
function encodeDtcs(codes: string[]) {
  if (codes.length === 0) return "00 00";
  return codes
    .map((c) => {
      const prefix = Math.max(0, DTC_PREFIX.indexOf(c[0] as (typeof DTC_PREFIX)[number]));
      const digits = c.slice(1).padStart(4, "0");
      const a =
        (prefix << 6) | (parseInt(digits[0] ?? "0", 16) << 4) | parseInt(digits[1] ?? "0", 16);
      const b = (parseInt(digits[2] ?? "0", 16) << 4) | parseInt(digits[3] ?? "0", 16);
      return `${hex(a)} ${hex(b)}`;
    })
    .join(" ");
}