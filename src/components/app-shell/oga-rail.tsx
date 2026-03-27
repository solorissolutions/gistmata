"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Flag,
  LocateFixed,
  Megaphone,
  MessageSquare,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shield,
  Sparkles,
  SquareActivity,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogoLockup } from "@/components/blocks/logo-lockup";
import { cn } from "@/lib/utils";
import { useStoredBoolean } from "@/components/app-shell/use-stored-boolean";

const items = [
  { href: "/oga", label: "Overview", icon: BarChart3 },
  { href: "/oga/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/oga/mata", label: "Mata Monitor", icon: SquareActivity },
  { href: "/oga/gists", label: "Gists", icon: Flag },
  { href: "/oga/trust", label: "Trust", icon: Shield },
  { href: "/oga/users", label: "Users", icon: Users },
  { href: "/oga/judgement-day", label: "Judgement Day", icon: Sparkles },
  { href: "/oga/growth", label: "Growth", icon: Ticket },
  { href: "/oga/broadcast", label: "Broadcast", icon: Megaphone },
  { href: "/oga/location", label: "Location", icon: LocateFixed },
  { href: "/oga/settings", label: "Settings", icon: Settings },
];

function OgaLinks({
  pathname,
  collapsed = false,
  onNavigate,
}: {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center rounded-2xl text-sm font-semibold transition",
              collapsed ? "justify-center px-3 py-3" : "gap-3 px-3 py-3",
              active
                ? "bg-[var(--chip-active)] text-[var(--nav-active)]"
                : "text-[var(--nav-inactive)] hover:bg-[var(--surface-2)] hover:text-[var(--nav-active)]",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {collapsed ? <span className="sr-only">{item.label}</span> : item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function OgaRail() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useStoredBoolean("gm-oga-left-rail-collapsed", false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="sticky top-3 z-30 lg:hidden">
        <div className="panel flex items-center justify-between gap-3 rounded-[24px] px-3 py-3">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open oga navigation"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <LogoLockup href="/oga" compact />
          <div className="rounded-full bg-[var(--chip)] px-3 py-2 text-xs font-semibold text-[var(--chip-foreground)]">
            oga
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden">
          <div className="ml-auto flex h-full w-full max-w-[340px] flex-col bg-[var(--background)] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <LogoLockup href="/oga" compact />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close oga navigation"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Card className="mt-4 space-y-4">
              <div className="muted-label">Oga controls</div>
              <OgaLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </Card>
          </div>
        </div>
      ) : null}

      <aside
        className={cn(
          "hidden shrink-0 transition-[width] duration-200 lg:block",
          collapsed ? "w-[96px]" : "w-[280px]",
        )}
      >
        <div className="sticky top-4">
          <Card className={cn("space-y-5", collapsed ? "px-3 py-4" : "p-5")}>
            <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between gap-3")}>
              <LogoLockup href="/oga" compact={!collapsed} mini={collapsed} />
              {!collapsed ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(true)}
                  aria-label="Collapse oga navigation"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              ) : null}
            </div>

            {collapsed ? (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => setCollapsed(false)}
                aria-label="Expand oga navigation"
                className="mx-auto"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            ) : null}

            <OgaLinks pathname={pathname} collapsed={collapsed} />
          </Card>
        </div>
      </aside>
    </>
  );
}
