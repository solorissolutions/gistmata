import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GitBranch } from "lucide-react";

import { PageWithContextRail } from "@/components/app-shell/page-with-context-rail";
import { ReportGistDialog } from "@/components/gist/report-gist-dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CommentComposer } from "@/components/gist/comment-composer";
import { CommentItem } from "@/components/gist/comment-item";
import { GistCard } from "@/components/gist/gist-card";
import { getFeedLevelLabel, RELATION_TYPE_LABELS } from "@/lib/domain/constants";
import { requireUser } from "@/lib/server/services/auth";
import { getMatterBundleByGist } from "@/lib/server/services/matter";

export default async function GistDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dropped?: string }>;
}) {
  const viewer = await requireUser();
  const resolvedParams = await params;
  const resolvedSearch = await searchParams;
  const data = await getMatterBundleByGist(resolvedParams.id, viewer);

  if (!data) {
    notFound();
  }

  const backHref =
    data.viewerLevel === "my-street" ? "/mata" : `/mata/${data.viewerLevel}`;
  const sections = [
    {
      id: "post-context",
      title: "Post context",
      defaultOpen: true,
      content: (
        <div className="space-y-2 text-sm text-[var(--gm-ink-soft)]">
          <p>Area: {data.postContext.area}</p>
          <p>Broader area: {data.postContext.broaderArea}</p>
          <p>State: {data.postContext.state}</p>
          <p>Reach: {data.postContext.reach}</p>
        </div>
      ),
    },
    {
      id: "nearby-moving",
      title: "Nearby gist moving",
      content: (
        <div className="space-y-2 text-sm text-[var(--gm-ink-soft)]">
          {data.postContext.nearbyMovement.map(([label, count]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
            >
              <span>{label}</span>
              <span>{count} gists</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "safety",
      title: "Safety box",
      content: (
        <div className="space-y-3">
          <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
            No full names. No phone numbers. No addresses. If you see personal info, report am sharp.
          </p>
          <div>
            <ReportGistDialog gistId={data.gist.id} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <PageWithContextRail
      storageKey="gm-gist-context-collapsed"
      mobileLabel="Gist context"
      sections={sections}
      main={
        <div className="space-y-5">
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <Badge>{getFeedLevelLabel(data.viewerLevel)}</Badge>
              <Badge>{data.gist.tag}</Badge>
            </div>
            <div className="text-sm text-[var(--gm-ink-soft)]">{data.gist.reachLabel}</div>
          </Card>

          {resolvedSearch.dropped === "1" ? (
            <Card className="space-y-2 border-[var(--gm-green)] bg-[var(--gm-green-soft)]">
              <p className="text-lg font-extrabold tracking-[-0.04em]">Gist don drop.</p>
              <p className="text-sm leading-6 text-[var(--gm-green-deep)]">
                Your gist don enter Mata and people for this side fit see am now.
              </p>
            </Card>
          ) : null}

          <GistCard gist={data.gist} detail />

          {/* Matter chain — follow-up gists on this matter */}
          {data.followUps.length > 0 ? (
            <section className="space-y-3" aria-label="Follow-up gists on this matter">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-[var(--gm-green-deep)]" aria-hidden="true" />
                <h2 className="text-lg font-extrabold tracking-[-0.04em]">
                  Voices joining this mata
                </h2>
                <Badge>{data.followUps.length}</Badge>
              </div>
              <div className="space-y-3">
                {data.followUps.map((followUp) => (
                  <div key={followUp.id} className="space-y-1">
                    <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--gm-green-deep)]">
                      {RELATION_TYPE_LABELS[followUp.relationType as keyof typeof RELATION_TYPE_LABELS] ?? "Join mouth"}
                    </p>
                    <GistCard gist={followUp} />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Add your voice */}
          <div className="rounded-[24px] border border-dashed border-[var(--gm-border)] px-4 py-4">
            <p className="text-sm font-semibold">Your voice fit add to this mata.</p>
            <p className="mt-1 text-sm text-[var(--gm-ink-soft)]">
              Join mouth if you have an update, confirmation, or your own side of this matter.
            </p>
            <Link
              href={`/drop/follow-up/${data.gist.id}`}
              className="mt-3 inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-semibold transition hover:bg-[var(--surface)]"
            >
              <GitBranch className="h-4 w-4" aria-hidden="true" />
              Join mouth
            </Link>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold tracking-[-0.05em]">Comments</h2>
              <Badge>{data.comments.length}</Badge>
            </div>
            <div className="space-y-3">
              {data.comments.length === 0 ? (
                <Card className="space-y-2">
                  <p className="text-lg font-extrabold tracking-[-0.04em]">No comments yet.</p>
                  <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
                    First reply still dey open, but keep am anonymous and clean.
                  </p>
                </Card>
              ) : (
                data.comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              )}
            </div>
            <CommentComposer gistId={data.gist.id} />
          </section>
        </div>
      }
    />
  );
}
