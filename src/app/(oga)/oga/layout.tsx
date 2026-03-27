import type { ReactNode } from "react";

import { OgaRail } from "@/components/app-shell/oga-rail";
import { requireOgaViewer } from "@/lib/server/auth/dal";

export default async function OgaLayout({ children }: { children: ReactNode }) {
  await requireOgaViewer();

  return (
    <div className="grid-shell">
      <OgaRail />
      <main className="page-column" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
