import { moderateGistAction } from "@/lib/server/oga-actions";
import { PageHeader } from "@/components/blocks/page-header";
import { Card } from "@/components/ui/card";
import { getOgaGistsBundle } from "@/lib/server/store";

export default async function OgaGistsPage() {
  const gists = await getOgaGistsBundle();

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Oga" title="Gists" description="Filter-lite moderation list for remove and restore actions." />
      <Card className="grid gap-3 text-sm md:grid-cols-4">
        <div>Total: {gists.length}</div>
        <div>Removed: {gists.filter((gist) => gist.status === "removed").length}</div>
        <div>Active: {gists.filter((gist) => gist.status === "active").length}</div>
        <div>Personal area spread: {new Set(gists.map((gist) => gist.locationLabel)).size}</div>
      </Card>
      <div className="space-y-3">
        {gists.map((gist) => (
          <Card key={gist.id} className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">
                  @{gist.username} · {gist.locationLabel} · {gist.stateName}
                </p>
                <p className="text-xs text-[var(--gm-ink-soft)]">
                  {gist.tag} · {gist.authorTier} · {gist.reachLabel}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--gm-ink-soft)]">{gist.body}</p>
              </div>
              <form action={moderateGistAction}>
                <input type="hidden" name="gistId" value={gist.id} />
                <input
                  type="hidden"
                  name="status"
                  value={gist.status === "active" ? "removed" : "active"}
                />
                <button className="rounded-full border border-[var(--gm-border)] px-4 py-2 text-sm font-semibold">
                  {gist.status === "active" ? "Remove" : "Restore"}
                </button>
              </form>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
