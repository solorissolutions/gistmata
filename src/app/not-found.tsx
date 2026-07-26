import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl font-light tracking-tight">404</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        This page does not exist.
      </p>
      <Link
        href="/"
        className="mt-8 border border-foreground px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
      >
        Return home
      </Link>
    </div>
  );
}
