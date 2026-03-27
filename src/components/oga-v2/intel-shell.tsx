"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Orbit, Radar, Search } from "lucide-react";

import { cn } from "@/lib/utils";

const INTEL_ITEMS = [
  {
    href: "/oga-v2/intel",
    label: "Intel hub",
    description: "Entry point into the intel tool and its legal operating lanes.",
    icon: Orbit,
  },
  {
    href: "/oga-v2/intel/collection",
    label: "Collection",
    description: "Source coverage, ingest health, and pipeline boundaries.",
    icon: Radar,
  },
  {
    href: "/oga-v2/intel/live",
    label: "Live signals",
    description: "Heat zones, trend alerts, referral clusters, and deep search.",
    icon: Search,
  },
] as const;

export function IntelShell() {
  const pathname = usePathname();

  return (
    <section className="panel space-y-4 px-4 py-4 sm:px-5">
      <div className="space-y-2">
        <p className="muted-label">Intel tool</p>
        <h2 className="text-lg font-extrabold tracking-[-0.04em]">A separate operator world</h2>
        <p className="max-w-3xl text-sm leading-6 text-[var(--gm-ink-soft)]">
          This surface aggregates legal, platform-native intelligence only. Collection,
          live signal reading, and deep search stay together here instead of leaking into the
          rest of oga-v2.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        {INTEL_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/oga-v2/intel"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-[22px] border px-4 py-4 transition",
                active
                  ? "border-[var(--border-strong)] bg-[var(--surface-2)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)]",
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "rounded-full p-2",
                    active ? "bg-[var(--chip-active)]" : "bg-[var(--chip)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="font-semibold">{item.label}</div>
              </div>
              <div className="mt-3 text-sm leading-6 text-[var(--gm-ink-soft)]">
                {item.description}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
