import { CreditCard } from "lucide-react";
import { OrderAction } from "@/components/admin/order-action";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth/session";
import { getData } from "@/lib/db";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const data = getData();
  const paid = data.orders.filter((order) => order.status === "paid");
  const pending = data.orders.filter((order) => order.status === "pending");
  return (
    <div className="space-y-6">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">Revenue control</p><h1 className="mt-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-ink-900"><CreditCard size={28} className="text-gold-500" /> Order &amp; Pembayaran</h1><p className="mt-2 text-sm text-ink-500">Pantau, verifikasi, dan refund transaksi pengguna.</p></div>
      <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-ink-100 bg-white p-5"><p className="text-sm text-ink-500">Total order</p><p className="mt-2 text-3xl font-extrabold">{data.orders.length}</p></div><div className="rounded-2xl border border-ink-100 bg-white p-5"><p className="text-sm text-ink-500">Revenue tercatat</p><p className="mt-2 text-3xl font-extrabold">Rp {paid.reduce((sum, order) => sum + order.amount, 0).toLocaleString("id-ID")}</p></div><div className="rounded-2xl border border-ink-100 bg-white p-5"><p className="text-sm text-ink-500">Pending verifikasi</p><p className="mt-2 text-3xl font-extrabold text-gold-700">{pending.length}</p></div></div>
      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm"><table className="w-full min-w-[840px] text-left"><thead className="bg-[#fbfaf7] text-xs uppercase tracking-wider text-ink-400"><tr><th className="px-5 py-3">Order</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Jumlah</th><th className="px-4 py-3">Metode</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Tanggal</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-ink-100">{data.orders.map((order) => { const owner = data.profiles.find((profile) => profile.id === order.owner_id); return <tr key={order.id} className="hover:bg-[#fcfbf8]"><td className="px-5 py-4 font-mono text-xs">{order.id}</td><td className="px-4 py-4 text-sm">{owner?.email ?? order.owner_id}</td><td className="px-4 py-4 text-sm font-bold">Rp {order.amount.toLocaleString("id-ID")}</td><td className="px-4 py-4 text-sm text-ink-500">{order.payment_method ?? "-"}</td><td className="px-4 py-4"><StatusBadge tone={order.status === "paid" ? "active" : order.status === "pending" ? "suspended" : order.status === "refunded" ? "pending" : "banned"}>{order.status}</StatusBadge></td><td className="px-4 py-4 text-sm text-ink-500">{new Date(order.created_at).toLocaleDateString("id-ID")}</td><td className="px-5 py-4 text-right">{order.status === "pending" ? <OrderAction id={order.id} status="paid" label="Verifikasi" /> : order.status === "paid" ? <OrderAction id={order.id} status="refunded" label="Refund" /> : null}</td></tr>; })}</tbody></table>{data.orders.length === 0 && <div className="p-12 text-center text-sm text-ink-400">Belum ada transaksi.</div>}</div>
    </div>
  );
}
