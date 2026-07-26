import type { ContentTypeKey, CategoryKey } from "@/lib/utils";

export interface ArticleData {
  id: string;
  title: string;
  subtitle: string | null;
  slug: string;
  excerpt: string | null;
  content: string;
  category: string;
  contentType: string;
  tags: string[];
  featuredImage: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpcomingData {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  sortOrder: number;
}
