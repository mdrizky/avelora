import { Builder } from "@/components/dashboard/builder";
import { requireUser } from "@/lib/auth/session";
import { listCategories, listTemplates } from "@/lib/db";
import { getEntitlements } from "@/lib/services/entitlement";

export default async function NewInvitationPage() {
  const user = await requireUser();
  const [categories, templates] = await Promise.all([listCategories(), listTemplates()]);
  const e = getEntitlements(user.id);

  return <Builder categories={categories} templates={templates} premiumAllowed={e.features.templates !== "free"} planLabel={e.planLabel} />;
}