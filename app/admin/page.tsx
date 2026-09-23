
import { getData, listAllMessages, listCategories, rsvpStats, listPlans, getSubscription } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { AdminActionButton, AdminTemplateForm } from "@/components/admin/admin-controls";

export default async function AdminPage() {
  const user = await requireAdmin();
  const data = getData();
  const pendingMessages = listAllMessages("pending");
  const users = getData().profiles;
  const plans = listPlans();
  const invitations = getData().invitations;
  const categories = listCategories();
  const analytics = data.analytics_events;
  const auditLogs = data.audit_logs.slice(0, 10);
  const invStats = data.invitations.reduce(
    (acc, inv) => {
      const _s = rsvpStats(inv.id);
      acc.totalInvites += 1;
      acc.attending += _s.counts.attending;
      return acc;
    },
    { totalInvites: 0, attending: 0 }
  );
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">Panel Admin AVELORA</h1>
          <p className="text-xs text-ink-400">Selamat Datang, {user.first_name} (admin)</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-ink-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Total Pengguna</p>
          <p className="mt-1 text-2xl font-extrabold text-ink-900">{users.length}</p>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Undangan Aktif</p>
          <p className="mt-1 text-2xl font-extrabold text-ink-900">{data.invitations.length}</p>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Total Tamu</p>
          <p className="mt-1 text-2xl font-extrabold text-ink-900">{data.guests.length}</p>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Konfirmasi Hadir</p>
          <p className="mt-1 text-2xl font-extrabold text-ink-900">{invStats.attending}</p>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Aktivitas publik</p>
          <p className="mt-1 text-2xl font-extrabold text-ink-900">{analytics.length}</p>
        </div>
      </div>
      <section className="rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="text-lg font-extrabold mb-4">Manajemen Pengguna</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-200">
                <th className="text-left p-3 text-xs font-medium text-ink-400">Nama</th>
                <th className="text-left p-3 text-xs font-medium text-ink-400">Email</th>
                <th className="text-left p-3 text-xs font-medium text-ink-400">Peran</th>
                <th className="text-left p-3 text-xs font-medium text-ink-400">Plan</th>
                <th className="text-left p-3 text-xs font-medium text-ink-400">Undangan</th>
                <th className="text-left p-3 text-xs font-medium text-ink-400">Status</th>
                <th className="text-left p-3 text-xs font-medium text-ink-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const sub = getSubscription(u.id);
                return (
                  <tr key={u.id} className="border-b border-ink-100 hover:bg-ink-50">
                    <td className="p-3">{u.first_name} {u.last_name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">
                      <span className={"rounded-full px-2 py-0.5 text-xs font-bold " + (u.role === "admin" ? "bg-gold-100 text-gold-700" : "bg-ink-100 text-ink-500")}>{u.role}</span>
                    </td>
                    <td className="p-3">{sub?.plan_id ?? "Free"}</td>
                    <td className="p-3">{data.invitations.filter((inv) => inv.owner_id === u.id).length}</td>
                    <td className="p-3">
                      <span className={"rounded-full px-2 py-0.5 text-xs font-bold " + (u.is_suspended ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700")}>{u.is_suspended ? "Suspended" : "Active"}</span>
                    </td>
                    <td className="p-3">
                      {u.role === "user" && <AdminActionButton type="suspend_user" id={u.id} active={!u.is_suspended} label={u.is_suspended ? "Aktifkan" : "Nonaktifkan"} />}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="text-lg font-extrabold mb-4">Semua Undangan</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-200">
                <th className="text-left p-3 text-xs font-medium text-ink-400">Slug</th>
                <th className="text-left p-3 text-xs font-medium text-ink-400">Judul</th>
                <th className="text-left p-3 text-xs font-medium text-ink-400">Status</th>
                <th className="text-left p-3 text-xs font-medium text-ink-400">Owner</th>
                <th className="text-left p-3 text-xs font-medium text-ink-400">Tamu</th>
                <th className="text-left p-3 text-xs font-medium text-ink-400">Tanggal</th>
                <th className="text-left p-3 text-xs font-medium text-ink-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => {
                const owner = data.profiles.find((p) => p.id === inv.owner_id);
                return (
                  <tr key={inv.id} className="border-b border-ink-100 hover:bg-ink-50">
                    <td className="p-3">
                      <a href={"/" + inv.slug} className="text-gold-600 hover:underline" target="_blank">{inv.slug}</a>
                    </td>
                    <td className="p-3">{inv.title}</td>
                    <td className="p-3">
                      <span className={"rounded-full px-2 py-0.5 text-xs font-bold " + (inv.status === "published" ? "bg-green-100 text-green-700" : inv.status === "draft" ? "bg-ink-100 text-ink-500" : inv.status === "memory" ? "bg-purple-100 text-purple-700" : "bg-red-100 text-red-700")}>{inv.status}</span>
                    </td>
                    <td className="p-3">{owner?.first_name ?? "-"} {owner?.last_name ?? ""}</td>
                    <td className="p-3">{data.guests.filter((g) => g.invitation_id === inv.id).length}</td>
                    <td className="p-3">{inv.event_date ? new Date(inv.event_date).toLocaleDateString("id-ID") : "-"}</td>
                    <td className="p-3"><AdminActionButton type="delete_invitation" id={inv.id} label="Hapus" /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="text-lg font-extrabold mb-4">Template & Paket</h2>
        <AdminTemplateForm categories={categories} />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold mb-2">Template ({data.templates.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-2 rounded border border-ink-100">
                  <span>{t.name} {t.is_premium ? "(Premium)" : "(Gratis)"}</span>
                  <span className="text-xs text-ink-400">{t.category_id}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Paket ({plans.length})</h3>
            <div className="space-y-2">
              {plans.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded border border-ink-100">
                  <span>{p.display_name}</span>
                  <span className="text-xs text-ink-400">Rp {p.price.toLocaleString("id-ID")}/{p.period}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="text-lg font-extrabold mb-4">Aktivitas Sistem Terbaru</h2>
        {auditLogs.length > 0 ? (
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-100 px-3 py-2 text-sm">
                <span><strong>{log.action}</strong> · {log.entity_type} {log.entity_id ?? ""}</span>
                <span className="text-xs text-ink-400">{new Date(log.created_at).toLocaleString("id-ID")}</span>
              </div>
            ))}
          </div>
        ) : <p className="text-ink-400">Belum ada aktivitas.</p>}
      </section>
      <section className="rounded-2xl border border-ink-200 bg-white p-6">
        <h2 className="text-lg font-extrabold mb-4">Pesan Menunggu Moderasi ({pendingMessages.length})</h2>
        {pendingMessages.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pendingMessages.map((m) => (
              <div key={m.id} className="p-3 rounded border border-ink-100">
                <p className="font-medium">{m.guest_name}</p>
                <p className="text-sm text-ink-600">{m.message.slice(0, 100)}...</p>
                <p className="text-xs text-ink-400">Undangan: {m.invitation_id}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-ink-400">Tidak ada pesan menunggu</p>
        )}
      </section>
    </div>
  );
}






