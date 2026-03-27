import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { JOIN_DRAFT_COOKIE_NAME } from "@/lib/domain/constants";
import { getJoinDraft } from "@/lib/server/store";
import { acceptJoinRules } from "@/lib/server/auth-actions";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function JoinRulesPage() {
  const joinDraftId = (await cookies()).get(JOIN_DRAFT_COOKIE_NAME)?.value ?? null;
  const draft = await getJoinDraft(joinDraftId);

  if (!draft?.state) {
    redirect("/join");
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="muted-label">Step 6</p>
        <h2 className="text-3xl font-extrabold tracking-[-0.05em]">One rule only.</h2>
        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
          No full names, no phone numbers, no addresses.
        </p>
      </div>
      <div className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 text-sm leading-7 text-[var(--gm-ink-soft)]">
        Keep Mata anonymous. If your gist gets obvious personal info, we go block am before e land.
      </div>
      <form action={acceptJoinRules}>
        <SubmitButton idleLabel="Enter Mata" pendingLabel="Entering..." className="w-full" />
      </form>
    </div>
  );
}
