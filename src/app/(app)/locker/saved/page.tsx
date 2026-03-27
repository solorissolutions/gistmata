import { BackButton } from "@/components/blocks/back-button";
import { PageHeader } from "@/components/blocks/page-header";
import { GistCard } from "@/components/gist/gist-card";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/server/services/auth";
import { getViewerLockerBundle } from "@/lib/server/services/gist";

export default async function LockerSavedPage() {
  const viewer = await requireUser();
  const data = await getViewerLockerBundle(viewer);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Locker"
        title="Saved"
        description="Private bookmarks for the Gists you want to return to."
        actions={<BackButton fallbackHref="/locker" />}
      />
      <div className="space-y-4">
        {data.savedGists.length === 0 ? (
          <Card className="space-y-2">
            <p className="text-lg font-extrabold tracking-[-0.04em]">No saved Gists yet.</p>
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              Save a Gist from Mata or detail view and e go land here.
            </p>
          </Card>
        ) : (
          data.savedGists.map((gist) => <GistCard key={gist.id} gist={gist} />)
        )}
      </div>
    </div>
  );
}
