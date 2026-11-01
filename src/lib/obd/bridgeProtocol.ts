/**
 * AISE Virtual <-> Android ELM327 bridge wire protocol.
 *
 * This module validates untrusted bridge messages and decodes a limited,
 * explicitly read-only set of OBD-II responses. Native Android code must
 * independently enforce the same command allowlist.
 */

export type ElmErrorMessage = "NO DATA" | "UNABLE TO CONNECT" | "BUS ERROR" | "timeout";
export type ElmProtocolEvent = "disconnected" | "searching" | "protocolFound";

export interface ElmStatusMessage {
  type: "status";
  connected: boolean;
  elmVersion?: string;
  protocol?: string;
  voltage?: string;
  error?: string;
}
export interface ElmResponseMessage {
  type: "response";
  id: string;
  cmd: string;
  raw: string;
  success: boolean;
  decoded?: string;
}
export interface ElmErrorEventMessage {
  type: "error";
  id?: string;
  message: ElmErrorMessage;
}
export interface ElmEventMessage {
  type: "event";
  event: ElmProtocolEvent;
}
export type ElmBridgeMessage =
  | ElmStatusMessage
  | ElmResponseMessage
  | ElmErrorEventMessage
  | ElmEventMessage;

const ERROR_MESSAGES: readonly string[] = ["NO DATA", "UNABLE TO CONNECT", "BUS ERROR", "timeout"];
const PROTOCOL_EVENTS: readonly string[] = ["disconnected", "searching", "protocolFound"];

export function parseElmBridgeMessage(input: unknown): ElmBridgeMessage | null {
  let value: unknown = input;
  if (typeof input === "string") {
    try { value = JSON.parse(input); } catch { return null; }
  }
  if (!value || typeof value !== "object") return null;
  const message = value as Record<string, unknown>;

  switch (message.type) {
    case "status":
      if (typeof message.connected !== "boolean") return null;
      return {
        type: "status",
        connected: message.connected,
        ...(typeof message.elmVersion === "string" ? { elmVersion: message.elmVersion } : {}),
        ...(typeof message.protocol === "string" ? { protocol: message.protocol } : {}),
        ...(typeof message.voltage === "string" ? { voltage: message.voltage } : {}),
        ...(typeof message.error === "string" ? { error: message.error } : {}),
      };
    case "response":
      if (typeof message.id !== "string" || typeof message.cmd !== "string" ||
          typeof message.raw !== "string" || typeof message.success !== "boolean") return null;
      return {
        type: "response", id: message.id, cmd: message.cmd.toUpperCase(),
        raw: message.raw, success: message.success,
        ...(typeof message.decoded === "string" ? { decoded: message.decoded } : {}),
      };
    case "error":
      if (typeof message.message !== "string" || !ERROR_MESSAGES.includes(message.message)) return null;
      return {
        type: "error", message: message.message as ElmErrorMessage,
        ...(typeof message.id === "string" ? { id: message.id } : {}),
      };
    case "event":
      if (typeof message.event !== "string" || !PROTOCOL_EVENTS.includes(message.event)) return null;
      return { type: "event", event: message.event as ElmProtocolEvent };
    default:
      return null;
  }
}

export interface ElmConnectRequest { type: "connect"; host: string; port: number; }
export interface ElmCommandRequest { type: "command"; id: string; cmd: string; }
export interface ElmDisconnectRequest { type: "disconnect"; }
export interface ElmStatusRequest { type: "status"; }
export type ElmBridgeRequest = ElmConnectRequest | ElmCommandRequest | ElmDisconnectRequest | ElmStatusRequest;

// Mode 01, emissions DTC reads, and a narrow Mode 02 freeze-frame subset.
// Never add Mode 04, actuator controls, arbitrary AT commands, or ECU writes.
const ALLOWED_OBD_COMMANDS = new Set([
  "0100", "0101", "0104", "0105", "010B", "010C", "010D", "010F", "0110", "0111",
  "0114", "0115", "03", "07", "0A",
  "0200", "020200", "020400", "020500", "020C00", "020D00",
]);

