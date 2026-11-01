import { MEASUREMENTS } from './obd-data.js';

export function createObdDashboard(container,client){
  container.innerHTML=`<div class="dashboard-heading"><div><h2>OBD-II live monitor</h2><span id="monitor-state" class="mut">Awaiting vehicle connection</span></div><button id="monitor-toggle" title="Pause live readings" aria-label="Pause live readings" disabled>Ⅱ</button></div><div class="dashboard-summary"><span id="monitor-source">VEHICLE DATA ONLY</span><span id="monitor-mil">MIL —</span><span id="monitor-codes">No vehicle scan</span></div><div class="measurement-grid">${MEASUREMENTS.map(spec=>`<article class="measurement" data-key="${spec.key}"><div class="measurement-label">${spec.label}</div><div class="measurement-value"><strong>—</strong><span>${spec.unit}</span></div><canvas width="160" height="30" aria-label="${spec.label} recent readings"></canvas><small>Not connected</small></article>`).join('')}</div>`;
  const toggle=container.querySelector('#monitor-toggle');
  toggle.onclick=()=>client.setMonitoring(!client.monitoring);
  const css=getComputedStyle(document.documentElement),color=css.getPropertyValue('--acc').trim();
  function render(){
    const connected=client.status==='connected';
    toggle.disabled=!connected;toggle.textContent=client.monitoring?'Ⅱ':'▶';toggle.title=client.monitoring?'Pause live readings':'Resume live readings';toggle.setAttribute('aria-label',toggle.title);
    container.querySelector('#monitor-state').textContent=connected?(client.monitoring?'Live · sequential sensor updates':'Paused · readings frozen'):client.status==='connecting'?'Connecting…':'Awaiting vehicle connection';
    container.querySelector('#monitor-source').textContent=connected?(client.monitoring?'LIVE VEHICLE · READ ONLY':'PAUSED VEHICLE SNAPSHOT'):'VEHICLE DATA ONLY';
    container.querySelector('#monitor-mil').textContent=`MIL ${connected&&client.telemetry.mil!=null?(client.telemetry.mil?'ON':'OFF'):'—'}`;
    container.querySelector('#monitor-mil').classList.toggle('mil-on',connected&&client.telemetry.mil===true);
    container.querySelector('#monitor-codes').textContent=connected&&client.syncedAt?`${client.codes.filter(c=>c.status==='stored').length} stored · ${client.codes.filter(c=>c.status==='pending').length} pending`:'No vehicle scan';
    for(const spec of MEASUREMENTS){
      const tile=container.querySelector(`[data-key="${spec.key}"]`),sample=client.samples[spec.key],age=sample?Math.floor((Date.now()-sample.at)/1000):null;
      const value=connected?client.telemetry[spec.key]:null;
      tile.querySelector('strong').textContent=value==null?'—':value.toLocaleString(undefined,{maximumFractionDigits:spec.key==='rpm'||spec.key==='speed'?0:1});
      tile.querySelector('small').textContent=!connected?'Not connected':!sample?'Waiting for reply':value==null?'Unavailable reply':!client.monitoring?`Paused · ${age}s ago`:age>15?`Stale · ${age}s ago`:`Updated ${age}s ago`;
      tile.classList.toggle('stale',connected&&sample&&age>15);
      const canvas=tile.querySelector('canvas'),ctx=canvas.getContext('2d');if(!ctx)continue;
      ctx.clearRect(0,0,160,30);ctx.strokeStyle=color;ctx.lineWidth=1.8;ctx.beginPath();
      const history=connected?(client.history[spec.key]||[]):[];let drawing=false;
      const finite=history.filter(v=>v!=null);const low=Math.min(0,...finite),high=Math.max(spec.max,...finite),range=high-low||1;
      history.forEach((v,i)=>{if(v==null){drawing=false;return}const x=i*160/39,y=27-(v-low)/range*24;if(drawing)ctx.lineTo(x,y);else ctx.moveTo(x,y);drawing=true});ctx.stroke();
    }
  }
  render();const timer=setInterval(render,1000);window.addEventListener('pagehide',()=>clearInterval(timer),{once:true});return {render};
}