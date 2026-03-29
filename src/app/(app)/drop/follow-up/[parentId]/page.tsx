import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/blocks/back-button";
import { PageHeader } from "@/components/blocks/page-header";
import { FollowUpGistForm } from "@/components/forms/follow-up-gist-form";
import { requireUser } from "@/lib/server/services/auth";
import { getMatterBundleByGist } from "@/lib/server/services/matter";

export default async function FollowUpDropPage({
  params,
}: {
  params: Promise<{ parentId: string }>;
}) {
  const viewer = await requireUser();
  const { parentId } = await params;
  const detail = await getMatterBundleByGist(parentId, viewer);

  if (!detail || detail.gist.status !== "active") {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <BackButton fallbackHref={`/gist/${parentId}`} />
      <PageHeader
        eyebrow="Join mouth"
        title="Join this mata"
        description="You dey add your voice to an ongoing matter. This is your own full gist, linked to the original."
      />
      <Card className="space-y-5">
        <FollowUpGistForm parentGist={detail.gist} />
      </Card>
    </div>
  );
}
