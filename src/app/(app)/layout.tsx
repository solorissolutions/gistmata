import type { ReactNode } from "react";

import { BottomNav, LeftRail, RightSidebar } from "@/components/app-shell/nav-rails";
import { requireViewer } from "@/lib/server/auth/dal";

export default async function PublicAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const viewer = await requireViewer();

  return (
    <div className="grid-shell">
      {/* Desktop: Left navigation sidebar */}
      <LeftRail viewer={viewer} />

      {/* Main content - single scroll surface */}
      <main className="page-column" id="main-content" tabIndex={-1}>
        {children}
      </main>

      {/* Desktop: Right sidebar with search & widgets */}
      <RightSidebar viewer={viewer} />

      {/* Mobile: Bottom navigation */}
      <BottomNav />
    </div>
  );
}
