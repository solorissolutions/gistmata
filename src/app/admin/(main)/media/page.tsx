import { prisma } from "@/lib/prisma";
import { deleteMedia, uploadMedia } from "@/lib/actions";
import { generateCsrfToken } from "@/lib/csrf";
import { Trash2, Upload, ImageIcon } from "lucide-react";
import Link from "next/link";

export default async function MediaPage() {
  const csrfToken = generateCsrfToken();
  const mediaItems = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-light tracking-tight">Media Library</h1>
        <Link
          href="/admin/media/upload"
          className="inline-flex items-center gap-1.5 border border-foreground px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </Link>
      </div>

      {mediaItems.length === 0 ? (
        <div className="mt-16 text-center">
          <ImageIcon className="mx-auto h-12 w-12 text-muted" />
          <p className="mt-4 text-sm text-muted-foreground">No media uploaded yet.</p>
          <Link
            href="/admin/media/upload"
            className="mt-4 inline-block text-sm text-foreground underline underline-offset-2"
          >
            Upload your first image
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="group relative border border-border overflow-hidden"
            >
              <a
                href={`/uploads/${item.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square bg-card"
              >
                <img
                  src={`/uploads/thumb/${item.filename}`}
                  alt={item.alt || item.originalName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </a>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs text-white">
                  {item.originalName}
                </p>
                <p className="text-[10px] text-white/70">
                  {item.width}x{item.height} ·{" "}
                  {(item.size / 1024).toFixed(0)}KB
                </p>
              </div>
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
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      {/* Quick upload form */}
      <div className="mt-12 border-t border-border pt-8">
        <h2 className="text-sm font-medium">Quick Upload</h2>
        <form
          action={uploadMedia.bind(null)}
          className="mt-4 flex items-start gap-4"
        >
          <input type="hidden" name="_csrf" value={csrfToken} />
          <div className="flex-1">
            <input
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              required
              className="block w-full text-sm text-muted-foreground file:mr-4 file:border file:border-border file:bg-transparent file:px-4 file:py-2 file:text-sm file:text-foreground hover:file:bg-border"
            />
            <input
              type="text"
              name="alt"
              placeholder="Alt text (optional)"
              className="mt-2 block w-full border border-border bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="border border-foreground px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}
