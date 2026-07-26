import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-sm font-medium tracking-tight text-foreground"
            >
              Gistmata
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              Knowledge grows through exploration.
            </p>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link
              href="/archive"
              className="transition-colors hover:text-foreground"
            >
              Articles
            </Link>
            <Link
              href="/research"
              className="transition-colors hover:text-foreground"
            >
              Research
            </Link>
            <Link
              href="/about"
              className="transition-colors hover:text-foreground"
            >
              About
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted">
          <p>&copy; {new Date().getFullYear()} Gistmata. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
