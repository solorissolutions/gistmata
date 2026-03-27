import type { ReactNode } from "react";

import { OgaV2Rail } from "@/components/oga-v2/oga-v2-rail";
import { requireOgaV2 } from "@/lib/server/services/auth";
import { getOgaDashboardSnapshot } from "@/lib/server/services/oga";

export default async function OgaV2Layout({
  children,
}: {
  children: ReactNode;
}) {
  await requireOgaV2();
  const snapshot = await getOgaDashboardSnapshot();

  return (
    <div className="grid-shell">
      <OgaV2Rail items={snapshot.routeMap} chrome={snapshot.chrome} />
      <main className="page-column" id="main-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
