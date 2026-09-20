import { requireUser } from "@/lib/auth/session";
import { getData, getPlan, getSubscription } from "@/lib/db";
import { getEntitlements } from "@/lib/services/entitlement";
import { BillingManager } from "@/components/dashboard/billing-manager";

export default async function BillingPage() {
  const user = await requireUser();
  const plans = getData().plans.filter((p) => p.is_active);
  const sub = getSubscription(user.id);
  const currentPlan = sub ? getPlan(sub.plan_id) : null;
  const e = getEntitlements(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-ink-900">Billing &amp; Paket</h1>
        <p className="mt-1 text-sm text-ink-400">
          Paket aktif: <b className="text-gold-600">{currentPlan?.display_name ?? "Gratis"}</b>
          {sub && sub.ends_at ? ` • berlaku s.d. ${new Date(sub.ends_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` : ""}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => (
          <Benefit key={p.id} label={p.display_name} active={currentPlan?.id === p.id} />
        ))}
        <div className="rounded-2xl border border-ink-200 bg-white p-4 lg:col-span-4">
          <p className="text-xs text-ink-500">
            <b>Paket kamu:</b> {e.features.templates === "all" ? "semua template" : "template gratis"} •{" "}
            {e.features.music ? "musik aktif" : "musik: Premium"} •{" "}
            {e.features.qr_checkin ? "QR check-in aktif" : "QR check-in: Premium"} •{" "}
            {e.features.custom_url ? "kustom URL aktif" : "kustom URL: Premium"} •{" "}
            {e.features.remove_branding ? "tanpa watermark" : "watermark Avlora"}.
          </p>
        </div>
      </div>

      <BillingManager plans={plans.map((p) => ({ id: p.id, name: p.display_name, price: p.price }))} currentPlanId={currentPlan?.id ?? "plan-free"} />
    </div>
  );
}

function Benefit({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${active ? "border-gold-400 bg-gold-50" : "border-ink-200 bg-white"}`}>
      <p className="text-sm font-bold text-ink-800">{label}</p>
      <p className={`mt-0.5 text-xs ${active ? "text-gold-700" : "text-ink-400"}`}>{active ? "Paket aktif" : "Tidak aktif"}</p>
    </div>
  );
}