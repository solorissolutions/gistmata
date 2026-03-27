import Link from "next/link";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/blocks/page-header";

const items = [
  { href: "/locker/my-gists", label: "My Gists", text: "Private list of your own drops." },
  { href: "/locker/referrals", label: "Referrals", text: "See your referral allowance and issued codes." },
  { href: "/locker/recovery", label: "Recovery", text: "Account Code and PIN recovery path." },
  { href: "/locker/privacy", label: "Privacy", text: "Read the anonymity and safety rules." },
  { href: "/locker/settings", label: "Settings", text: "Session and local preferences only." },
];

export default function LockerPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Locker"
        title="Locker"
        description="Locker is your private utility zone. No public profile culture here."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="space-y-2 transition hover:-translate-y-0.5">
              <h2 className="text-xl font-extrabold tracking-[-0.04em]">{item.label}</h2>
              <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">{item.text}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
