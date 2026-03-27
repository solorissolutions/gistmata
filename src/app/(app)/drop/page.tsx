import { PageWithContextRail } from "@/components/app-shell/page-with-context-rail";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/blocks/page-header";
import { DropGistForm } from "@/components/forms/drop-gist-form";
import { BackButton } from "@/components/blocks/back-button";
import { requireUser } from "@/lib/server/services/auth";

export default async function DropPage() {
  const viewer = await requireUser();

  return (
    <PageWithContextRail
      storageKey="gm-drop-context-collapsed"
      mobileLabel="Drop context"
      sections={[
        {
          id: "rules",
          title: "Rules",
          defaultOpen: true,
          content: (
            <div className="space-y-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
              <p>Text only.</p>
              <p>One tag only.</p>
              <p>No hashtags. No media. No repost.</p>
            </div>
          ),
        },
        {
          id: "privacy",
          title: "Privacy",
          content: (
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              We use your current spot to place the gist in the right Mata. We no store raw coordinates for persistent app data.
            </p>
          ),
        },
      ]}
      main={
        <div className="space-y-5">
          <BackButton fallbackHref="/mata" />
          <PageHeader
            eyebrow="Drop Gist"
            title="Drop Gist"
            description="Text only. One tag only. We go ask for your current spot here and place am for the right Mata."
          />
          <Card className="space-y-5">
            <DropGistForm viewer={viewer} />
          </Card>
        </div>
      }
    />
  );
}
