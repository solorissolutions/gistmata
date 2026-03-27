import type { ReactNode } from "react";

import { BottomNav, LeftRail } from "@/components/app-shell/nav-rails";
import { requireViewer } from "@/lib/server/auth/dal";

export default async function PublicAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const viewer = await requireViewer();

  return (
    <>
      {/* Desktop: h-screen shell with only page-column scrolling.
          Mobile: normal document flow; BottomNav is fixed at bottom. */}
      <div className="grid-shell">
        <LeftRail viewer={viewer} />
        <main className="page-column" id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      <BottomNav />
    </>
  );
}
