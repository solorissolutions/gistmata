import { PageHeader } from "@/components/blocks/page-header";
import { GistCard } from "@/components/gist/gist-card";
import { BackButton } from "@/components/blocks/back-button";
import { requireUser } from "@/lib/server/services/auth";
import { getViewerLockerBundle } from "@/lib/server/services/gist";

export default async function LockerMyGistsPage() {
  const viewer = await requireUser();
  const data = await getViewerLockerBundle(viewer);

  return (
    <div className="space-y-5">
      <BackButton fallbackHref="/locker" />
      <PageHeader
        eyebrow="Locker"
        title="My Gists"
        description="Only you fit see this list."
      />
      <div className="space-y-4">
        {data.myGists.map((gist) => (
          <GistCard key={gist.id} gist={gist} />
        ))}
      </div>
    </div>
  );
}
