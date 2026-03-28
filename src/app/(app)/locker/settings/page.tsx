import { logoutAction } from "@/lib/server/auth-actions";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/blocks/page-header";
import { BackButton } from "@/components/blocks/back-button";
import { requireViewer } from "@/lib/server/auth/dal";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function LockerSettingsPage() {
  const viewer = await requireViewer();

  return (
    <div className="space-y-5">
      <BackButton fallbackHref="/locker" />
      <PageHeader
        eyebrow="Locker"
        title="Settings"
        description="Minimal session settings and local context only."
      />
      <Card className="space-y-3">
        <p className="muted-label">Current location</p>
        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
          {viewer.location
            ? `${viewer.location.displayLocality}, ${viewer.location.admin2Name}, ${viewer.homeState}`
            : `${viewer.homeState} only for now`}
        </p>
      </Card>
      <form action={logoutAction}>
        <SubmitButton idleLabel="Log out" pendingLabel="Leaving..." />
      </form>
    </div>
  );
}
