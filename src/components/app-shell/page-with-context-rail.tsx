"use client";

import type { ReactNode } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStoredBoolean } from "@/components/app-shell/use-stored-boolean";

type ContextSection = {
  id: string;
  title: string;
  content: ReactNode;
  surface?: "card" | "raw";
  defaultOpen?: boolean;
};

export function PageWithContextRail({
  storageKey,
  main,
  sections,
  mobileLabel = "More context",
}: {
  storageKey: string;
  main: ReactNode;
  sections: ContextSection[];
  mobileLabel?: string;
}) {
  const [collapsed, setCollapsed] = useStoredBoolean(storageKey, false);

  return (
    <div className="space-y-4">
      {/* Desktop: two-column grid — feed left, context rail right (sticky) */}
      <div
        className={cn(
          "hidden lg:grid lg:items-start lg:gap-5",
          collapsed
            ? "lg:[grid-template-columns:minmax(0,1fr)_72px]"
            : "lg:[grid-template-columns:minmax(0,1fr)_minmax(248px,280px)]",
        )}
      >
        <div className="min-w-0">{main}</div>

        <aside
          className="flex flex-col gap-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto lg:py-0"
          aria-label="Context"
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() => setCollapsed((current) => !current)}
            icon={
              collapsed ? (
                <PanelRightOpen className="h-4 w-4" />
              ) : (
                <PanelRightClose className="h-4 w-4" />
              )
            }
            className={cn(
              "h-12 shrink-0 rounded-[20px]",
              collapsed ? "w-12 self-end px-0" : "w-full justify-start",
            )}
            aria-label={collapsed ? "Open context rail" : "Collapse context rail"}
            aria-expanded={!collapsed}
          >
            {collapsed ? null : "Context"}
          </Button>

          {collapsed ? (
            <Card className="flex min-h-[260px] items-center justify-center px-2 py-4">
              <div className="-rotate-90 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--gm-ink-soft)]">
                Context
              </div>
            </Card>
          ) : (
            sections.map((section) =>
              section.surface === "raw" ? (
                <div key={section.id}>{section.content}</div>
              ) : (
                <Card key={section.id} className="space-y-3">
                  <p className="muted-label">{section.title}</p>
                  {section.content}
                </Card>
              ),
            )
          )}
        </aside>
      </div>

      {/* Mobile: main content first, then collapsible context sections below */}
      <div className="lg:hidden">
        {main}
      </div>

      <div className="space-y-3 lg:hidden">
        <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--gm-ink-soft)]">
          {mobileLabel}
        </div>
        {sections.map((section) => (
          <details
            key={section.id}
            className="overflow-hidden rounded-[24px] border border-[var(--gm-border)] bg-[var(--gm-card)]"
            open={section.defaultOpen}
          >
            <summary className="cursor-pointer list-none px-4 py-4 text-sm font-semibold text-[var(--foreground)]">
              <span className="flex items-center justify-between">
                {section.title}
                <span className="text-[var(--gm-ink-soft)] text-xs">▾</span>
              </span>
            </summary>
            <div className="border-t border-[var(--gm-border)] px-4 py-4">
              {section.content}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
