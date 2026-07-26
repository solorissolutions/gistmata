"use client";

import { useEffect, useState } from "react";
import { Search, ImageIcon, X } from "lucide-react";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  url: string;
  thumbUrl: string;
}

interface Props {
  onSelect: (url: string) => void;
  onClose: () => void;
}

export function MediaLibrary({ onSelect, onClose }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/media");
        const data = await res.json();
        setItems(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-3xl bg-background border border-border max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-medium">Select Image</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <ImageIcon className="h-10 w-10 text-muted" />
              <p className="mt-3 text-sm text-muted-foreground">
                No media uploaded yet.
              </p>
              <p className="text-xs text-muted">
                Upload images from the Media section in the CMS sidebar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(`/uploads/${item.filename}`)}
                  className="group relative aspect-square overflow-hidden border border-border bg-card transition-colors hover:border-foreground/50"
                >
                  <img
                    src={item.thumbUrl}
                    alt={item.alt || item.originalName}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="truncate text-[10px] text-white">
                      {item.originalName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border px-5 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
