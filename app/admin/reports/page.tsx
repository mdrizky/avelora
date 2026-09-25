import Link from "next/link";
import { LineChart } from "lucide-react";
import { ReportChart } from "@/components/admin/report-chart";
import { requireAdmin } from "@/lib/auth/session";
import { getData } from "@/lib/db";

export default async function AdminReportsPage() {
  await requireAdmin();
  const data = getData();
  const views = data.analytics_events.filter((event) => event.event_type === "view").length;
  const rsvps = data.analytics_events.filter((event) => event.event_type === "rsvp").length;
  const published = data.invitations.filter((invitation) => invitation.status === "published").length;
  const anchor = data.analytics_events.reduce((latest, event) => event.occurred_at > latest ? event.occurred_at : latest, data.analytics_events[0]?.occurred_at ?? "2026-01-01T00:00:00.000Z");
  const chartData = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(new Date(anchor).getTime() - (6 - index) * 86400000);
    const key = day.toISOString().slice(0, 10);
    return { label: day.toLocaleDateString("id-ID", { weekday: "short" }), views: data.analytics_events.filter((event) => event.occurred_at.slice(0, 10) === key && event.event_type === "view").length, rsvps: data.analytics_events.filter((event) => event.occurred_at.slice(0, 10) === key && event.event_type === "rsvp").length };
  });
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">Business intelligence</p><h1 className="mt-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-ink-900"><LineChart size={28} className="text-gold-500" /> Reports &amp; Analytics</h1><p className="mt-2 text-sm text-ink-500">Tren aktivitas publik dan funnel platform.</p></div><Link href="/api/admin/reports/export" className="btn btn-outline">Export CSV</Link></div><div className="grid gap-4 sm:grid-cols-3">{[["Visitor", views], ["RSVP", rsvps], ["Published", published]].map(([label, value]) => <div key={label} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm"><p className="text-sm text-ink-500">{label}</p><p className="mt-2 text-3xl font-extrabold">{value}</p></div>)}</div><section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"><h2 className="mb-4 text-lg font-extrabold">Views dan RSVP · 7 hari</h2><ReportChart data={chartData} /></section><section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm"><h2 className="text-lg font-extrabold">Funnel conversion</h2><div className="mt-6 space-y-4">{[["Visitor", views, "bg-gold-400"], ["RSVP", rsvps, "bg-sage-500"], ["Published", published, "bg-night-800"]].map(([label, value, color]) => <div key={label}><div className="mb-1 flex justify-between text-sm"><span>{label}</span><strong>{value}</strong></div><div className="h-3 rounded-full bg-ink-100"><div className={`h-3 rounded-full ${color}`} style={{ width: `${Math.max(4, Math.min(100, Number(value) / Math.max(1, views) * 100))}%` }} /></div></div>)}</div></section></div>;
}
