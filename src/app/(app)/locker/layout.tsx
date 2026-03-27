import Link from "next/link";
import type { ReactNode } from "react";

import { PageWithContextRail } from "@/components/app-shell/page-with-context-rail";
import { requireViewer } from "@/lib/server/auth/dal";

export default async function LockerLayout({ children }: { children: ReactNode }) {
  const viewer = await requireViewer();

  return (
    <PageWithContextRail
      storageKey="gm-locker-context-collapsed"
      mobileLabel="Locker context"
      sections={[
        {
          id: "identity",
          title: "Private identity",
          defaultOpen: true,
          content: (
            <div className="space-y-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
              <p className="font-semibold text-[var(--foreground)]">@{viewer.username} · {viewer.tier}</p>
              <p>Locker data no be public profile. Na your private utility space.</p>
            </div>
          ),
        },
        {
          id: "safety",
          title: "Safety baseline",
          content: (
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              No full names, no phone numbers, and no residential addresses in any gist or support note.
            </p>
          ),
        },
        {
          id: "support",
          title: "Need help?",
          content: (
            <div className="space-y-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
              <Link href="/contact-oga" className="font-semibold text-[var(--accent)]">
                Contact oga
              </Link>
              <p>Recovery still depends on Account Code + PIN.</p>
            </div>
          ),
        },
      ]}
      main={<div className="mx-auto w-full max-w-4xl space-y-5">{children}</div>}
    />
  );
}
