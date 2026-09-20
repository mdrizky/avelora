"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export function BillingManager({
  plans,
  currentPlanId,
}: {
  plans: { id: string; name: string; price: number }[];
  currentPlanId: string;
}) {
  const [active, setActive] = useState(currentPlanId);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function activate(planId: string) {
    setBusyId(planId);
    setMsg(null);
    const r = await fetch("/api/billing/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: planId }),
    });
    const data = await r.json().catch(() => ({}));
    setBusyId(null);
    if (!r.ok) {
      setMsg(data.error ?? "Gagal mengaktifkan paket.");
      return;
    }
    setActive(planId);
    setMsg("Paket diaktifkan (simulasi demo). Fitur premium langsung terbuka.");
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-ink-800">Pilih Paket</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => {
          const isActive = active === p.id;
          return (
            <div
              key={p.id}
              className={`rounded-2xl border p-4 ${isActive ? "border-gold-400 bg-gold-50" : "border-ink-200 bg-white"}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink-800">{p.name}</p>
                {isActive && <Check size={15} className="text-gold-600" />}
              </div>
              <p className="mt-1 text-xl font-extrabold text-ink-900">
                {p.price === 0 ? "Rp0" : `Rp${p.price.toLocaleString("id-ID")}`}
                <span className="text-xs font-medium text-ink-400">/bulan</span>
              </p>
              <button
                onClick={() => activate(p.id)}
                disabled={isActive || busyId === p.id}
                className={`btn mt-3 w-full ${isActive ? "btn-outline" : "btn-primary"}`}
              >
                {busyId === p.id ? <Loader2 size={14} className="animate-spin" /> : isActive ? "Aktif" : "Aktifkan"}
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-ink-400">
        Demo: aktivasi berlangsung instan tanpa pembayaran. Integrasi payment gateway (Midtrans/Xendit) masuk rilis produksi.
      </p>
      {msg && <p className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">{msg}</p>}
    </div>
  );
}