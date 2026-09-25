import { Users } from "lucide-react";
import { AdminUsersTable } from "@/components/admin/admin-data-table";
import { requireAdmin } from "@/lib/auth/session";
import { getData, getSubscription } from "@/lib/db";

export default async function AdminUsersPage() {
  await requireAdmin();
  const data = getData();
  const rows = data.profiles.map((profile) => ({
    id: profile.id,
    name: `${profile.first_name} ${profile.last_name}`,
    email: profile.email,
    role: profile.role,
    plan: getSubscription(profile.id)?.plan_id ?? "Free",
    invitations: data.invitations.filter((invitation) => invitation.owner_id === profile.id).length,
    suspended: profile.is_suspended,
    joined: new Date(profile.created_at).toLocaleDateString("id-ID"),
  }));
  return <div className="space-y-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">Access control</p><h1 className="mt-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-ink-900"><Users size={28} className="text-gold-500" /> Manajemen User</h1><p className="mt-2 text-sm text-ink-500">Cari, filter, dan pantau semua akun di platform.</p></div><span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-ink-600 shadow-sm">{rows.length} akun</span></div><AdminUsersTable rows={rows} /></div>;
}