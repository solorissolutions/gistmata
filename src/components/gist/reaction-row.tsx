import Link from "next/link";

import { MessageCircle } from "lucide-react";

import { toggleReactionAction } from "@/lib/server/mata-actions";
import type { GistCardView } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

const reactionMeta = [
  { key: "wahala", label: "Wahala" },
  { key: "omo", label: "Omo!" },
  { key: "sharp", label: "Sharp" },
] as const;

export function ReactionRow({ gist }: { gist: GistCardView }) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {reactionMeta.map((reaction) => {
        const selected = gist.viewerReaction === reaction.key;
        return (
          <form key={reaction.key} action={toggleReactionAction}>
            <input type="hidden" name="gistId" value={gist.id} />
            <input type="hidden" name="type" value={reaction.key} />
            <button
              type="submit"
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition",
                selected
                  ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-2)]",
              )}
            >
              {reaction.label}
              <span className="text-xs opacity-80">
                {gist.reactionTotals[reaction.key]}
              </span>
            </button>
          </form>
        );
      })}

      <Link
        href={`/gist/${gist.id}`}
        className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-[var(--gm-ink-soft)] hover:bg-[var(--surface-2)]"
      >
        <MessageCircle className="h-4 w-4" />
        {gist.commentsCount}
      </Link>
    </div>
  );
}
