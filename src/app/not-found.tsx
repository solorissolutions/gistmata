import Link from "next/link";

import { LogoLockup } from "@/components/blocks/logo-lockup";
import { Button } from "@/components/ui/button";

export const metadata = { title: "404 — GistMata" };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12 text-center">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <LogoLockup />

        <div className="space-y-3">
          <p className="muted-label">404</p>
          <h1 className="text-4xl font-extrabold tracking-[-0.06em]">
            No vex abeg.
          </h1>
          <p className="text-lg font-semibold tracking-[-0.03em]">
            Dis thing no dey.
          </p>
          <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
            The page wey you dey find don comot or e never land for here.
            Make you go back check Mata.
          </p>
        </div>

        <Link href="/mata">
          <Button>Back to Mata</Button>
        </Link>
      </div>
    </main>
  );
}
