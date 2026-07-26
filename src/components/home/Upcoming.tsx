import { CATEGORIES } from "@/lib/utils";
import type { UpcomingData } from "@/types";

export function Upcoming({ items }: { items: UpcomingData[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Coming Soon
        </h2>
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted" />
              <span className="text-sm text-foreground">{item.title}</span>
              {item.category && (
                <span className="ml-auto text-xs text-muted-foreground">
                  {CATEGORIES[item.category as keyof typeof CATEGORIES]?.label ??
                    item.category}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
