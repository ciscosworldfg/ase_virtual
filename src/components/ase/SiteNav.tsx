import { Link } from "@tanstack/react-router";
import { Gauge, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/scenarios", label: "Scenarios" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/study", label: "Study Hub" },
  { to: "/diy", label: "DIY Garage" },
  { to: "/resources", label: "Resources" },
] as const;

export function SiteNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-sm border border-primary/50 bg-primary/10">
            <Gauge className="h-5 w-5 text-primary" />
          </span>
          <span className="leading-none">
            <span className="block font-display text-lg font-bold tracking-[0.18em]">
              LAT
            </span>
            <span className="label-tech block text-[0.6rem]">Learning Automotive Technology</span>
          </span>
        </Link>
        <nav className="ml-auto hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "bg-accent text-foreground" }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/onboarding"
            className="ml-2 rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start Training
          </Link>
        </nav>
        <button
          type="button"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-sm border border-border text-foreground sm:hidden"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen && (
        <nav id="mobile-navigation" className="border-t border-border bg-background px-4 py-3 sm:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="min-h-11 rounded-sm px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                activeProps={{ className: "bg-accent text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/onboarding"
              onClick={() => setMobileOpen(false)}
              className="mt-1 flex min-h-11 items-center justify-center rounded-sm bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              Start Training
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
