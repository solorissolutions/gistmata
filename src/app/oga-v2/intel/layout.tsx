import type { ReactNode } from "react";

import { IntelShell } from "@/components/oga-v2/intel-shell";

export default function OgaV2IntelLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="space-y-5">
      <IntelShell />
      {children}
    </div>
  );
}
