import Link from "next/link";
import { Bookmark, GitBranch } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ReportGistDialog } from "@/components/gist/report-gist-dialog";
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
    <article aria-label={`Gist by @${gist.username}`}>
      <Card className="space-y-4">
        {/* Follow-up context strip — shown when this gist is itself a follow-up */}
        {gist.parentGistId ? (
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--gm-border)] bg-[var(--gm-green-soft)]/40 px-3 py-2 text-xs font-semibold text-[var(--gm-green-deep)]">
            <GitBranch className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>
              {RELATION_TYPE_LABELS[gist.parentRelationType ?? "follow-up"]} ·{" "}
              <Link
                href={`/gist/${gist.parentGistId}`}
                prefetch={false}
                className="underline underline-offset-2 hover:opacity-80"
              >
                View original gist
              </Link>
            </span>
          </div>
        ) : null}

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
              <span>@{gist.username}</span>
              <span className="rounded-full bg-[var(--chip)] px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-[var(--chip-foreground)]">
                {gist.authorTier}
              </span>
              <span className="text-[var(--muted-foreground)]" aria-hidden="true">·</span>
              <time
                dateTime={gist.createdAt}
                className="text-[var(--muted-foreground)]"
              >
                {formatRelativeTime(gist.createdAt)}
              </time>
            </div>
            <div className="text-xs leading-5 text-[var(--muted-foreground)]">
              {gist.areaLabel} · {gist.stateLabel} · {gist.reachLabel}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {gist.pinnedByOgaPriority ? (
              <Badge className="bg-[var(--chip-active)] text-[var(--chip-active-foreground)]">
                Pinned by oga
              </Badge>
            ) : null}
            <Badge>{gist.tag}</Badge>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
              {getFeedLevelLabel(gist.viewerLevel)}
            </span>
          </div>
        </div>

        {detail ? (
          <p className="gist-copy">{gist.body}</p>
        ) : (
          <Link href={`/gist/${gist.id}`} prefetch={false} className="block gist-copy transition hover:opacity-80">
            {gist.body}
          </Link>
        )}

        <TranslationToggle text={gist.translationText} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <ReactionRow gist={gist} />

            {/* Join mouth — follow up on this gist */}
            <Link
              href={`/drop/follow-up/${gist.id}`}
              prefetch={false}
              aria-label={`Join mouth on this gist${gist.followUpCount > 0 ? ` — ${gist.followUpCount} follow-ups` : ""}`}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold transition hover:bg-[var(--surface-2)]"
            >
              <GitBranch className="h-4 w-4" aria-hidden="true" />
              <span>
                Join mouth
                {gist.followUpCount > 0 ? (
                  <span className="ml-1 text-[var(--muted-foreground)]">· {gist.followUpCount}</span>
                ) : null}
              </span>
            </Link>

            <form action={toggleSaveGistAction}>
              <input type="hidden" name="gistId" value={gist.id} />
              <button
                type="submit"
                aria-label={gist.isSaved ? "Unsave this gist" : "Save this gist"}
                className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${
                  gist.isSaved
                    ? "border-[var(--accent)] bg-[var(--chip-active)] text-[var(--chip-active-foreground)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <Bookmark className="h-4 w-4" aria-hidden="true" />
                {gist.isSaved ? "Saved" : "Save"}
              </button>
            </form>
          </div>
          <ReportGistDialog gistId={gist.id} />
        </div>
      </Card>
    </article>
  );
}
