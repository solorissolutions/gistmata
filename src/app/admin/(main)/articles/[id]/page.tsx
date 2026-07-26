import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { generateCsrfToken } from "@/lib/csrf";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await prisma.article.findUnique({ where: { id } });

  if (!article) {
    notFound();
  }

  const csrfToken = generateCsrfToken();

  return (
    <div>
      <h1 className="text-xl font-light tracking-tight">Edit Article</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Editing: {article.title}
      </p>
      <div className="mt-8">
        <ArticleForm article={article as any} csrfToken={csrfToken} />
      </div>
    </div>
  );
}
