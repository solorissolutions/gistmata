import { PinForm } from "@/components/forms/pin-form";
import { requireJoinDraft } from "@/lib/server/services/onboarding";

export default async function JoinPinPage() {
  await requireJoinDraft("username");

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="muted-label">Step 3</p>
        <h2 className="text-3xl font-extrabold tracking-[-0.05em]">Set your 6-digit PIN</h2>
        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
          Na this PIN plus your Account Code go bring you back if phone loss. No email reset dey here.
        </p>
      </div>
      <PinForm />
    </div>
  );
}
