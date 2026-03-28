import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoLockup } from "@/components/blocks/logo-lockup";
import { LoginForm } from "@/components/forms/login-form";
import { Card } from "@/components/ui/card";
import {
  getOperatorDashboardDestination,
  getOperatorLoginDestination,
  getOperatorRecoveryDestination,
  hasStandaloneOperatorApp,
} from "@/lib/server/operator-app";
import { getCurrentUser } from "@/lib/server/services/auth";

export const metadata = { title: "Oga Login — GistMata" };

export default async function OgaLoginPage() {
  if (hasStandaloneOperatorApp()) {
    redirect(getOperatorLoginDestination());
  }

  const viewer = await getCurrentUser();

  if (viewer) {
    redirect(viewer.isOga ? getOperatorDashboardDestination() : "/mata");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <LogoLockup />
        <Link
          href="/login"
          className="text-sm font-semibold text-[var(--gm-green-deep)]"
        >
          Regular login
        </Link>
      </div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <p className="muted-label">Oga Access</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.05em]">
            Enter oga dashboard.
          </h1>
          <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
            Use the reserved oga username and PIN to enter the operator shell.
          </p>
        </div>

        <LoginForm />

        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
          If the session dropped fully, use{" "}
          <Link
            href={getOperatorRecoveryDestination()}
            className="font-semibold text-[var(--gm-green-deep)] underline underline-offset-2"
          >
            Account Code recovery
          </Link>
          .
        </p>
      </Card>
    </main>
  );
}
