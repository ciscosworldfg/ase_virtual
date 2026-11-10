#!/usr/bin/env node
/**
 * Honky ELM327 Wi-Fi bridge.
 * Browsers cannot open raw TCP sockets, so this relays the dashboard's
 * WebSocket to the dongle's TCP port (default 192.168.0.10:35000).
 *
 * Usage:
 *   npm i ws
 *   node scripts/elm327-bridge.mjs [dongleHost] [donglePort] [wsPort]
 *   e.g. node scripts/elm327-bridge.mjs 192.168.0.10 35000 35001
 *
 * Commands are queued and sent one at a time: the next command only goes
 * out after the dongle answers with its ">" prompt (or after 2s timeout).
 */
import net from "node:net";
import { WebSocketServer } from "ws";

const HOST = process.argv[2] ?? "192.168.0.10";
const PORT = Number(process.argv[3] ?? 35000);
const WS_PORT = Number(process.argv[4] ?? 35001);

const wss = new WebSocketServer({ host: "127.0.0.1", port: WS_PORT });
console.log(`[bridge] ws://127.0.0.1:${WS_PORT}  ->  tcp://${HOST}:${PORT}`);

wss.on("connection", (ws) => {
  console.log("[bridge] dashboard connected, dialing dongle...");
  const tcp = net.createConnection({ host: HOST, port: PORT });
  const queue = [];
  let busy = false;
  let buf = "";
  let timer = null;

  const next = () => {
    if (busy || queue.length === 0 || tcp.destroyed) return;
    const cmd = queue.shift();
    busy = true;
    tcp.write(cmd.endsWith("\r") ? cmd : `${cmd}\r`);
    timer = setTimeout(() => {
      console.error(`[bridge] no ELM327 prompt within 10s for command ${cmd}; closing to avoid response desynchronization`);
      tcp.destroy(new Error("ELM327 response timeout"));
      ws.close();
    }, 10000);
  };

  tcp.on("connect", () => console.log("[bridge] dongle connected"));
  tcp.on("data", (chunk) => {
    buf += chunk.toString("ascii");
    let idx;
    while ((idx = buf.indexOf(">")) !== -1) {
      const frame = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      clearTimeout(timer);
      busy = false;
      if (frame && ws.readyState === ws.OPEN) ws.send(frame);
      next();
    }
  });
  tcp.on("error", (e) => {
    console.error("[bridge] tcp error:", e.message);
    ws.close();
  });
  tcp.on("close", () => {
    console.log("[bridge] dongle closed");
    ws.close();
  });

  ws.on("message", (m) => {
    const cmd = String(m).trim();
    if (!cmd) return;
    if (queue.length > 20) queue.shift(); // drop stale polls
    queue.push(cmd);
    next();
  });
  ws.on("close", () => {
    console.log("[bridge] dashboard left");
    tcp.destroy();
  });
});