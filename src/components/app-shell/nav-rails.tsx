"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Feather,
  Home,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Trophy,
  User,
} from "lucide-react";
import { useState } from "react";

import type { Viewer } from "@/lib/domain/types";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/app-shell/theme-toggle";

const navItems = [
  { href: "/mata", label: "Home", icon: Home },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/score", label: "Score", icon: Trophy },
  { href: "/locker", label: "Locker", icon: ShieldCheck },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/mata") {
    return pathname.startsWith("/mata") || pathname.startsWith("/gist");
  }
  return pathname.startsWith(href);
}

export function LeftRail({ viewer }: { viewer: Viewer }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <aside className="nav-sidebar" aria-label="Main navigation">
      <div className="flex h-full flex-col px-3 py-2">
        {/* Logo */}
        <Link
          href="/mata"
          className="mb-1 flex h-[52px] w-[52px] items-center justify-center rounded-full transition-colors hover:bg-[var(--nav-hover)]"
          aria-label="GistMata Home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-black text-[var(--accent-foreground)]">
            GM
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={cn("nav-item", active && "active")}
              >
                <Icon
                  className="h-[26px] w-[26px]"
                  strokeWidth={active ? 2.5 : 2}
                  aria-hidden="true"
                />
                <span className="hidden xl:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Drop Gist button */}
        <Link href="/drop" prefetch={false} className="mt-4">
          <button
            type="button"
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] text-[17px] font-bold text-[var(--accent-foreground)] transition-colors hover:bg-[var(--accent-hover)]"
          >
            <Feather className="h-5 w-5 xl:hidden" aria-hidden="true" />
            <span className="hidden xl:inline">Drop Gist</span>
          </button>
        </Link>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Theme toggle */}
        <div className="mb-2">
          <ThemeToggle />
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex w-full items-center gap-3 rounded-full p-3 transition-colors hover:bg-[var(--nav-hover)]"
            aria-expanded={moreOpen}
            aria-label="Account menu"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-soft)] text-sm font-bold">
              {viewer.username.charAt(0).toUpperCase()}
            </div>
            <div className="hidden min-w-0 flex-1 text-left xl:block">
              <p className="truncate text-[15px] font-bold">@{viewer.username}</p>
              <p className="truncate text-[13px] text-[var(--secondary)]">
                {viewer.homeState}
              </p>
            </div>
            <MoreHorizontal className="hidden h-5 w-5 text-[var(--secondary)] xl:block" aria-hidden="true" />
          </button>

          {/* Dropdown menu */}
          {moreOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMoreOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute bottom-full left-0 z-50 mb-2 w-[280px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-lg">
                <div className="border-b border-[var(--border)] px-4 py-3">
                  <p className="text-[15px] font-bold">@{viewer.username}</p>
                  <p className="text-[13px] text-[var(--secondary)]">
                    {viewer.location?.displayLocality ?? viewer.homeState}
                  </p>
                </div>
                <Link
                  href="/locker/my-gists"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-[15px] transition-colors hover:bg-[var(--surface-hover)]"
                >
                  <User className="h-5 w-5" aria-hidden="true" />
                  My Gists
                </Link>
                <Link
                  href="/locker/settings"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-[15px] transition-colors hover:bg-[var(--surface-hover)]"
                >
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  Settings
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const items = [
    { href: "/mata", label: "Home", icon: Home },
    { href: "/search", label: "Search", icon: Search },
    { href: "/drop", label: "Gist", icon: Feather, accent: true },
    { href: "/alerts", label: "Alerts", icon: Bell },
    { href: "/locker", label: "Locker", icon: ShieldCheck },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--background)] lg:hidden"
      aria-label="Mobile navigation"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;

          if (item.accent) {
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                aria-label={item.label}
                className="flex h-[54px] items-center justify-center px-4"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)]">
                  <Icon className="h-5 w-5 text-[var(--accent-foreground)]" aria-hidden="true" />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={active ? "page" : undefined}
              aria-label={item.label}
              className="flex h-[54px] flex-1 items-center justify-center"
            >
              <Icon
                className={cn(
                  "h-[26px] w-[26px]",
                  active ? "text-[var(--foreground)]" : "text-[var(--secondary)]"
                )}
                strokeWidth={active ? 2.5 : 2}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* Right sidebar for desktop - search & trends */
export function RightSidebar({ viewer }: { viewer: Viewer }) {
  return (
    <aside className="right-sidebar" aria-label="Additional content">
      {/* Search box */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--secondary)]" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search Gistmata"
          className="h-11 w-full rounded-full border-none bg-[var(--surface-2)] pl-12 pr-4 text-[15px] text-[var(--foreground)] placeholder:text-[var(--secondary)] focus:bg-[var(--background)] focus:outline focus:outline-2 focus:outline-[var(--accent)]"
        />
      </div>

      {/* Location widget */}
      <div className="widget-card">
        <div className="widget-card-header">Your Coverage</div>
        <div className="px-4 pb-4">
          <p className="text-[15px] font-bold">
            {viewer.location?.displayLocality ?? viewer.homeState}
          </p>
          <p className="mt-1 text-[13px] text-[var(--secondary)]">
            {viewer.location
              ? `${viewer.location.admin2Name} · ${viewer.homeState}`
              : "Drop your first gist to sharpen your local Mata."}
          </p>
        </div>
      </div>

      {/* Anonymous notice */}
      <div className="widget-card">
        <div className="widget-card-header">Stay Anonymous</div>
        <div className="px-4 pb-4 text-[13px] text-[var(--secondary)]">
          <p>No full names. No phone numbers. No addresses.</p>
          <p className="mt-2">Your identity stays yours.</p>
        </div>
      </div>

      {/* Footer links */}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-4 text-[13px] text-[var(--secondary)]">
        <Link href="/locker/privacy" className="hover:underline">Privacy</Link>
        <Link href="/support" className="hover:underline">Support</Link>
        <Link href="/contact-oga" className="hover:underline">Contact</Link>
        <span>© 2024 GistMata</span>
      </div>
    </aside>
  );
}
