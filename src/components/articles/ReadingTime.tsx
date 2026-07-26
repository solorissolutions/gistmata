import { readingTime } from "@/lib/utils";

export function ReadingTime({ content }: { content: string }) {
  return (
    <span className="text-xs text-muted-foreground">
      {readingTime(content)}
    </span>
  );
}
