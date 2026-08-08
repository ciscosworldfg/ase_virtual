import { Progress } from "@/components/ui/progress";
import type { LiveDataFrame } from "@/lib/sim/engine";
import type { Vehicle } from "@/lib/sim/types";
import { AlertTriangle, BatteryCharging, Droplets, Thermometer } from "lucide-react";

export function Cluster({
  data,
  vehicle,
  warningLights,
  running,
}: {
  data: LiveDataFrame;
  vehicle: Vehicle;
  warningLights: string[];
  running: boolean;
}) {
  const rpmPct = Math.min(100, (data.rpm / vehicle.redline) * 100);

  return (
    <div className="panel-instrument p-5">
      <div className="flex items-baseline justify-between">
        <span className="label-tech">Instrument cluster</span>
        <span className={`label-tech ${running ? "text-ok" : "text-muted-foreground"}`}>
          {running ? "Engine running" : "Key off"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <Readout label="Speed" value={data.speed} unit="km/h" big />
        <Readout label="RPM" value={data.rpm} unit="rpm" big accent />
      </div>

      <div className="mt-4">
        <Progress value={rpmPct} className="h-2" />
        <div className="mt-1 flex justify-between">
          <span className="readout text-[0.65rem] text-muted-foreground">0</span>
          <span className="readout text-[0.65rem] text-destructive">
            redline {vehicle.redline}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Mini icon={Thermometer} label="Coolant" value={`${data.coolant} °C`} />
        <Mini icon={Droplets} label="Oil pressure" value={`${data.oilPressure} psi`} />
        <Mini icon={BatteryCharging} label="System volts" value={`${data.batteryVoltage} V`} />
        <Mini icon={AlertTriangle} label="Misfire count" value={`${data.misfireCount}`} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {warningLights.length === 0 && (
          <span className="label-tech text-muted-foreground">No active indicators</span>
        )}
        {warningLights.map((w) => (
          <span
            key={w}
            className="rounded-sm border border-caution/60 bg-caution/15 px-2.5 py-1 text-xs font-semibold text-caution"
          >
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  unit,
  big,
  accent,
}: {
  label: string;
  value: number;
  unit: string;
  big?: boolean;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="label-tech">{label}</div>
      <div
        className={`readout font-semibold ${big ? "text-4xl" : "text-xl"} ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
        <span className="ml-1 text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function Mini({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Thermometer;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-sm border border-border bg-panel px-3 py-2">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-signal" />
        <span className="label-tech">{label}</span>
      </div>
      <div className="readout mt-1 text-sm">{value}</div>
    </div>
  );
}
