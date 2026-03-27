import { BackButton } from "@/components/blocks/back-button";
import { PageWithContextRail } from "@/components/app-shell/page-with-context-rail";
import { PageHeader } from "@/components/blocks/page-header";
import { ContactOgaForm } from "@/components/forms/contact-oga-form";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/server/services/auth";
import { getContactOgaBundle } from "@/lib/server/services/contact";

export default async function ContactOgaPage() {
  const viewer = await requireUser();
  const data = await getContactOgaBundle(viewer);

  return (
    <PageWithContextRail
      storageKey="gm-contact-oga-context-collapsed"
      mobileLabel="Support context"
      sections={[
        {
          id: "identity",
          title: "What oga sees",
          defaultOpen: true,
          content: (
            <div className="space-y-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
              <p>Oga sees your platform identity only:</p>
              <p className="font-semibold text-[var(--foreground)]">{data.identity}</p>
              <p>No real name, no phone number, no profile photo.</p>
            </div>
          ),
        },
        {
          id: "tips",
          title: "Tips",
          content: (
            <div className="space-y-2 text-sm leading-6 text-[var(--gm-ink-soft)]">
              <p>Be direct: what happened, where you see am, and the gist link if you get am.</p>
              <p>If na recovery matter, add your Account Code reference.</p>
              <p>
                If na intel drop, tell oga whether na direct witness, trusted source,
                repeated pattern, or existing Gist continuation.
              </p>
            </div>
          ),
        },
      ]}
      main={
        <div className="space-y-5">
          <PageHeader
            eyebrow="Locker"
            title="Contact oga"
            description="Send message or structured intel to oga with your platform identity only."
            actions={<BackButton fallbackHref="/locker" />}
          />
          <Card className="space-y-5">
            <ContactOgaForm
              identity={data.identity}
              accountCodeReference={data.accountCodeReference}
            />
          </Card>
        </div>
      }
    />
  );
}
