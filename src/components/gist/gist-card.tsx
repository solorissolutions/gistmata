import Link from "next/link";
import { Bookmark, Flag, GitBranch, MessageCircle, MoreHorizontal, Share } from "lucide-react";

import { ReactionRow } from "@/components/gist/reaction-row";
import { TranslationToggle } from "@/components/gist/translation-toggle";
import { getFeedLevelLabel, RELATION_TYPE_LABELS } from "@/lib/domain/constants";
import type { GistCardView } from "@/lib/domain/types";
import { formatRelativeTime } from "@/lib/utils";
import { toggleSaveGistAction } from "@/lib/server/mata-actions";

export function GistCard({
  gist,
  detail = false,
}: {
  gist: GistCardView;
  detail?: boolean;
}) {
  return (
    <article
      aria-label={`Gist by @${gist.username}`}
      className="post-divider px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-soft)] text-sm font-bold text-[var(--foreground)]">
            {gist.username.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1 text-[15px]">
              <span className="font-bold text-[var(--foreground)]">@{gist.username}</span>
              <span className="text-[var(--secondary)]">·</span>
              <span className="shrink-0 rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-[12px] font-semibold text-[var(--secondary)]">
                {gist.authorTier}
              </span>
              <span className="text-[var(--secondary)]">·</span>
              <time
                dateTime={gist.createdAt}
                className="text-[var(--secondary)] hover:underline"
              >
                {formatRelativeTime(gist.createdAt)}
              </time>
            </div>
            <button
              type="button"
              className="action-btn -mr-2 -mt-1 text-[var(--secondary)] hover:text-[var(--accent)]"
              aria-label="More options"
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Location & reach meta */}
          <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[13px] text-[var(--secondary)]">
            <span>{gist.areaLabel}</span>
            <span>·</span>
            <span>{gist.stateLabel}</span>
            <span>·</span>
            <span>{gist.reachLabel}</span>
          </div>

          {/* Follow-up context */}
          {gist.parentGistId && (
            <div className="mt-2 flex items-center gap-2 text-[13px] text-[var(--accent)]">
              <GitBranch className="h-4 w-4" aria-hidden="true" />
              <span>
                {RELATION_TYPE_LABELS[gist.parentRelationType ?? "follow-up"]} ·{" "}
                <Link
                  href={`/gist/${gist.parentGistId}`}
                  prefetch={false}
                  className="hover:underline"
                >
                  View original
                </Link>
              </span>
            </div>
          )}

          {/* Gist body */}
          {detail ? (
            <p className="gist-copy mt-2">{gist.body}</p>
          ) : (
            <Link href={`/gist/${gist.id}`} prefetch={false} className="block">
              <p className="gist-copy mt-2">{gist.body}</p>
            </Link>
          )}

          {/* Tags */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {gist.pinnedByOgaPriority && (
              <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[12px] font-semibold text-[var(--accent-foreground)]">
                Pinned
              </span>
            )}
            <span className="rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-[12px] font-semibold text-[var(--foreground)]">
              {gist.tag}
            </span>
            <span className="text-[12px] text-[var(--secondary)]">
              {getFeedLevelLabel(gist.viewerLevel)}
            </span>
          </div>

          <TranslationToggle text={gist.translationText} />

          {/* Action row - X style */}
          <div className="-ml-2 mt-3 flex items-center justify-between max-w-md">
            {/* Reply/Comment */}
            <Link
              href={`/gist/${gist.id}`}
              className="action-btn text-[var(--action-reply)] hover:text-[var(--action-share)]"
              aria-label={`${gist.commentsCount} comments`}
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              <span>{gist.commentsCount > 0 ? gist.commentsCount : ""}</span>
            </Link>

            {/* Join mouth (repost equivalent) */}
            <Link
              href={`/drop/follow-up/${gist.id}`}
              prefetch={false}
              className="action-btn text-[var(--action-reply)] hover:text-[var(--action-repost)]"
              aria-label={`Join mouth${gist.followUpCount > 0 ? ` - ${gist.followUpCount} follow-ups` : ""}`}
            >
              <GitBranch className="h-5 w-5" aria-hidden="true" />
              <span>{gist.followUpCount > 0 ? gist.followUpCount : ""}</span>
            </Link>

            {/* Reactions */}
            <ReactionRow gist={gist} />

            {/* Save */}
            <form action={toggleSaveGistAction}>
              <input type="hidden" name="gistId" value={gist.id} />
              <button
                type="submit"
                className={`action-btn ${
                  gist.isSaved
                    ? "text-[var(--accent)]"
                    : "text-[var(--action-reply)] hover:text-[var(--accent)]"
                }`}
                aria-label={gist.isSaved ? "Unsave this gist" : "Save this gist"}
              >
                <Bookmark
                  className="h-5 w-5"
                  fill={gist.isSaved ? "currentColor" : "none"}
                  aria-hidden="true"
                />
              </button>
            </form>

            {/* Share */}
            <button
              type="button"
              className="action-btn text-[var(--action-reply)] hover:text-[var(--action-share)]"
              aria-label="Share"
            >
              <Share className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
