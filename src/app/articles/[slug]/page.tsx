import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  try {
    const { slug } = await params;
    const article = await prisma.article.findUnique({
      where: { slug, status: "published" },
    });
    if (!article) return <div className="p-12">not found</div>;
    return <div className="p-12"><h1>{article.title}</h1><p>{article.slug}</p></div>;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return <div className="p-12">error: {msg}</div>;
  }
}
