import type { ReactNode } from "react";
import { cookies } from "next/headers";

import { LogoLockup } from "@/components/blocks/logo-lockup";
import { JoinProgress } from "@/components/join/join-progress";
import { Card } from "@/components/ui/card";
import { JOIN_DRAFT_COOKIE_NAME } from "@/lib/domain/constants";
import { getJoinDraft } from "@/lib/server/store";

export default async function JoinLayout({ children }: { children: ReactNode }) {
  const joinDraftId = (await cookies()).get(JOIN_DRAFT_COOKIE_NAME)?.value ?? null;
  const draft = await getJoinDraft(joinDraftId);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-6 lg:px-6">
      <LogoLockup />
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="space-y-5 p-6">
          <JoinProgress
            draft={
              draft
                ? {
                    referralCode: draft.referralCode,
                    username: draft.username,
                    accountCode: draft.accountCode,
                  }
                : null
            }
          />
        </Card>
        <Card className="p-6">{children}</Card>
      </div>
    </main>
  );
}
