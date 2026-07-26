export function readingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  if (minutes < 1) return "Less than 1 min read";
  return `${minutes} min read`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export const CATEGORIES = {
  "vibe-hacking": { label: "Vibe Hacking", description: "AI-assisted hacking, cybersecurity, automation, and human-AI collaboration." },
  "last-resonance": { label: "The Last Resonance", description: "The pursuit of discipline, identity, growth, and becoming." },
  "n-qai": { label: "N-QAI", description: "Theoretical and emerging intelligence systems built on quantum architectures." },
} as const;

export const CONTENT_TYPES = {
  essay: { label: "Essay" },
  "research-note": { label: "Research Note" },
  "experiment-log": { label: "Experiment Log" },
  "field-report": { label: "Field Report" },
  reflection: { label: "Reflection" },
} as const;

export function parseFeaturedIds(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.slice(0, 3);
  } catch {}
  return [raw];
}

export function encodeFeaturedIds(ids: string[]): string {
  return JSON.stringify(ids.slice(0, 3));
}

export type ContentTypeKey = keyof typeof CONTENT_TYPES;
export type CategoryKey = keyof typeof CATEGORIES;
