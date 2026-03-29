import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DropGistForm } from "@/components/forms/drop-gist-form";
import { requireUser } from "@/lib/server/services/auth";

export default async function DropPage() {
  const viewer = await requireUser();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky-header flex items-center gap-6 px-4 py-3">
        <Link
          href="/mata"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[var(--nav-hover)]"
          aria-label="Back to Mata"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="text-[20px] font-bold">Drop Gist</h1>
      </div>

      {/* Compose form */}
      <div className="px-4 py-4">
        <DropGistForm viewer={viewer} />
      </div>
    </div>
  );
}
