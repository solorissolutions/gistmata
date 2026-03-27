import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function OgaV2Header({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="panel space-y-4 px-4 py-4 sm:px-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          {eyebrow ? <p className="muted-label">{eyebrow}</p> : null}
          <h1 className="text-[1.7rem] font-extrabold tracking-[-0.05em] sm:text-[2rem]">
            {title}
          </h1>
          {description ? (
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
    </section>
  );
}

export function OgaV2MetricStrip({
  items,
}: {
  items: Array<{
    label: string;
    value: string | number;
    hint?: string;
    tone?: "default" | "danger" | "success" | "warning";
  }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-[22px] border px-4 py-4",
            item.tone === "danger"
              ? "border-[var(--destructive)]/30 bg-[var(--destructive-soft)]"
              : item.tone === "success"
                ? "border-[var(--gm-green)]/25 bg-[var(--success-soft)]"
                : item.tone === "warning"
                  ? "border-[var(--warning)]/25 bg-[rgba(179,92,28,0.12)]"
                : "border-[var(--border)] bg-[var(--surface-2)]",
          )}
        >
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--gm-ink-soft)]">
            {item.label}
          </div>
          <div className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">{item.value}</div>
          {item.hint ? (
            <div className="mt-1 text-xs leading-5 text-[var(--gm-ink-soft)]">{item.hint}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function OgaV2Panel({
  title,
  eyebrow,
  actions,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel space-y-4 px-4 py-4 sm:px-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          {eyebrow ? <p className="muted-label">{eyebrow}</p> : null}
          <h2 className="text-lg font-extrabold tracking-[-0.04em]">{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function OgaV2Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]",
        tone === "success"
          ? "bg-[var(--success-soft)] text-[var(--gm-green-deep)]"
          : tone === "warning"
            ? "bg-[rgba(179,92,28,0.14)] text-[var(--warning)]"
            : tone === "danger"
              ? "bg-[var(--destructive-soft)] text-[var(--destructive)]"
              : "bg-[var(--chip)] text-[var(--chip-foreground)]",
      )}
    >
      {children}
    </span>
  );
}

export function OgaV2Empty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[22px] border border-dashed border-[var(--border)] px-4 py-5">
      <div className="text-base font-extrabold tracking-[-0.03em]">{title}</div>
      <div className="mt-1 text-sm leading-6 text-[var(--gm-ink-soft)]">{description}</div>
    </div>
  );
}
