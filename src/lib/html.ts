import DOMPurify from "isomorphic-dompurify";

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "hr",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li",
      "blockquote", "pre", "code",
      "strong", "em", "b", "i", "u", "s", "mark",
      "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span",
      "sup", "sub",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel",
      "src", "alt", "width", "height", "loading",
      "title",
    ],
    ALLOW_DATA_ATTR: false,
  });
}

export function extractHeadings(html: string): TocEntry[] {
  const headings: TocEntry[] = [];
  const regex = /<h([23])(?:\s[^>]*)?>(.*?)<\/h[23]>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    const id =
      text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim() || `heading-${headings.length}`;

    headings.push({ id, text, level });
  }

  return headings;
}

export function addIdsToHeadings(html: string): string {
  return html.replace(
    /<h([23])(?:\s[^>]*)?>(.*?)<\/h[23]>/gi,
    (_match: string, level: string, content: string) => {
      const text = content.replace(/<[^>]*>/g, "").trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      return `<h${level} id="${id}">${content}</h${level}>`;
    }
  );
}
