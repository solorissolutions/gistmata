"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { CATEGORIES, CONTENT_TYPES } from "@/lib/utils";
import type { ArticleData } from "@/types";
import { createArticle, updateArticle } from "@/lib/actions";
import { MediaLibrary } from "./MediaLibrary";
import { ImageIcon, Link2 } from "lucide-react";

interface Props {
  article?: ArticleData | null;
  csrfToken?: string;
}

export function ArticleForm({ article, csrfToken = "" }: Props) {
  const router = useRouter();
  const isEditing = !!article;
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [showMedia, setShowMedia] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  function insertLinkMarkup(url: string, text: string) {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selectedText = ta.value.substring(start, end) || text || url;
    const linkTag = `<a href="${url}" target="_blank" rel="noopener noreferrer">${selectedText}</a>`;
    const before = ta.value.substring(0, start);
    const after = ta.value.substring(end);
    ta.value = before + linkTag + after;
    const newPos = start + linkTag.length;
    ta.selectionStart = ta.selectionEnd = newPos;
    ta.focus();
  }

  function handleLinkSubmit() {
    if (linkUrl.trim()) {
      insertLinkMarkup(linkUrl.trim(), linkText.trim());
      setLinkUrl("");
      setLinkText("");
      setShowLinkInput(false);
    }
  }

  function handleUrlSubmit() {
    if (urlValue.trim()) {
      insertImage(urlValue.trim());
      setUrlValue("");
      setShowUrlInput(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    formData.append("_csrf", csrfToken);
    try {
      if (isEditing && article) {
        const res = await updateArticle(article.id, formData);
        if (res && "redirectTo" in res) router.push(res.redirectTo);
      } else {
        const res = await createArticle(formData);
        if (res && "redirectTo" in res) router.push(res.redirectTo);
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  function insertImage(url: string) {
    const ta = contentRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const imgTag = `\n<figure>\n  <img src="${url}" alt="" />\n  <figcaption></figcaption>\n</figure>\n`;
    const before = ta.value.substring(0, start);
    const after = ta.value.substring(end);
    ta.value = before + imgTag + after;
    const newPos = start + imgTag.length;
    ta.selectionStart = ta.selectionEnd = newPos;
    ta.focus();
    setShowMedia(false);
  }

  return (
    <>
      <form action={handleSubmit} className="space-y-8">
        <input type="hidden" name="_csrf" value={csrfToken} />

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="block text-xs font-medium text-muted-foreground">
              Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={article?.title ?? ""}
              className="mt-1 block w-full border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="subtitle" className="block text-xs font-medium text-muted-foreground">
              Subtitle
            </label>
            <input
              id="subtitle"
              name="subtitle"
              type="text"
              defaultValue={article?.subtitle ?? ""}
              className="mt-1 block w-full border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="excerpt" className="block text-xs font-medium text-muted-foreground">
              Excerpt
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              defaultValue={article?.excerpt ?? ""}
              className="mt-1 block w-full border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-xs font-medium text-muted-foreground">
              Category *
            </label>
            <select
              id="category"
              name="category"
              required
              defaultValue={article?.category ?? "vibe-hacking"}
              className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
            >
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contentType" className="block text-xs font-medium text-muted-foreground">
              Content Type *
            </label>
            <select
              id="contentType"
              name="contentType"
              required
              defaultValue={article?.contentType ?? "essay"}
              className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
            >
              {Object.entries(CONTENT_TYPES).map(([key, ct]) => (
                <option key={key} value={key}>
                  {ct.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-xs font-medium text-muted-foreground">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={article?.status ?? "draft"}
              className="mt-1 block w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-foreground focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-xs font-medium text-muted-foreground">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              defaultValue={article?.tags?.join(", ") ?? ""}
              placeholder="ai, quantum, hacking"
              className="mt-1 block w-full border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="featuredImage" className="block text-xs font-medium text-muted-foreground">
              Featured Image URL
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="featuredImage"
                name="featuredImage"
                type="url"
                defaultValue={article?.featuredImage ?? ""}
                placeholder="https://example.com/image.jpg"
                className="flex-1 border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowMedia(true)}
                className="border border-border px-3 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                title="Browse media"
              >
                Browse
              </button>
            </div>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="seoTitle" className="block text-xs font-medium text-muted-foreground">
              SEO Title
            </label>
            <input
              id="seoTitle"
              name="seoTitle"
              type="text"
              defaultValue={article?.seoTitle ?? ""}
              maxLength={70}
              className="mt-1 block w-full border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="seoDescription" className="block text-xs font-medium text-muted-foreground">
              SEO Description
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              rows={2}
              defaultValue={article?.seoDescription ?? ""}
              maxLength={160}
              className="mt-1 block w-full border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="block text-xs font-medium text-muted-foreground">
                Content (HTML) *
              </label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLinkInput(!showLinkInput)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Insert Link
                  </button>
                  {showLinkInput && (
                    <div className="absolute left-0 top-6 z-50 flex w-80 border border-border bg-background p-2 shadow-sm">
                      <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleLinkSubmit()}
                        className="min-w-0 flex-1 border border-border bg-transparent px-2 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none"
                      />
                      <input
                        type="text"
                        value={linkText}
                        onChange={(e) => setLinkText(e.target.value)}
                        placeholder="Text (optional)"
                        onKeyDown={(e) => e.key === "Enter" && handleLinkSubmit()}
                        className="w-28 border border-l-0 border-border bg-transparent px-2 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleLinkSubmit}
                        className="border border-l-0 border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
                      >
                        Insert
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ImageIcon className="h-3.5 w-3.5" />
                    Image from URL
                  </button>
                  {showUrlInput && (
                    <div className="absolute right-0 top-6 z-50 flex w-72 border border-border bg-background p-2 shadow-sm">
                      <input
                        type="url"
                        value={urlValue}
                        onChange={(e) => setUrlValue(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") handleUrlSubmit(); }}
                        className="min-w-0 flex-1 border border-border bg-transparent px-2 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleUrlSubmit}
                        className="border border-l-0 border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
                      >
                        Insert
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowMedia(true)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  Browse Uploads
                </button>
              </div>
            </div>
            <textarea
              id="content"
              name="content"
              rows={20}
              required
              ref={contentRef}
              defaultValue={article?.content ?? ""}
              className="mt-1 block w-full border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="border border-foreground px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            {isEditing ? "Update Article" : "Create Article"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </form>

      {showMedia && (
        <MediaLibrary
          onSelect={(url) => insertImage(url)}
          onClose={() => setShowMedia(false)}
        />
      )}
    </>
  );
}