function isPrivateIpv4(host: string): boolean {
  const octets = host.split(".");
  if (octets.length !== 4 || octets.some((part) => !/^\d{1,3}$/.test(part))) return false;
  const values = octets.map(Number);
  if (values.some((value) => value < 0 || value > 255)) return false;
  const [a, b] = values;
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

export function parseElmBridgeRequest(input: unknown): ElmBridgeRequest | null {
  let value: unknown = input;
  if (typeof input === "string") {
    try { value = JSON.parse(input); } catch { return null; }
  }
  if (!value || typeof value !== "object") return null;
  const request = value as Record<string, unknown>;

  switch (request.type) {
    case "connect":
      if (typeof request.host !== "string" || !isPrivateIpv4(request.host) ||
          typeof request.port !== "number" || !Number.isInteger(request.port) ||
          request.port < 1 || request.port > 65535) return null;
      return { type: "connect", host: request.host, port: request.port };
    case "command": {
      if (typeof request.id !== "string" || request.id.length < 1 || request.id.length > 80 ||
          typeof request.cmd !== "string") return null;
      const cmd = request.cmd.replace(/\s+/g, "").toUpperCase();
      if (!ALLOWED_OBD_COMMANDS.has(cmd)) return null;
      return { type: "command", id: request.id, cmd };
    }
    case "disconnect": return { type: "disconnect" };
    case "status": return { type: "status" };
    default: return null;
  }
}

export function serializeElmBridgeRequest(input: unknown): string | null {
  const request = parseElmBridgeRequest(input);
  return request ? JSON.stringify(request) : null;
}

/** Parse byte pairs from either spaced or compact ELM output. */
export function parseElmHexBytes(raw: string): number[] {
  const normalized = raw
    .replace(/SEARCHING\.\.\./gi, "")
    .replace(/(?:NO DATA|UNABLE TO CONNECT|BUS ERROR|CAN ERROR|STOPPED|ERROR)/gi, "")
    .replace(/[>?\r\n\t ]/g, "")
    .toUpperCase();
  if (!normalized || !/^(?:[0-9A-F]{2})+$/.test(normalized)) return [];
  return normalized.match(/[0-9A-F]{2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? [];
}

function findPidPayload(raw: string, service: number, pid: number, minimumLength: number): number[] | null {
  const bytes = parseElmHexBytes(raw);
  for (let i = 0; i <= bytes.length - minimumLength; i += 1) {
    if (bytes[i] === service && bytes[i + 1] === pid) return bytes.slice(i + 2);
  }
  return null;
}

export function decodeMode01Pid(cmd: string, raw: string): { label: string; value: string } | null {
  const normalized = cmd.replace(/\s/g, "").toUpperCase();
  const pid = Number.parseInt(normalized.slice(2), 16);
  if (!/^01[0-9A-F]{2}$/.test(normalized)) return null;
  const data = findPidPayload(raw, 0x41, pid, 3);
  if (!data || data.length < 1) return null;
  const a = data[0];
  switch (normalized) {
    case "0104": return { label: "Engine load", value: `${((a * 100) / 255).toFixed(1)} %` };
    case "0105": return { label: "Coolant temperature", value: `${a - 40} °C` };
    case "010C":
      if (data.length < 2) return null;
      return { label: "Engine RPM", value: `${((a * 256 + data[1]) / 4).toFixed(0)} rpm` };
    case "010D": return { label: "Vehicle speed", value: `${a} km/h` };
    case "0111": return { label: "Throttle", value: `${((a * 100) / 255).toFixed(1)} %` };
    default: return null;
  }
}

export function decodeEngineRpm(raw: string): number | null {
  const decoded = decodeMode01Pid("010C", raw);
  if (!decoded) return null;
  const value = Number.parseFloat(decoded.value);
  return Number.isFinite(value) ? value : null;
}

export function decodeDtcs(raw: string): string[] | null {
  const bytes = parseElmHexBytes(raw);
  if (!bytes.length) return null;
  const start = [0x43, 0x47, 0x4a].includes(bytes[0]) ? 1 : -1;
  if (start < 0) return null;
  const codes: string[] = [];
  for (let i = start; i + 1 < bytes.length; i += 2) {
    const firstByte = bytes[i];
    const secondByte = bytes[i + 1];
    if (firstByte === 0 && secondByte === 0) continue;
    const prefix = ["P", "C", "B", "U"][(firstByte >> 6) & 0x03];
    const digit = ((firstByte >> 4) & 0x03).toString(16).toUpperCase();
    const suffix = ((firstByte & 0x0f) << 8 | secondByte).toString(16).toUpperCase().padStart(3, "0");
    codes.push(`${prefix}${digit}${suffix}`);
  }
  return codes;
}
