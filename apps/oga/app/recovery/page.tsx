import { redirect } from "next/navigation";

import { LogoLockup } from "@/components/blocks/logo-lockup";
import { Card } from "@/components/ui/card";

import { OperatorRecoveryForm } from "../../components/operator-recovery-form";
import { getOperatorViewer } from "../../lib/auth";

export const metadata = { title: "oga Recovery — GistMata" };

export default async function OperatorRecoveryPage() {
  const viewer = await getOperatorViewer();

  if (viewer?.isOga) {
    redirect("/oga-v2");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <LogoLockup href="/login" />

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <p className="muted-label">Operator recovery</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.05em]">
            Recover the oga session.
          </h1>
          <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
            Recovery uses the same reserved Account Code and PIN stored in the shared backend.
          </p>
        </div>

        <OperatorRecoveryForm />
      </Card>
    </main>
  );
}
