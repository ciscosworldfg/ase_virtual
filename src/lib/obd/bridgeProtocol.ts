/**
 * AISE Virtual <-> Android ELM327 bridge wire protocol.
 *
 * Messages are JSON objects delivered by the native Android host. This module
 * validates incoming messages and decodes only explicitly supported read-only
 * OBD-II responses. It does not send adapter commands.
 */

export type ElmErrorMessage =
  | "NO DATA"
  | "UNABLE TO CONNECT"
  | "BUS ERROR"
  | "timeout";

export type ElmProtocolEvent = "disconnected" | "searching" | "protocolFound";

export interface ElmStatusMessage {
  type: "status";
  connected: boolean;
  elmVersion?: string;
  protocol?: string;
  voltage?: string;
}

export interface ElmResponseMessage {
  type: "response";
  id: string;
  cmd: string;
  raw: string;
  success: boolean;
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

const ERROR_MESSAGES: readonly string[] = [
  "NO DATA",
  "UNABLE TO CONNECT",
  "BUS ERROR",
  "timeout",
];

const PROTOCOL_EVENTS: readonly string[] = [
  "disconnected",
  "searching",
  "protocolFound",
];

/** Parse an untrusted JSON message from the native bridge. */
export function parseElmBridgeMessage(input: unknown): ElmBridgeMessage | null {
  let value: unknown = input;

  if (typeof input === "string") {
    try {
      value = JSON.parse(input);
    } catch {
      return null;
    }
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
      };
    case "response":
      if (
        typeof message.id !== "string" ||
        typeof message.cmd !== "string" ||
        typeof message.raw !== "string" ||
        typeof message.success !== "boolean"
      ) return null;
      return {
        type: "response",
        id: message.id,
        cmd: message.cmd.toUpperCase(),
        raw: message.raw,
        success: message.success,
      };
    case "error":
      if (
        typeof message.message !== "string" ||
        !ERROR_MESSAGES.includes(message.message)
      ) return null;
      return {
        type: "error",
        message: message.message as ElmErrorMessage,
        ...(typeof message.id === "string" ? { id: message.id } : {}),
      };
    case "event":
      if (
        typeof message.event !== "string" ||
        !PROTOCOL_EVENTS.includes(message.event)
      ) return null;
      return { type: "event", event: message.event as ElmProtocolEvent };
    default:
      return null;
  }
}

/**
 * Decode the Mode 01 PID 0C response.
 * Example: 41 0C 1A F8 => (0x1AF8 / 4) = 1726 RPM.
 */
export function decodeEngineRpm(raw: string): number | null {
  const bytes = raw.match(/[0-9A-Fa-f]{2}/g)?.map((byte) => Number.parseInt(byte, 16));
  if (!bytes || bytes.length < 4) return null;

  for (let index = 0; index <= bytes.length - 4; index += 1) {
    if (bytes[index] === 0x41 && bytes[index + 1] === 0x0c) {
      return ((bytes[index + 2] * 256) + bytes[index + 3]) / 4;
    }
  }
  return null;
}


/** Requests sent from the AISE web UI to the trusted Android host. */
export interface ElmConnectRequest {
  type: "connect";
  host: string;
  port: number;
}
export interface ElmCommandRequest {
  type: "command";
  id: string;
  cmd: string;
}
export interface ElmDisconnectRequest {
  type: "disconnect";
}
export interface ElmStatusRequest {
  type: "status";
}
export type ElmBridgeRequest =
  | ElmConnectRequest
  | ElmCommandRequest
  | ElmDisconnectRequest
  | ElmStatusRequest;

// Only standard, read-only emissions diagnostics are permitted from web content.
// No AT commands, service 04 (clear DTCs), actuator tests, or ECU write services.
const ALLOWED_OBD_COMMANDS = new Set([
  "0100", "0105", "010B", "010C", "010D", "010F", "0110", "0111",
  "0114", "0115", "03", "07",
]);

function isPrivateIpv4(host: string): boolean {
  const octets = host.split(".");
  if (octets.length !== 4 || octets.some((part) => !/^\\d{1,3}$/.test(part))) {
    return false;
  }
  const values = octets.map(Number);
  if (values.some((value) => value < 0 || value > 255)) return false;
  const [a, b] = values;
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

/** Validate and normalize a web-to-native request before passing it to Android. */
export function parseElmBridgeRequest(input: unknown): ElmBridgeRequest | null {
  let value: unknown = input;
  if (typeof input === "string") {
    try {
      value = JSON.parse(input);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") return null;
  const request = value as Record<string, unknown>;

  switch (request.type) {
    case "connect":
      if (
        typeof request.host !== "string" ||
        !isPrivateIpv4(request.host) ||
        typeof request.port !== "number" ||
        !Number.isInteger(request.port) ||
        request.port < 1 ||
        request.port > 65535
      ) return null;
      return { type: "connect", host: request.host, port: request.port };
    case "command": {
      if (typeof request.id !== "string" || request.id.length < 1 || request.id.length > 80 ||
          typeof request.cmd !== "string") return null;
      const cmd = request.cmd.replace(/\\s+/g, "").toUpperCase();
      if (!ALLOWED_OBD_COMMANDS.has(cmd)) return null;
      return { type: "command", id: request.id, cmd };
    }
    case "disconnect":
      return { type: "disconnect" };
    case "status":
      return { type: "status" };
    default:
      return null;
  }
}

/** Serialize a validated request for the native Android bridge. */
export function serializeElmBridgeRequest(input: unknown): string | null {
  const request = parseElmBridgeRequest(input);
  return request ? JSON.stringify(request) : null;
}
