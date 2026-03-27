import { Card } from "@/components/ui/card";
import type { CommentView } from "@/lib/domain/types";
import { formatRelativeTime } from "@/lib/utils";

export function CommentItem({ comment }: { comment: CommentView }) {
  return (
    <Card className="space-y-3 rounded-[24px] p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span>@{comment.username}</span>
        <span className="text-[var(--gm-ink-soft)]">·</span>
        <span className="text-[var(--gm-ink-soft)]">
          {formatRelativeTime(comment.createdAt)}
        </span>
      </div>
      <p className="text-sm leading-6">{comment.body}</p>
    </Card>
  );
}
