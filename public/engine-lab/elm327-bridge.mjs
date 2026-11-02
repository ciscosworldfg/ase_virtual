#!/usr/bin/env node
// Local-only adaptation of the user's supplied bridge. Do not import into the hosted app.
import net from 'node:net';
import https from 'node:https';
import { readFileSync } from 'node:fs';
import { WebSocketServer, WebSocket } from 'ws';

const host = process.argv[2] || '192.168.0.10';
const port = Number(process.argv[3] || 35000);
const wsPort = Number(process.argv[4] || 35001);
const origins = new Set((process.env.ELM_ALLOWED_ORIGINS || 'https://aisevirtualgarage.lovable.app,https://id-preview--c062f4a0-cad2-4f41-97f7-f305ad59c5eb.lovable.app,https://francisco-garcia-git-integration-afe1f3-ciscosworld-s-projects.vercel.app,http://localhost:8080').split(','));
const allowed = /^(ATZ|ATE0|ATL0|ATH0|ATS1|ATSP0|03|07|0101|010C|0105|010D|0104|0111|010B|010F|0106|0107|ATRV)$/;
const tls = process.env.ELM_TLS_CERT && process.env.ELM_TLS_KEY;
const server = tls ? https.createServer({ cert: readFileSync(process.env.ELM_TLS_CERT), key: readFileSync(process.env.ELM_TLS_KEY) }) : null;
const wss = new WebSocketServer({ ...(server ? { server } : { port: wsPort, host: '127.0.0.1' }), maxPayload: 64,
  verifyClient: ({ origin }, done) => done(origins.has(origin), 403, 'Origin not allowed') });
if (server) server.listen(wsPort, process.env.ELM_BIND || '127.0.0.1');
console.log(`ELM327 read-only bridge: ${tls ? 'wss' : 'ws'}://localhost:${wsPort} -> ${host}:${port}`);
let occupied = false;
wss.on('connection', ws => {
  if (occupied) { ws.close(1013, 'Adapter already in use'); return; }
  occupied = true;
  const tcp = net.createConnection({ host, port });
  let ready = false, busy = false, buffer = '', timer;
  const queue = [];
  const shutdown = () => { clearTimeout(timer); tcp.destroy(); ws.close(); };
  const next = () => {
    if (!ready || busy || !queue.length || tcp.destroyed) return;
    busy = true; tcp.write(queue.shift() + '\r');
    // A late reply must not be consumed as the next command's response.
    timer = setTimeout(shutdown, 11000);
  };
  tcp.setTimeout(20000, shutdown);
  tcp.on('connect', () => { ready = true; next(); });
  tcp.on('data', chunk => {
    buffer += chunk.toString('ascii');
    if (buffer.length > 65536) { shutdown(); return; }
    let index;
    while ((index = buffer.indexOf('>')) >= 0) {
      const frame = buffer.slice(0, index); buffer = buffer.slice(index + 1);
      if (!busy) continue; // discard unsolicited boot banners
      clearTimeout(timer); busy = false;
      if (ws.readyState === WebSocket.OPEN) ws.send(frame + '>');
      next();
    }
  });
  tcp.on('error', shutdown); tcp.on('close', () => ws.close());
  ws.on('message', data => {
    const command = String(data).trim().toUpperCase();
    if (!allowed.test(command) || queue.length >= 20) { ws.close(1008, 'Read-only command rejected'); return; }
    queue.push(command); next();
  });
  ws.on('error', shutdown);
  ws.on('close', () => { clearTimeout(timer); tcp.destroy(); occupied = false; });
});