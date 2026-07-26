import { prisma } from "@/lib/prisma";
import { deleteMedia, uploadMedia } from "@/lib/actions";
import { generateCsrfToken } from "@/lib/csrf";
import { Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function MediaUploadPage() {
  const mediaItems = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const csrfToken = generateCsrfToken();

  return (
    <div>
      <div className="flex items-center gap-4">
        <Link
          href="/admin/media"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-light tracking-tight">Upload Media</h1>
      </div>

      <form
        action={uploadMedia.bind(null)}
        className="mt-8 rounded-lg border-2 border-dashed border-border p-12 text-center"
      >
        <input type="hidden" name="_csrf" value={csrfToken} />
        <div className="mx-auto max-w-sm">
          <label
            htmlFor="file"
            className="block cursor-pointer text-sm text-muted-foreground hover:text-foreground"
          >
            <span className="inline-flex items-center gap-2 rounded border border-foreground px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background">
              Choose Image
            </span>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              required
              className="sr-only"
            />
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            JPEG, PNG, WebP, GIF, AVIF · Max 10MB
          </p>
          <input
            type="text"
            name="alt"
            placeholder="Alt text (optional)"
            className="mt-4 block w-full border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
          />
          <button
            type="submit"
            className="mt-4 w-full border border-foreground px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Upload
          </button>
        </div>
      </form>

      {mediaItems.length > 0 && (
        <div className="mt-12">
          <h2 className="text-sm font-medium">Recent Uploads</h2>
          <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden border border-border"
              >
                <img
                  src={`/uploads/thumb/${item.filename}`}
                  alt={item.alt || item.originalName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <form
                  action={deleteMedia.bind(null, item.id)}
                  className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <input type="hidden" name="_csrf" value={csrfToken} />
                  <button
                    type="submit"
                    className="rounded bg-black/60 p-1 text-white hover:bg-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
