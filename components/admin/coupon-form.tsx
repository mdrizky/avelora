"use client";

import { FormEvent, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function CouponForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "create_coupon", name: form.get("code"), discount_type: form.get("discount_type"), discount_value: Number(form.get("discount_value")), quota: Number(form.get("quota")), expires_at: form.get("expires_at") || undefined }) });
    if (!response.ok) setError("Kupon gagal dibuat atau kode sudah dipakai.");
    else { event.currentTarget.reset(); router.refresh(); }
    setBusy(false);
  }
  return <form onSubmit={submit} className="grid gap-3 rounded-xl border border-dashed border-gold-300 bg-gold-50/40 p-4 md:grid-cols-5"><input name="code" required placeholder="WELCOME20" className="field" /><select name="discount_type" className="field"><option value="percent">Persen (%)</option><option value="amount">Nominal (Rp)</option></select><input name="discount_value" type="number" min="0" required placeholder="Nilai" className="field" /><input name="quota" type="number" min="1" required placeholder="Kuota" className="field" /><button disabled={busy} className="btn btn-gold">{busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Buat kupon</button>{error && <p className="text-sm text-red-600 md:col-span-5">{error}</p>}</form>;
}