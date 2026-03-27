import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoLockup } from "@/components/blocks/logo-lockup";
import { Button } from "@/components/ui/button";
import { getCurrentViewer } from "@/lib/server/auth/dal";

export const metadata = { title: "GistMata — Na una get de mata." };

export default async function Home() {
  const viewer = await getCurrentViewer();

  if (viewer) {
    redirect(viewer.isOga ? "/oga" : "/mata");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-12">
      <div className="flex w-full max-w-sm flex-col gap-10">

        {/* Brand block */}
        <div className="space-y-4">
          <LogoLockup />
          <p className="text-3xl font-extrabold tracking-[-0.05em] leading-tight">
            Na una get de mata.
          </p>
          <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
            Anonymous, hyperlocal, text-first. No profiles. No noise. Just the gist.
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <Link href="/join" className="block">
            <Button className="w-full" size="lg">
              Join with code
            </Button>
          </Link>
          <Link href="/login" className="block">
            <Button variant="secondary" className="w-full" size="lg">
              Login
            </Button>
          </Link>
        </div>

        {/* Subtle trust line */}
        <p className="text-center text-xs leading-5 text-[var(--gm-ink-soft)]">
          No real name. No phone number. No profile photo.
          <br />
          Referral-gated entry. Your identity stays yours.
        </p>

      </div>
    </main>
  );
}
