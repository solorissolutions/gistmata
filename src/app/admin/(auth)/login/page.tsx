import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm items-center justify-center px-6">
      <div className="w-full">
        <h1 className="text-center text-xl font-light tracking-tight">
          Gistmata CMS
        </h1>

        {process.env.NODE_ENV === "production" && (
          <div className="mt-4 rounded border border-amber-500/30 bg-amber-50/50 p-3 text-center text-xs text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
            Authorized administrators only.
          </div>
        )}

        <form
          action="/api/auth/callback/credentials"
          method="POST"
          className="mt-8 space-y-4"
        >
          <input type="hidden" name="csrfToken" id="csrfField" value="" />
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-muted-foreground"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 block w-full border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-muted-foreground"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1 block w-full border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full border border-foreground px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Sign in
          </button>
        </form>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
            fetch("/api/auth/csrf")
              .then(function(r) { return r.json(); })
              .then(function(d) {
                document.getElementById("csrfField").value = d.csrfToken;
              });
          `,
        }}
      />
    </div>
  );
}
