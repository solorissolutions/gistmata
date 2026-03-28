import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { LogoLockup } from "@/components/blocks/logo-lockup";
import { RecoveryForm } from "@/components/forms/recovery-form";
import { getCurrentUser } from "@/lib/server/services/auth";

export default async function RecoveryPage() {
  const viewer = await getCurrentUser();

  if (viewer) {
    redirect("/mata");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <LogoLockup />
      <Card className="space-y-5 p-6">
        <div className="space-y-2">
          <p className="muted-label">Locker</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.05em]">
            Bring your account back.
          </h1>
          <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
            Use your Account Code and PIN.
          </p>
        </div>
        <RecoveryForm />
      </Card>
    </main>
  );
}
