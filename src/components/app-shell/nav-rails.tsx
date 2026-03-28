"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  BookMarked,
  House,
  Layers3,
  MapPin,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  SendHorizontal,
  ShieldCheck,
  Trophy,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Viewer } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { LogoLockup } from "@/components/blocks/logo-lockup";
import { useStoredBoolean } from "@/components/app-shell/use-stored-boolean";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";

const icons = {
  "/mata": House,
  "/alerts": Bell,
  "/score": Trophy,
  "/locker": ShieldCheck,
};

const publicNavItems = [
  { href: "/mata", label: "Mata" },
  { href: "/alerts", label: "Alerts" },
  { href: "/score", label: "Score" },
  { href: "/locker", label: "Locker" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/mata") {
    return pathname.startsWith("/mata") || pathname.startsWith("/gist");
  }

  return pathname.startsWith(href);
}

function CurrentCoverage({ viewer, compact = false }: { viewer: Viewer; compact?: boolean }) {
  const locality = viewer.location?.displayLocality ?? viewer.homeState;
  const detail = viewer.location
    ? `${viewer.location.admin2Name} · ${viewer.homeState}`
    : "Your local Mata go sharpen after your first Drop Gist.";

  if (compact) {
    return (
      <Card className="flex items-center justify-center px-2 py-4">
        <MapPin
          className="h-4 w-4 shrink-0 text-[var(--gm-ink-soft)]"
          aria-hidden="true"
        />
        <span className="sr-only">Current coverage: {viewer.homeState}</span>
      </Card>
    );
  }

  return (
    <Card className="space-y-2">
      <div className="muted-label flex items-center gap-1">
        <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
        Current coverage
      </div>
      <div className="text-lg font-bold tracking-[-0.03em]">{locality}</div>
      <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">{detail}</p>
    </Card>
  );
}

function RailLinks({
  pathname,
  collapsed = false,
  onNavigate,
}: {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Main" className="space-y-1">
      {publicNavItems.map((item) => {
        const Icon = icons[item.href as keyof typeof icons] ?? Layers3;
        const active = isActivePath(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            onClick={onNavigate}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center rounded-2xl text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
              collapsed ? "justify-center px-3 py-3" : "gap-3 px-3 py-3",
              active
                ? "bg-[var(--chip-active)] text-[var(--nav-active)]"
                : "text-[var(--nav-inactive)] hover:bg-[var(--surface-2)] hover:text-[var(--nav-active)]",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {collapsed ? (
              <span className="sr-only">{item.label}</span>
            ) : (
              <span>{item.label}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function LeftRail({ viewer }: { viewer: Viewer }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useStoredBoolean(
    "gm-public-left-rail-collapsed",
    false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Mobile top bar (sticky) ── */}
      <div className="sticky top-3 z-30 space-y-2 lg:hidden">
        <div className="panel flex items-center gap-3 rounded-[24px] px-3 py-3">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={mobileOpen}
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </Button>
          <LogoLockup href="/mata" compact className="min-w-0" />
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle compact />
            <Link href="/drop" prefetch={false} aria-label="Drop Gist">
              <Button size="sm" icon={<SendHorizontal className="h-4 w-4" aria-hidden="true" />}>
                Gist
              </Button>
            </Link>
          </div>
        </div>
        <div className="rounded-[18px] border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
          {viewer.location
            ? `${viewer.location.displayLocality} · ${viewer.homeState}`
            : `Home state: ${viewer.homeState}`}
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileOpen(false);
          }}
        >
          <div
            className="ml-auto flex h-full w-full max-w-[340px] flex-col overflow-y-auto bg-[var(--background)] px-4 py-4"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between gap-3">
              <LogoLockup href="/mata" compact />
              <div className="flex items-center gap-1">
                <ThemeToggle compact />
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <Card className="mt-4 space-y-3 p-4">
              <RailLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
              <Link href="/drop" prefetch={false} onClick={() => setMobileOpen(false)} aria-label="Drop Gist">
                <Button className="w-full" icon={<SendHorizontal className="h-4 w-4" aria-hidden="true" />}>
                  Drop Gist
                </Button>
              </Link>
            </Card>

            {/* Mata context shortcuts */}
            <div className="mt-4 space-y-1">
              <p className="muted-label px-1">Mata context</p>
              <Link
                href="/mata#street-signal"
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--nav-inactive)] hover:bg-[var(--surface-2)] hover:text-[var(--nav-active)]"
              >
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                Street signal
              </Link>
              <Link
                href="/mata#nearby-moving"
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--nav-inactive)] hover:bg-[var(--surface-2)] hover:text-[var(--nav-active)]"
              >
                <Layers3 className="h-4 w-4 shrink-0" aria-hidden="true" />
                Nearby gist moving
              </Link>
              <Link
                href="/score"
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--nav-inactive)] hover:bg-[var(--surface-2)] hover:text-[var(--nav-active)]"
              >
                <Trophy className="h-4 w-4 shrink-0" aria-hidden="true" />
                Monthly teaser
              </Link>
              <Link
                href="/locker/saved"
                prefetch={false}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-[var(--nav-inactive)] hover:bg-[var(--surface-2)] hover:text-[var(--nav-active)]"
              >
                <BookMarked className="h-4 w-4 shrink-0" aria-hidden="true" />
                Saved Gists
              </Link>
            </div>

            <div className="mt-4">
              <CurrentCoverage viewer={viewer} />
            </div>
          </div>
        </div>
      ) : null}

      {/* ── Desktop left rail (permanent) ── */}
      <aside
        className={cn(
          "hidden shrink-0 transition-[width] duration-200 lg:flex lg:flex-col lg:overflow-y-auto",
          collapsed ? "w-[72px]" : "w-[272px]",
        )}
        aria-label="Main navigation"
      >
        <div className="flex flex-col gap-4 py-4">
          <Card className={cn("space-y-3", collapsed ? "px-3 py-4" : "p-4")}>
            {/* Header row */}
            <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-between gap-2")}>
              <LogoLockup href="/mata" compact={!collapsed} mini={collapsed} />
              {!collapsed ? (
                <div className="flex items-center gap-1">
                  <ThemeToggle compact />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(true)}
                    aria-label="Collapse navigation"
                  >
                    <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              ) : null}
            </div>

            {collapsed ? (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => setCollapsed(false)}
                aria-label="Expand navigation"
                className="mx-auto"
              >
                <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : null}

            <RailLinks pathname={pathname} collapsed={collapsed} />

            {/* Drop Gist CTA */}
            <Link href="/drop" prefetch={false} aria-label="Drop Gist">
              <Button
                className={cn("w-full", collapsed && "h-12 rounded-2xl px-0")}
                icon={<SendHorizontal className="h-4 w-4" aria-hidden="true" />}
              >
                {collapsed ? <span className="sr-only">Drop Gist</span> : "Drop Gist"}
              </Button>
            </Link>
          </Card>

          <CurrentCoverage viewer={viewer} compact={collapsed} />
        </div>
      </aside>
    </>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/mata", label: "Mata", icon: House },
    { href: "/alerts", label: "Alerts", icon: Bell },
    { href: "/drop", label: "Gist", icon: SendHorizontal },
    { href: "/score", label: "Score", icon: Trophy },
    { href: "/locker", label: "Locker", icon: ShieldCheck },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/95 px-3 pt-2 backdrop-blur lg:hidden"
      aria-label="Mobile navigation"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
                active
                  ? "bg-[var(--chip-active)] text-[var(--nav-active)]"
                  : "text-[var(--nav-inactive)]",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
