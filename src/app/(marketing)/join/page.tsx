import { ReferralForm } from "@/components/forms/referral-form";

export default function JoinPage() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="muted-label">Step 1</p>
        <h2 className="text-3xl font-extrabold tracking-[-0.05em]">Who give you code?</h2>
        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
          GistMata no dey open signup. Enter the referral code first and we go clear your lane.
        </p>
      </div>
      <ReferralForm />
    </div>
  );
}
