import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  LayoutGrid,
  Plus,
  Sparkles,
} from "lucide-react";
import { InvitationCard } from "@/components/dashboard/invitation-card";
import { requireUser } from "@/lib/auth/session";
import { getEntitlements, getInvitationCap } from "@/lib/services/entitlement";
import {
  listInvitationsByOwner,
  listNotifications,
} from "@/lib/db";
import { timeAgo } from "@/lib/theme";

export default async function DashboardOverview() {
  const user = await requireUser();
  const invitations = listInvitationsByOwner(user.id);
  const cap = getInvitationCap(user.id);
  const atLimit = cap !== "unlimited" && invitations.length >= cap;
  const e = getEntitlements(user.id);
  const notifications = listNotifications(user.id).slice(0, 4);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Ringkasan</h1>
          <p className="mt-1 text-sm text-ink-500">
            Kelola undangan, tamu, dan analitik dalam satu tempat.
          </p>
        </div>
        <Link
          href={atLimit ? "/dashboard/billing" : "/dashboard/invitations/new"}
          className="btn btn-gold"
        >
          <Plus size={16} /> {atLimit ? "Capai Limit — Upgrade" : "Undangan Baru"}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total undangan", value: invitations.length, icon: LayoutGrid },
          { label: "Undangan tayang", value: invitations.filter((i) => i.status === "published").length, icon: CheckCircle2 },
          { label: "Notifikasi belum dibaca", value: notifications.filter((n) => !n.read).length, icon: Bell },
          { label: "Paket aktif", value: e.planLabel, icon: Sparkles },
        ].map((s) => (
          <div key={s.label} className="card-subtle rounded-2xl border border-ink-100 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink-500">{s.label}</p>
              <s.icon size={17} className="text-gold-500" />
            </div>
            <p className="mt-2 text-2xl font-extrabold text-ink-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Invitations grid */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Undangan Anda</h2>
          {invitations.length > 0 && (
            <Link href="/dashboard/invitations" className="inline-flex items-center gap-1 text-sm font-semibold text-gold-600 hover:underline">
              Lihat semua <ArrowRight size={14} />
            </Link>
          )}
        </div>
        {invitations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
            <LayoutGrid size={36} className="mx-auto text-ink-300" />
            <h3 className="mt-4 text-lg font-bold text-ink-900">Belum ada undangan</h3>
            <p className="mt-1 text-sm text-ink-500">Buat undangan pertama Anda dalam 20 menit.</p>
            <Link href="/dashboard/invitations/new" className="btn btn-gold mt-5">
              <Plus size={16} /> Buat Undangan
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {invitations.map((inv) => (
              <InvitationCard key={inv.id} inv={inv} />
            ))}
          </div>
        )}
      </section>

      {/* Recent notifications */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink-900">Notifikasi terbaru</h2>
          <Link href="/dashboard/notifications" className="text-sm font-semibold text-gold-600 hover:underline">Semua</Link>
        </div>
        <div className="card-subtle overflow-hidden rounded-2xl border border-ink-100 bg-white">
          {notifications.length === 0 ? (
            <p className="p-6 text-sm text-ink-500">Belum ada notifikasi.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {notifications.map((n) => (
                <li key={n.id} className="flex items-start gap-3 px-5 py-4">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-ink-200" : "bg-gold-500"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink-900">{n.title}</p>
                    <p className="truncate text-sm text-ink-500">{n.body}</p>
                    <p className="mt-0.5 text-xs text-ink-300">{timeAgo(n.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}