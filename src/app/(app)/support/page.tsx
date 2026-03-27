import Link from "next/link";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/blocks/page-header";
import { BackButton } from "@/components/blocks/back-button";
import { Button } from "@/components/ui/button";
import { requireViewer } from "@/lib/server/auth/dal";

const FAQ = [
  {
    q: "How does anonymity work?",
    a: "You have no public name or photo. Your platform identity (@username · tier) is only visible to oga when you contact support. Gists show location context only.",
  },
  {
    q: "Who sees my Gists?",
    a: "Everyone in the relevant Mata zone can read your Gists. No follower graph — reach is determined by location and relevance, not popularity.",
  },
  {
    q: "How do I recover my account?",
    a: "Use your Account Code from /locker/recovery, or your PIN if you set one during onboarding. If you lose both, your account cannot be recovered.",
  },
  {
    q: "What is a Join Mouth (follow-up)?",
    a: "A follow-up Gist is a full new Gist linked to a parent. It continues the mata — not a reply, not a quote. Choose a relation type: confirm, counter, update, or same-for-my-side.",
  },
  {
    q: "What content is not allowed?",
    a: "Full names, phone numbers, residential addresses, or any real identity that can expose someone. Obvious patterns are blocked automatically before a Gist lands.",
  },
  {
    q: "How are tiers assigned?",
    a: "Tiers (Newcomer → Elder) are based on points from Gist drops and community trust signals. Check /score/tiers for the full breakdown.",
  },
];

export default async function SupportPage() {
  await requireViewer();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackButton fallbackHref="/mata" />
      <PageHeader
        eyebrow="Support"
        title="How can we help?"
        description="Common questions and direct lines to oga."
      />

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/contact-oga">
          <Card className="space-y-1 transition hover:-translate-y-0.5">
            <p className="font-extrabold tracking-[-0.03em]">Contact oga</p>
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              Send a message — Safety, Support, or Report issue.
            </p>
          </Card>
        </Link>
        <Link href="/locker/recovery">
          <Card className="space-y-1 transition hover:-translate-y-0.5">
            <p className="font-extrabold tracking-[-0.03em]">Account recovery</p>
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              Lost your Account Code or PIN? Start recovery here.
            </p>
          </Card>
        </Link>
        <Link href="/locker/privacy">
          <Card className="space-y-1 transition hover:-translate-y-0.5">
            <p className="font-extrabold tracking-[-0.03em]">Privacy rules</p>
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              The one thing GistMata no negotiates.
            </p>
          </Card>
        </Link>
        <Link href="/score/tiers">
          <Card className="space-y-1 transition hover:-translate-y-0.5">
            <p className="font-extrabold tracking-[-0.03em]">Tiers explained</p>
            <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
              Newcomer to Elder — how contribution ladder works.
            </p>
          </Card>
        </Link>
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        <p className="muted-label px-1">Common questions</p>
        {FAQ.map((item) => (
          <Card key={item.q} className="space-y-2">
            <p className="font-semibold leading-6">{item.q}</p>
            <p className="text-sm leading-7 text-[var(--gm-ink-soft)]">{item.a}</p>
          </Card>
        ))}
      </div>

      {/* Still stuck */}
      <Card className="space-y-3">
        <p className="font-extrabold tracking-[-0.03em]">Still stuck?</p>
        <p className="text-sm leading-6 text-[var(--gm-ink-soft)]">
          Oga dey available. Use the contact form and we go read am — no real name needed.
        </p>
        <Link href="/contact-oga">
          <Button>Message oga</Button>
        </Link>
      </Card>
    </div>
  );
}
