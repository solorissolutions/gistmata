import type { ReactNode } from "react";

export function PageHeader({
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
    <div className="panel flex flex-col gap-3 px-4 py-4 sm:px-5 sm:py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          {eyebrow ? <p className="muted-label">{eyebrow}</p> : null}
          <h1 className="text-[1.65rem] font-extrabold tracking-[-0.05em] sm:text-[1.9rem]">{title}</h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-[var(--gm-ink-soft)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions}
      </div>
    </div>
  );
}
