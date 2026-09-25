import { Megaphone } from "lucide-react";
import { BroadcastForm } from "@/components/admin/platform-forms";
import { requireAdmin } from "@/lib/auth/session";
import { getData } from "@/lib/db";

export default async function AdminBroadcastPage() {
  await requireAdmin();
  const broadcasts = getData().broadcasts;
  return <div className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">Communication</p><h1 className="mt-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-ink-900"><Megaphone size={28} className="text-gold-500" /> Broadcast</h1><p className="mt-2 text-sm text-ink-500">Kirim pengumuman platform ke pengguna.</p></div><section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-extrabold">Buat broadcast</h2><BroadcastForm /></section><section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-extrabold">Riwayat broadcast</h2><div className="mt-4 space-y-3">{broadcasts.map((item) => <div key={item.id} className="rounded-xl border border-ink-100 p-4"><div className="flex justify-between gap-3"><strong>{item.title}</strong><span className="text-xs text-ink-400">{new Date(item.sent_at).toLocaleString("id-ID")}</span></div><p className="mt-1 text-sm text-ink-500">{item.body}</p><p className="mt-2 text-xs text-gold-700">Target: {item.target} · {item.recipient_count} penerima</p></div>)}{!broadcasts.length && <p className="mt-4 text-sm text-ink-400">Belum ada broadcast.</p>}</div></section></div>;
}