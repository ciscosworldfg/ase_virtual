// Wi-Fi-only adaptation of the supplied elm327.ts. No ECU write/erase commands.
import { MEASUREMENTS, decodeMeasurement } from './obd-data.js';
const INIT = ['ATZ', 'ATE0', 'ATL0', 'ATH0', 'ATS1', 'ATSP0'];
const READS = new Set([...INIT, '03', '07', '0101', ...MEASUREMENTS.map(item=>item.command)]);

export function decodeDtcResponse(raw, mode) {
  if (/NO DATA/i.test(raw)) {
    if (mode === '07') return [];
    throw new Error('No stored-code response from ECU. Check ignition; previous scan was kept.');
  }
  if (/ERROR|UNABLE TO CONNECT|STOPPED|BUS INIT|\?/i.test(raw)) throw new Error('The adapter could not read trouble codes.');
  const header = mode === '03' ? '43' : '47';
  const payloads = [];
  let current = null;
  for (const line of raw.toUpperCase().split(/[\r\n]+/)) {
    const clean = line.replace(/^\s*[0-9A-F]+\s*:\s*/, '').replace(/>/g, '').trim();
    if (!/^[0-9A-F\s]+$/.test(clean)) continue;
    const compact = clean.replace(/\s/g, '');
    if (compact.length % 2) continue;
    const bytes = compact.match(/.{2}/g) || [];
    const start = bytes.indexOf(header);
    if (start >= 0) { current = bytes.slice(start + 1); payloads.push(current); }
    else if (current && /^\s*[0-9A-F]+\s*:/.test(line)) current.push(...bytes);
  }
  if (!payloads.length) throw new Error(`ECU did not confirm Mode ${mode}. Previous scan was kept.`);
  const codes = new Set();
  for (const bytes of payloads) {
    for (let i = 0; i + 1 < bytes.length; i += 2) {
      const a = parseInt(bytes[i], 16), b = parseInt(bytes[i + 1], 16);
      if (!a && !b) continue;
      codes.add('PCBU'[(a >> 6) & 3] + ((a >> 4) & 3) + (a & 15).toString(16).toUpperCase() + b.toString(16).toUpperCase().padStart(2, '0'));
    }
  }
  return [...codes];
}

export function relatedParts(code, parts) {
  const aliases = { P0100: 'P0101', P0120: 'P0121', P0339: 'P0335' };
  return parts.filter(part => part.codes.includes(aliases[code] || code));
}

export class ElmWifi {
  status = 'disconnected';
  socket = null;
  pending = null;
  chain = Promise.resolve();
  buffer = '';
  timer = null;
  codes = [];
  telemetry = {};
  lastSuccessfulScan = null;
  error = '';
  syncing = false;
  monitoring = true;
  samples = {};
  history = {};
  generation = 0;
  onChange = () => {};

