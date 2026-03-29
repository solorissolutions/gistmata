"use client";

import { Heart } from "lucide-react";

import { toggleReactionAction } from "@/lib/server/mata-actions";
import type { GistCardView } from "@/lib/domain/types";

const reactionMeta = [
  { key: "wahala", label: "Wahala" },
  { key: "omo", label: "Omo!" },
  { key: "sharp", label: "Sharp" },
] as const;

export function ReactionRow({ gist }: { gist: GistCardView }) {
  const totalReactions = 
    gist.reactionTotals.wahala + 
    gist.reactionTotals.omo + 
    gist.reactionTotals.sharp;
  
  const hasReacted = gist.viewerReaction !== null;

  return (
    <div className="group relative">
      {/* Main heart button - like X */}
      <form action={toggleReactionAction} className="inline">
        <input type="hidden" name="gistId" value={gist.id} />
        <input type="hidden" name="type" value={gist.viewerReaction ?? "sharp"} />
        <button
          type="submit"
          className={`action-btn ${
            hasReacted
              ? "text-[var(--action-like)]"
              : "text-[var(--action-reply)] hover:text-[var(--action-like)]"
          }`}
          aria-label={`${totalReactions} reactions`}
        >
          <Heart
            className="h-5 w-5"
            fill={hasReacted ? "currentColor" : "none"}
            aria-hidden="true"
          />
          <span>{totalReactions > 0 ? totalReactions : ""}</span>
        </button>
      </form>

      {/* Reaction dropdown on hover */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
        <div className="mb-2 flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
          {reactionMeta.map((reaction) => {
            const count = gist.reactionTotals[reaction.key];
            const selected = gist.viewerReaction === reaction.key;

            return (
              <form key={reaction.key} action={toggleReactionAction} className="inline">
                <input type="hidden" name="gistId" value={gist.id} />
                <input type="hidden" name="type" value={reaction.key} />
                <button
                  type="submit"
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${
                    selected
                      ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                      : "hover:bg-[var(--surface-soft)]"
                  }`}
                  title={reaction.label}
                >
                  <span>{reaction.label}</span>
                  {count > 0 && <span className="text-[12px] opacity-80">{count}</span>}
                </button>
              </form>
            );
          })}
        </div>
      </div>
    </div>
  );
}
