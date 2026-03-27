import { BasicsForm } from "@/components/forms/basics-form";
import { requireJoinDraft } from "@/lib/server/services/onboarding";

export default async function JoinBasicsPage() {
  await requireJoinDraft("account-code");

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="muted-label">Step 5</p>
        <h2 className="text-3xl font-extrabold tracking-[-0.05em]">
          Small basics, nothing more.
        </h2>
        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
          State, age range, and gender only. No district, no interests, no profile culture.
        </p>
      </div>
      <BasicsForm />
    </div>
  );
}
