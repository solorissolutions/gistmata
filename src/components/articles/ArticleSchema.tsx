import type { ArticleData } from "@/types";

export function ArticleSchema({ article }: { article: ArticleData }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt || "",
    alternativeHeadline: article.subtitle || undefined,
    image: article.featuredImage || undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: "Gistmata",
    },
    publisher: {
      "@type": "Organization",
      name: "Gistmata",
    },
    keywords: article.tags?.join(", ") || undefined,
    articleSection: article.category,
    articleBody: article.content?.substring(0, 1000),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
