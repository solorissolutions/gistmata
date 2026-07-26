import { prisma } from "@/lib/prisma";
import {
  createUpcoming,
  updateUpcoming,
  deleteUpcoming,
  reorderUpcoming,
} from "@/lib/actions";
import { CATEGORIES } from "@/lib/utils";
import { generateCsrfToken } from "@/lib/csrf";
import { Trash2, ArrowUp, ArrowDown, Plus } from "lucide-react";

export default async function UpcomingPage() {
  const items = await prisma.upcoming.findMany({
    orderBy: { sortOrder: "asc" },
  });
  const csrfToken = generateCsrfToken();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-light tracking-tight">Upcoming</h1>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Manage the &ldquo;Coming Soon&rdquo; section on the homepage.
      </p>

      <form action={createUpcoming} className="mt-8 flex items-start gap-3">
        <input type="hidden" name="_csrf" value={csrfToken} />
        <div className="flex-1">
          <input
            name="title"
            type="text"
            placeholder="Title"
            required
            className="block w-full border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
          />
        </div>
        <select
          name="category"
          defaultValue=""
          className="border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
        >
          <option value="">No category</option>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <option key={key} value={key}>
              {cat.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 border border-foreground px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </form>

      <div className="mt-8 divide-y divide-border">
        {items.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No upcoming items yet.
          </p>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-4"
            >
              <div className="min-w-0 flex-1">
                <form
                  action={updateUpcoming.bind(null, item.id)}
                  className="flex items-center gap-3"
                >
                  <input type="hidden" name="_csrf" value={csrfToken} />
                  <input
                    name="title"
                    type="text"
                    defaultValue={item.title}
                    className="flex-1 border border-border bg-transparent px-3 py-1.5 text-sm text-foreground focus:border-foreground focus:outline-none"
                  />
                  <select
                    name="category"
                    defaultValue={item.category || ""}
                    className="border border-border bg-background px-2 py-1.5 text-xs text-foreground focus:border-foreground focus:outline-none"
                  >
                    <option value="">No category</option>
                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Save
                  </button>
                </form>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <form
                  action={reorderUpcoming.bind(null, item.id, "up")}
                >
                  <input type="hidden" name="_csrf" value={csrfToken} />
                  <button
                    type="submit"
                    disabled={index === 0}
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                </form>
                <form
                  action={reorderUpcoming.bind(null, item.id, "down")}
                >
                  <input type="hidden" name="_csrf" value={csrfToken} />
                  <button
                    type="submit"
                    disabled={index === items.length - 1}
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                </form>
                <form action={deleteUpcoming.bind(null, item.id)}>
                  <input type="hidden" name="_csrf" value={csrfToken} />
                  <button
                    type="submit"
                    className="rounded p-1.5 text-muted-foreground transition-colors hover:text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
