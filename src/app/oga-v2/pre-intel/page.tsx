import { redirect } from "next/navigation";

export default async function OgaV2PreIntelPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedSearch = await searchParams;
  const q = resolvedSearch.q?.trim();

  redirect(q ? `/oga-v2/intel/live?q=${encodeURIComponent(q)}` : "/oga-v2/intel/live");
}