  notify() { this.onChange(this); }
  async connect(address) {
    this.disconnect();
    const url = new URL(address);
    if (!['ws:', 'wss:'].includes(url.protocol) || url.username || url.password) throw new Error('Enter a ws:// or wss:// bridge address without credentials.');
    if (location.protocol === 'https:' && url.protocol === 'ws:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('This secure page requires a wss:// bridge, or a bridge running on this computer at ws://localhost:35001.');
    this.status = 'connecting'; this.error = ''; this.notify();
    try {
      const socket = new WebSocket(url.href); this.socket = socket;
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Bridge connection timed out. Check adapter Wi-Fi and the local bridge.')), 8000);
        socket.onopen = () => { clearTimeout(timeout); resolve(); };
        socket.onerror = () => { clearTimeout(timeout); reject(new Error('Bridge unavailable. Check its address, certificate, and browser local-network permission.')); };
        socket.onmessage = event => {
          if (this.socket !== socket) return;
          this.buffer += String(event.data);
          let end;
          while ((end = this.buffer.indexOf('>')) >= 0) {
            const frame = this.buffer.slice(0, end); this.buffer = this.buffer.slice(end + 1);
            const pending = this.pending; this.pending = null;
            if (pending) { clearTimeout(pending.timer); pending.resolve(frame); }
          }
        };
        socket.onclose = () => {
          clearTimeout(timeout); reject(new Error('Bridge or adapter connection closed.'));
          if (this.socket === socket) this.disconnect('Adapter disconnected. The vehicle scan is no longer live.');
        };
      });
      for (const command of INIT) {
        const raw = await this.send(command);
        if (/ERROR|\?|UNABLE TO CONNECT/i.test(raw)) throw new Error('Adapter initialization failed.');
      }
      this.status = 'connected'; this.notify();
      await this.sync();
      this.schedule();
    } catch (error) { this.disconnect(error instanceof Error ? error.message : 'Connection failed.'); throw error; }
  }
  send(command) {
    if (!READS.has(command)) return Promise.reject(new Error('Only read-only scanner commands are allowed.'));
    const socket = this.socket;
    const request = this.chain.then(() => {
      if (!socket || socket !== this.socket || socket.readyState !== 1) throw new Error('Adapter is not connected.');
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => this.disconnect(`No reply to ${command}. Check ignition and adapter Wi-Fi.`), 12000);
        this.pending = { resolve, reject, timer };
        try { socket.send(command + '\r'); } catch { this.disconnect('Could not send to adapter.'); }
      });
    });
    this.chain = request.catch(() => {}); return request;
  }
  async sync() {
    if (this.syncing || this.status !== 'connected') return;
    const generation=this.generation;
    this.syncing = true; this.notify();
    try {
      const stored = decodeDtcResponse(await this.send('03'), '03');
      const pending = decodeDtcResponse(await this.send('07'), '07');
      const monitor = await this.send('0101');
      if(generation!==this.generation)return;
      const match = monitor.replace(/\s/g, '').match(/4101([0-9A-F]{2})/i);
      if (match) this.telemetry.mil = Boolean(parseInt(match[1], 16) & 128);
      this.codes = [...stored.map(code => ({ code, status: 'stored' })), ...pending.map(code => ({ code, status: 'pending' }))];
      this.syncedAt = new Date();
      this.lastSuccessfulScan = {
        at: this.syncedAt,
        mil: this.telemetry.mil ?? null,
        codes: this.codes.map(item => ({ ...item })),
      }; this.error = '';
    } catch (error) { if(generation===this.generation)this.error = error instanceof Error ? error.message : 'DTC sync failed.'; throw error; }
    finally { if(generation===this.generation){this.syncing = false; this.notify();} }
  }
  setMonitoring(enabled) { this.monitoring=enabled;clearTimeout(this.timer);if(enabled&&this.status==='connected')this.schedule();this.notify(); }
  schedule() {
    clearTimeout(this.timer);
    const generation=this.generation;
    this.timer = setTimeout(async () => {
      try {
        for (const {command,key} of MEASUREMENTS) {
          if(!this.monitoring||generation!==this.generation||this.status!=='connected')break;
          const raw = await this.send(command);
          if(generation!==this.generation||!this.monitoring)return;
          const value=decodeMeasurement(raw,command);
          this.telemetry[key]=value;this.samples[key]={at:Date.now(),value};
          this.history[key]=[...(this.history[key]||[]),value].slice(-40);
          this.notify();
        }
        if(this.monitoring&&generation===this.generation&&this.status==='connected'&&Date.now()-(this.syncedAt?.getTime()||0)>15000)await this.sync();
      } catch (error) { if(generation===this.generation){this.error = error instanceof Error ? error.message : 'Reading failed.'; this.notify();} }
      if (generation===this.generation&&this.status === 'connected'&&this.monitoring) this.schedule();
    }, 1000);
  }
  disconnect(error = '') {
    this.generation++;
    clearTimeout(this.timer); this.timer = null;
    const socket = this.socket; this.socket = null; socket?.close();
    if (this.pending) { clearTimeout(this.pending.timer); this.pending.reject(new Error(error || 'Adapter disconnected.')); this.pending = null; }
    this.status = 'disconnected'; this.buffer = '';
    // Keep the last confirmed scan for reference, but it is stale once the adapter disconnects.
    this.samples={};this.history={};this.monitoring=true;this.syncing=false;
    this.notify(); this.error = error; this.notify();
  }
}