import type { CommentView } from "@/lib/domain/types";
import { formatRelativeTime } from "@/lib/utils";

export function CommentItem({ comment }: { comment: CommentView }) {
  return (
    <article className="post-divider px-4 py-3 transition-colors hover:bg-[var(--surface-hover)]">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-soft)] text-sm font-bold text-[var(--foreground)]">
            {comment.username.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[15px]">
            <span className="font-bold">@{comment.username}</span>
            <span className="text-[var(--secondary)]">·</span>
            <time
              dateTime={comment.createdAt}
              className="text-[var(--secondary)]"
            >
              {formatRelativeTime(comment.createdAt)}
            </time>
          </div>
          <p className="mt-1 text-[15px] leading-relaxed">{comment.body}</p>
        </div>
      </div>
    </article>
  );
}
