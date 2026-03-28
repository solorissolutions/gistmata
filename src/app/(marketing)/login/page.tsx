import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { LogoLockup } from "@/components/blocks/logo-lockup";
import { LoginForm } from "@/components/forms/login-form";
import { getOperatorDashboardDestination } from "@/lib/server/operator-app";
import { getCurrentUser } from "@/lib/server/services/auth";

export const metadata = { title: "Login — GistMata" };

export default async function LoginPage() {
  const viewer = await getCurrentUser();

  if (viewer) {
    redirect(viewer.isOga ? getOperatorDashboardDestination() : "/mata");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <LogoLockup />
        <Link
          href="/join"
          className="text-sm font-semibold text-[var(--gm-green-deep)]"
        >
          New here? Join
        </Link>
      </div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <p className="muted-label">Welcome back</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.05em]">
            Enter your mata.
          </h1>
          <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
            Use the username and PIN you set when you joined. This is the quick
            way back if your session dropped.
          </p>
        </div>

        <LoginForm />
      </Card>
    </main>
  );
}
