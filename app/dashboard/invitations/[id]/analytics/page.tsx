import { notFound } from "next/navigation";
import { Eye, MessageSquareHeart, Send, Smartphone } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { analyticsFor, getInvitationById } from "@/lib/db";
import { InvitationDetailHeader } from "@/components/dashboard/invitation-tabs";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const invitation = getInvitationById(id);
  if (!invitation || (invitation.owner_id !== user.id && user.role !== "admin")) {
    notFound();
  }
  const a = analyticsFor(id);
  const maxDay = Math.max(1, ...a.last7.map((d) => d.count));

  return (
    <div className="space-y-6">
      <InvitationDetailHeader id={id} slug={invitation.slug} title={invitation.title} status={invitation.status} active="analytics" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat icon={Eye} label="Total Telah Dibuka" value={a.views} />
        <MiniStat icon={Eye} label="Pengunjung Unik" value={a.unique} />
        <MiniStat icon={Send} label="Konfirmasi RSVP" value={a.rsvps} />
        <MiniStat icon={MessageSquareHeart} label="Ucapan Buku Tamu" value={a.guestbook} />
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-5">
        <h2 className="text-sm font-bold text-ink-800">Perlihatkan 7 Hari Terakhir</h2>
        <div className="mt-4 flex h-40 items-end gap-2">
          {a.last7.map((d) => (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-ink-500">{d.count}</span>
              <div
                className="w-full rounded-t-md bg-gold-400 transition-all"
                style={{ height: `${Math.round((d.count / maxDay) * 100)}%`, minHeight: d.count ? 6 : 2, opacity: d.count ? 1 : 0.15 }}
              />
              <span className="text-[10px] text-ink-400">{d.day.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-ink-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-bold text-ink-800">
            <Smartphone size={15} className="text-gold-500" /> Perangkat
          </h2>
          <BarList data={a.byDevice} />
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-5">
          <h2 className="text-sm font-bold text-ink-800">Peramban</h2>
          <BarList data={a.byBrowser} />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
        <Icon size={15} className="text-gold-500" />
      </div>
      <p className="mt-2 text-3xl font-extrabold text-ink-900">{value}</p>
    </div>
  );
}

function BarList({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  if (!entries.length) return <p className="mt-3 text-sm text-ink-400">Belum ada data.</p>;
  return (
    <div className="mt-3 space-y-2">
      {entries.map(([k, v]) => (
        <div key={k} className="flex items-center gap-2">
          <span className="w-24 truncate text-xs text-ink-600 capitalize">{k || "unknown"}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-100">
            <div className="h-full rounded-full bg-gold-400" style={{ width: `${(v / max) * 100}%` }} />
          </div>
          <span className="w-8 text-right text-xs font-semibold text-ink-600">{v}</span>
        </div>
      ))}
    </div>
  );
}