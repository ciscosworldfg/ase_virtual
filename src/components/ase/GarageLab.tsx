import { useEffect, useRef, useState } from "react";
import { GARAGE_PROTOCOL, partsForFailure } from "@/lib/garage/scenario-map";

export function GarageLab({
  failureId,
  onUse,
}: {
  failureId: string;
  onUse?: () => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [used, setUsed] = useState(false);
  const parts = partsForFailure(failureId);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.v !== GARAGE_PROTOCOL
      ) {
        return;
      }

      if (
        (event.data.type === "focused" || event.data.type === "part-selected") &&
        !used
      ) {
        setUsed(true);
        onUse?.();
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [onUse, used]);

  const focusRelatedSystems = () => {
    frame.current?.contentWindow?.postMessage(
      { v: GARAGE_PROTOCOL, type: "focus", parts },
      window.location.origin,
    );
  };

  return (
    <section className="space-y-3">
      <div className="rounded-sm border border-border bg-card p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold uppercase tracking-wide">
              Interactive 3D Engine Lab
            </h2>
            <p className="text-xs text-muted-foreground">
              Generic educational V6 model · not OEM CAD or a verified J35A6
            </p>
          </div>
          {parts.length > 0 && (
            <button
              type="button"
              onClick={focusRelatedSystems}
              className="rounded-sm bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
            >
              Show related systems
            </button>
          )}
        </div>
      </div>

      <iframe
        ref={frame}
        src="/engine-lab/index.html"
        title="Interactive 3D engine lab"
        className="h-[72vh] min-h-[520px] w-full rounded-sm border border-border bg-background"
        loading="lazy"
      />

      {parts.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          This scenario has no verified component mapping in the current generic engine model. You can still inspect and select engine components, but the lab will not imply that a selected engine part caused a brake, transmission, chassis, or other unmapped fault.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Highlighted parts are related training systems, not confirmed failed components. Confirm every diagnosis with vehicle-specific service information and tests.
        </p>
      )}
    </section>
  );
}
