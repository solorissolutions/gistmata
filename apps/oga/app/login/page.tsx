import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoLockup } from "@/components/blocks/logo-lockup";
import { Card } from "@/components/ui/card";

import { OperatorLoginForm } from "../../components/operator-login-form";
import { getOperatorViewer } from "../../lib/auth";

export const metadata = { title: "oga Login — GistMata" };

export default async function OperatorLoginPage() {
  const viewer = await getOperatorViewer();

  if (viewer?.isOga) {
    redirect("/oga-v2");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <LogoLockup href="/login" />
        <Link
          href={process.env.NEXT_PUBLIC_PUBLIC_APP_URL ?? "https://gistmata.com"}
          className="text-sm font-semibold text-[var(--gm-green-deep)]"
        >
          Public app
        </Link>
      </div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <p className="muted-label">Operator access</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.05em]">
            Enter the standalone control room.
          </h1>
          <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
            This deployment is the dedicated oga surface. It uses the same backend truth as the public app.
          </p>
        </div>

        <OperatorLoginForm />
      </Card>
    </main>
  );
}
