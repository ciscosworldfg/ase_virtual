// Standard Mode 01 measurements; ranges below are chart scales, not diagnostic limits.
export const MEASUREMENTS = [
  { command:'010C', key:'rpm', label:'Engine speed', unit:'rpm', max:8000, bytes:2, decode:(a,b)=>(a*256+b)/4 },
  { command:'0105', key:'coolant', label:'Coolant', unit:'°C / °F', max:160, bytes:1, decode:a=>a-40 },
  { command:'ATRV', key:'voltage', label:'Adapter voltage', unit:'V', max:20 },
  { command:'010D', key:'speed', label:'Vehicle speed', unit:'km/h / mph', max:255, bytes:1, decode:a=>a },
  { command:'0104', key:'load', label:'Calculated load', unit:'%', max:100, bytes:1, decode:a=>a*100/255 },
  { command:'0111', key:'throttle', label:'Throttle position', unit:'%', max:100, bytes:1, decode:a=>a*100/255 },
  { command:'010B', key:'map', label:'Manifold pressure', unit:'kPa', max:255, bytes:1, decode:a=>a },
  { command:'010F', key:'iat', label:'Intake air', unit:'°C', max:160, bytes:1, decode:a=>a-40 },
  { command:'0106', key:'stft', label:'Short fuel trim · B1', unit:'%', max:100, bytes:1, decode:a=>(a-128)*100/128 },
  { command:'0107', key:'ltft', label:'Long fuel trim · B1', unit:'%', max:100, bytes:1, decode:a=>(a-128)*100/128 },
];

export const celsiusToFahrenheit = celsius => celsius * 9 / 5 + 32;
export const kmhToMph = kmh => kmh / 1.609344;

export function decodeMeasurement(raw, command) {
  const spec=MEASUREMENTS.find(item=>item.command===command);
  if(!spec || /NO DATA|ERROR|UNABLE TO CONNECT|STOPPED|\?/i.test(raw))return null;
  if(command==='ATRV'){const match=raw.match(/(\d{1,2}(?:\.\d+)?)\s*V/i);return match?Number(match[1]):null}
  for(const line of raw.toUpperCase().split(/[\r\n]+/)){
    const clean=line.replace(/^\s*[0-9A-F]+\s*:\s*/,'').replace(/>/g,'').trim();
    if(!/^[0-9A-F\s]+$/.test(clean))continue;
    const compact=clean.replace(/\s/g,'');if(compact.length%2)continue;
    const bytes=compact.match(/.{2}/g)||[];
    const index=bytes.findIndex((b,i)=>b==='41'&&bytes[i+1]===command.slice(2));
    if(index<0||bytes.length<index+2+spec.bytes)continue;
    return spec.decode(...bytes.slice(index+2,index+2+spec.bytes).map(b=>parseInt(b,16)));
  }
  return null;
}