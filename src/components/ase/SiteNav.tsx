import { Link } from "@tanstack/react-router";
import { Gauge } from "lucide-react";

const links = [
  { to: "/scenarios", label: "Scenarios" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/study", label: "Study Hub" },
  { to: "/diy", label: "DIY Garage" },
] as const;

export function SiteNav() {
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
      </div>
    </header>
  );
}
