import { ArticleForm } from "@/components/admin/ArticleForm";
import { generateCsrfToken } from "@/lib/csrf";

export default async function NewArticlePage() {
  const csrfToken = generateCsrfToken();

  return (
    <div>
      <h1 className="text-xl font-light tracking-tight">New Article</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Create a new article for Gistmata.
      </p>
      <div className="mt-8">
        <ArticleForm csrfToken={csrfToken} />
      </div>
    </div>
  );
}
