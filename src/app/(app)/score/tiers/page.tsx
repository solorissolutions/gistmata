import { PageWithContextRail } from "@/components/app-shell/page-with-context-rail";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/blocks/page-header";
import { BackButton } from "@/components/blocks/back-button";
import { TIER_DEFINITIONS } from "@/lib/domain/constants";

export default function TiersPage() {
  return (
    <PageWithContextRail
      storageKey="gm-score-tiers-context-collapsed"
      mobileLabel="Tier context"
      sections={[
        {
          id: "why",
          title: "Why tiers exist",
          defaultOpen: true,
          content: (
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              Tiers are a simple ladder for contribution and trust — not popularity.
            </p>
          ),
        },
        {
          id: "not-social",
          title: "Not social-graph",
          content: (
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              No followers, no likes-for-clout. Mata is about local gist and signal.
            </p>
          ),
        },
      ]}
      main={
        <div className="space-y-5">
          <BackButton fallbackHref="/score" />
          <PageHeader
            eyebrow="Score"
            title="Tiers"
            description="Simple ladder for contribution and trust."
          />
          <div className="grid gap-4">
            {TIER_DEFINITIONS.map((tier) => (
              <Card key={tier.tier} className="space-y-2">
                <p className="muted-label">{tier.minPoints}+ points</p>
                <h2 className="text-2xl font-extrabold tracking-[-0.05em]">{tier.tier}</h2>
                <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
                  {tier.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      }
    />
  );
}
