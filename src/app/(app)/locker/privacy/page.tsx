import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/blocks/page-header";
import { BackButton } from "@/components/blocks/back-button";

export default function LockerPrivacyPage() {
  return (
    <div className="space-y-5">
      <BackButton fallbackHref="/locker" />
      <PageHeader
        eyebrow="Locker"
        title="Privacy"
        description="The one thing GistMata no negotiates."
      />
      <Card className="space-y-3 text-sm leading-7 text-[var(--gm-ink-soft)]">
        <p>No full names.</p>
        <p>No phone numbers.</p>
        <p>No residential addresses.</p>
        <p>No public real identity, no follower graph, no profile photo culture.</p>
        <p>Before a gist lands, obvious personal data patterns are blocked automatically.</p>
      </Card>
    </div>
  );
}
