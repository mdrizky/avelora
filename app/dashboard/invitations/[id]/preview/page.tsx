import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";

/**
 * Rute lama. redirected ke `app/preview/[id]` supaya pratinjau tidak lagi
 * ter-render sempit di dalam layout dashboard.
 */
export default async function LegacyPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  await requireUser();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const suffix = query.to ? `?to=${encodeURIComponent(query.to)}` : "";
  redirect(`/preview/${id}${suffix}`);
}
