import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GitBranch, CheckCircle } from "lucide-react";

import { GistCard } from "@/components/gist/gist-card";
import { CommentComposer } from "@/components/gist/comment-composer";
import { CommentItem } from "@/components/gist/comment-item";
import { RELATION_TYPE_LABELS } from "@/lib/domain/constants";
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

  const backHref = data.viewerLevel === "my-street" ? "/mata" : `/mata/${data.viewerLevel}`;
  const justDropped = resolvedSearch.dropped === "1";

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky-header flex items-center gap-6 px-4 py-3">
        <Link
          href={backHref}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--nav-hover)]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="text-[20px] font-bold">Gist</h1>
      </div>

      {/* Success message if just dropped */}
      {justDropped && (
        <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--success-soft)] px-4 py-3">
          <CheckCircle className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
          <p className="text-[15px] font-semibold text-[var(--accent)]">
            Gist don drop. People for this area fit see am now.
          </p>
        </div>
      )}

      {/* Main gist */}
      <GistCard gist={data.gist} detail />

      {/* Follow-up section */}
      {data.followUps.length > 0 && (
        <section aria-label="Follow-up gists">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
            <GitBranch className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
            <h2 className="text-[17px] font-bold">
              Voices joining · {data.followUps.length}
            </h2>
          </div>
          {data.followUps.map((followUp) => (
            <div key={followUp.id}>
              <div className="border-l-2 border-[var(--accent)] bg-[var(--gm-green-soft)] px-4 py-1">
                <span className="text-[13px] font-semibold text-[var(--accent)]">
                  {RELATION_TYPE_LABELS[followUp.relationType as keyof typeof RELATION_TYPE_LABELS] ?? "Join mouth"}
                </span>
              </div>
              <GistCard gist={followUp} />
            </div>
          ))}
        </section>
      )}

      {/* Add your voice CTA */}
      <div className="border-b border-[var(--border)] px-4 py-4">
        <Link
          href={`/drop/follow-up/${data.gist.id}`}
          className="flex items-center gap-3 rounded-full border border-[var(--border)] px-4 py-3 text-[15px] font-semibold transition-colors hover:bg-[var(--surface-hover)]"
        >
          <GitBranch className="h-5 w-5 text-[var(--accent)]" aria-hidden="true" />
          <span>Join mouth on this gist</span>
        </Link>
      </div>

      {/* Comments section */}
      <section aria-label="Comments">
        <div className="border-b border-[var(--border)] px-4 py-3">
          <h2 className="text-[17px] font-bold">
            Comments · {data.comments.length}
          </h2>
        </div>

        {/* Comment composer */}
        <div className="border-b border-[var(--border)] px-4 py-3">
          <CommentComposer gistId={data.gist.id} />
        </div>

        {/* Comments list */}
        {data.comments.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-[17px] font-bold">No comments yet.</p>
            <p className="mt-1 text-[15px] text-[var(--secondary)]">
              Be the first to add your voice.
            </p>
          </div>
        ) : (
          data.comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </section>
    </div>
  );
}
