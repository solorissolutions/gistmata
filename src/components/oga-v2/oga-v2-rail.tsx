"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  GitBranch,
  Inbox,
  LocateFixed,
  Megaphone,
  Menu,
  Orbit,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldAlert,
  Sparkles,
  SquareActivity,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { LogoLockup } from "@/components/blocks/logo-lockup";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useStoredBoolean } from "@/components/app-shell/use-stored-boolean";
import { cn } from "@/lib/utils";
import type { OgaV2DashboardSnapshot } from "@/lib/server/oga-v2";

const ICONS = {
  "/oga-v2": BarChart3,
  "/oga-v2/intel": Orbit,
  "/oga-v2/mata": SquareActivity,
  "/oga-v2/matters": GitBranch,
  "/oga-v2/trust": ShieldAlert,
  "/oga-v2/users": Users,
  "/oga-v2/judgement-day": Sparkles,
  "/oga-v2/growth": TrendingUp,
  "/oga-v2/inbox": Inbox,
  "/oga-v2/broadcast": Megaphone,
  "/oga-v2/location": LocateFixed,
  "/oga-v2/settings": Settings,
} as const;

function getBadge(
  href: string,
  chrome: OgaV2DashboardSnapshot["chrome"],
) {
  if (href === "/oga-v2/intel") {
    return chrome.preIntelAlerts + chrome.collectionAlerts;
  }

  if (href === "/oga-v2/inbox") {
    return chrome.inboxUnread;
  }

  if (href === "/oga-v2/trust") {
    return chrome.trustQueue;
  }

  if (href === "/oga-v2/judgement-day") {
    return chrome.liveSurveys;
  }

  if (href === "/oga-v2/matters") {
    return chrome.pinnedMatters;
  }

  return null;
}

function NavLinks({
  items,
  chrome,
  pathname,
  collapsed = false,
  onNavigate,
}: {
  items: OgaV2DashboardSnapshot["routeMap"];
  chrome: OgaV2DashboardSnapshot["chrome"];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-2">
      {items.map((item) => {
        const Icon = ICONS[item.href];
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const badge = getBadge(item.href, chrome);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={cn(
              "group rounded-[20px] border text-sm transition",
              collapsed
                ? "flex items-center justify-center border-transparent px-3 py-3"
                : "flex items-start gap-3 border-transparent px-3 py-3.5",
              active
                ? "border-[var(--border-strong)] bg-[var(--surface-2)] text-[var(--foreground)]"
                : "text-[var(--nav-inactive)] hover:border-[var(--border)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]",
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            {collapsed ? (
              <span className="sr-only">{item.label}</span>
            ) : (
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate font-semibold">{item.label}</span>
                  {badge ? (
                    <span className="rounded-full bg-[var(--chip)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--chip-foreground)]">
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[var(--gm-ink-soft)]">
                  {item.description}
                </span>
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function OgaV2Rail({
  items,
  chrome,
}: {
  items: OgaV2DashboardSnapshot["routeMap"];
  chrome: OgaV2DashboardSnapshot["chrome"];
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useStoredBoolean("gm-oga-v2-rail-collapsed", false);
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
            aria-label="Open oga v2 navigation"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <LogoLockup href="/oga-v2" compact />
          <div className="rounded-full bg-[var(--chip)] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--chip-foreground)]">
            oga-v2
          </div>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden">
          <div className="ml-auto flex h-full w-full max-w-[360px] flex-col bg-[var(--background)] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <LogoLockup href="/oga-v2" compact />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close oga v2 navigation"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Card className="mt-4 space-y-4">
              <div className="space-y-1">
                <div className="muted-label">Control room</div>
                <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
                  oga-v2 is the operator control room. Access now follows the reserved oga account.
                </p>
              </div>
              <NavLinks
                items={items}
                chrome={chrome}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </Card>
          </div>
        </div>
      ) : null}

      <aside
        className={cn(
          "hidden shrink-0 transition-[width] duration-200 lg:block",
          collapsed ? "w-[98px]" : "w-[320px]",
        )}
      >
        <div className="sticky top-4">
          <Card className={cn("space-y-5", collapsed ? "px-3 py-4" : "p-5")}>
            <div
              className={cn(
                "flex items-center",
                collapsed ? "justify-center" : "justify-between gap-3",
              )}
            >
              <LogoLockup href="/oga-v2" compact={!collapsed} mini={collapsed} />
              {!collapsed ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(true)}
                  aria-label="Collapse oga v2 navigation"
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
                aria-label="Expand oga v2 navigation"
                className="mx-auto"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            ) : (
              <div className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-2)] px-4 py-4">
                <div className="muted-label">Ops state</div>
                <div className="mt-3 grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Intel live alerts</span>
                    <span className="font-semibold">{chrome.preIntelAlerts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Intel collection gaps</span>
                    <span className="font-semibold">{chrome.collectionAlerts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Inbox unread</span>
                    <span className="font-semibold">{chrome.inboxUnread}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Trust queue</span>
                    <span className="font-semibold">{chrome.trustQueue}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Live surveys</span>
                    <span className="font-semibold">{chrome.liveSurveys}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pinned matas</span>
                    <span className="font-semibold">{chrome.pinnedMatters}</span>
                  </div>
                </div>
              </div>
            )}

            <NavLinks
              items={items}
              chrome={chrome}
              pathname={pathname}
              collapsed={collapsed}
            />

            {!collapsed ? (
              <div className="rounded-[22px] border border-dashed border-[var(--border)] px-4 py-4 text-xs leading-6 text-[var(--gm-ink-soft)]">
                Legacy `/oga` requests now redirect into this control room so oga-v2 is the only operator surface.
              </div>
            ) : null}
          </Card>
        </div>
      </aside>
    </>
  );
}
