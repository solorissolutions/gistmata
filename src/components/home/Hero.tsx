import Link from "next/link";
import type { ArticleData } from "@/types";

export function Hero({
  featured,
  latest,
}: {
  featured: ArticleData[];
  latest: ArticleData[];
}) {
  return (
    <section
      className="relative border-b border-white/20 bg-cover bg-center"
      style={{ backgroundImage: "url(/hero-bg.png)" }}
    >
      <div className="absolute inset-0 bg-black/80" />
      <div className="relative mx-auto max-w-5xl px-6 py-16 sm:py-24 z-10 text-white">
        <span className="mb-8 inline-block text-xs font-medium uppercase tracking-widest text-white/50">
          Featured Story
        </span>
        <div className="grid gap-8 lg:gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-10">
            {featured.length === 0 ? (
              <div className="pt-8 lg:pt-0">
                <h1 className="text-3xl font-light leading-tight tracking-tight sm:text-4xl md:text-5xl text-white">
                  Knowledge grows through exploration.
                </h1>
                <p className="mt-4 max-w-xl text-lg text-white/60">
                  Gistmata is a living knowledge publication exploring the edges of
                  technology, intelligence, and human development.
                </p>
              </div>
            ) : featured.map((article, i) => (
              <article key={article.id}>
                {i === 0 ? (
                  <div>
                    <Link href={`/articles/${article.slug}`} className="block mb-6">
                      {article.featuredImage ? (
                        <img
                          src={article.featuredImage}
                          alt=""
                          className="w-full aspect-video rounded object-cover border border-white/20"
                        />
                      ) : (
                        <div className="w-full aspect-video rounded border border-white/20 bg-white/10" />
                      )}
                    </Link>
                    <h2 className="text-2xl font-light leading-tight tracking-tight sm:text-3xl md:text-4xl text-white">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="hover:underline decoration-1 underline-offset-4 decoration-white/30"
                      >
                        {article.title}
                      </Link>
                    </h2>
                    {article.excerpt && (
                      <p className="mt-3 max-w-xl text-base text-white/60 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="mt-5 flex items-center gap-4">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="inline-flex h-10 items-center justify-center border border-white bg-transparent px-6 text-sm font-medium text-white transition-colors hover:bg-white hover:text-black"
                      >
                        Read Article
                      </Link>
                      {article.publishedAt && (
                        <span className="text-xs text-white/60">
                          {new Intl.DateTimeFormat("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }).format(article.publishedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-white/20 pt-6">
                    <Link href={`/articles/${article.slug}`} className="block mb-4">
                      {article.featuredImage ? (
                        <img
                          src={article.featuredImage}
                          alt=""
                          className="w-full aspect-video rounded object-cover border border-white/20"
                        />
                      ) : (
                        <div className="w-full aspect-video rounded border border-white/20 bg-white/10" />
                      )}
                    </Link>
                    <h3 className="text-lg font-light tracking-tight text-white">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="hover:underline decoration-1 underline-offset-4 decoration-white/30"
                      >
                        {article.title}
                      </Link>
                    </h3>
                    {article.excerpt && (
                      <p className="mt-1.5 text-sm text-white/60 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="inline-flex h-8 items-center justify-center border border-white px-4 text-xs font-medium text-white transition-colors hover:bg-white hover:text-black"
                      >
                        Read Article
                      </Link>
                      {article.publishedAt && (
                        <span className="text-xs text-white/60">
                          {new Intl.DateTimeFormat("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }).format(article.publishedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>

          {latest.length > 0 && (
            <aside className="border-t border-white/20 pt-8 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-8">
              <h2 className="text-xs font-medium uppercase tracking-widest text-white/60">
                Latest Posts
              </h2>
              <div className="mt-6 divide-y divide-border">
                {latest.map((article) => (
                  <div key={article.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
                    <Link
                      href={`/articles/${article.slug}`}
                      className="shrink-0"
                    >
                      {article.featuredImage ? (
                        <img
                          src={article.featuredImage}
                          alt=""
                          className="h-14 w-14 rounded object-cover border border-white/20"
                        />
                      ) : (
                        <div className="h-14 w-14 rounded border border-white/20 bg-white/10" />
                      )}
                    </Link>
                    <div className="min-w-0">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="text-sm font-medium text-white leading-snug hover:underline decoration-1 underline-offset-2 decoration-white/30"
                      >
                        {article.title}
                      </Link>
                      <p className="mt-1 text-xs text-white/60">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(article.publishedAt!)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/archive"
                className="mt-6 inline-block text-xs font-medium text-white/60 underline underline-offset-2 hover:text-white"
              >
                View all archive →
              </Link>
            </aside>
          )}
        </div>

        <div className="mt-16 flex justify-center">
          <a
            href="#content"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/60 transition-colors hover:border-white hover:text-white animate-bounce"
            aria-label="Scroll to content"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
