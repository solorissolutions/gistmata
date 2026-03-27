import { UsernameForm } from "@/components/forms/username-form";
import { requireJoinDraft } from "@/lib/server/services/onboarding";

export default async function JoinUsernamePage() {
  const draft = await requireJoinDraft();

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="muted-label">Step 2</p>
        <h2 className="text-3xl font-extrabold tracking-[-0.05em]">
          Pick am well. You no fit change am later.
        </h2>
        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
          Username must be unique across the whole Mata.
        </p>
      </div>
      <UsernameForm suggested={draft.username ?? undefined} />
    </div>
  );
}
