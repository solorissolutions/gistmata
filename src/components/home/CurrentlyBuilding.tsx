import { Check, Circle } from "lucide-react";

const items = [
  { label: "Foundation Articles", done: true },
  { label: "Publication Launch", done: true },
  { label: "N-QAI Research Archive", done: false },
  { label: "Knowledge Graph", done: false },
  { label: "Concept Glossary", done: false },
  { label: "Experimental Reports", done: false },
];

export function CurrentlyBuilding() {
  return (
    <section className="border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-2xl px-6">
        <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Currently Building
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Gistmata is early-stage. Witness its growth.
        </p>
        <ul className="mt-6 space-y-3">
          {items.map((item) => (
            <li key={item.label} className="flex items-center gap-3">
              {item.done ? (
                <Check className="h-4 w-4 shrink-0 text-foreground" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted" />
              )}
              <span
                className={`text-sm ${
                  item.done
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
