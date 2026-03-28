"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { INITIAL_ACTION_STATE } from "@/lib/domain/validation";
import { loginAction } from "@/lib/server/auth-actions";

export function LoginForm({
  recoveryHref = "/locker/recovery",
}: {
  recoveryHref?: string;
}) {
  const [state, action] = useActionState(loginAction, INITIAL_ACTION_STATE);

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold">Username</span>
          <Input
            name="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="Your permanent username"
            aria-describedby={state.fieldErrors?.username ? "login-username-error" : undefined}
          />
          {state.fieldErrors?.username ? (
            <p id="login-username-error" className="text-sm text-[var(--destructive)]" role="alert">
              {state.fieldErrors.username[0]}
            </p>
          ) : null}
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold">PIN</span>
          <Input
            name="pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            autoComplete="current-password"
            placeholder="6-digit PIN"
            aria-describedby={state.fieldErrors?.pin ? "login-pin-error" : undefined}
          />
          {state.fieldErrors?.pin ? (
            <p id="login-pin-error" className="text-sm text-[var(--destructive)]" role="alert">
              {state.fieldErrors.pin[0]}
            </p>
          ) : null}
        </label>
      </div>

      {state.status === "error" && state.message && !state.fieldErrors ? (
        <p className="rounded-2xl bg-[var(--destructive-soft)] px-4 py-3 text-sm text-[var(--destructive)]" role="alert">
          {state.message}
        </p>
      ) : null}

      <SubmitButton idleLabel="Login" pendingLabel="Checking…" className="w-full" />

      <p className="text-center text-sm text-[var(--gm-ink-soft)]">
        Lost your session and need full recovery?{" "}
        <Link
          href={recoveryHref}
          className="font-semibold text-[var(--gm-green-deep)] underline underline-offset-2"
        >
          Use Account Code
        </Link>
      </p>
    </form>
  );
}
