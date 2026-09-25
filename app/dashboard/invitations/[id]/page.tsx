import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { CalendarDays, Eye, ExternalLink, MapPin, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { analyticsFor, getInvitationById, listGuests, rsvpStats } from "@/lib/db";

const tabs = [
  { href: "", label: "Ringkasan", exact: true },
  { href: "guests", label: "Tamu" },
  { href: "guestbook", label: "Buku Tamu" },
  { href: "checkin", label: "Check-in" },
  { href: "seating", label: "Seating" },
  { href: "analytics", label: "Analitik" },
];

export default async function InvitationDetailPage({
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

  const guests = listGuests(id);
  const stats = rsvpStats(id);
  const analytics = analyticsFor(id);
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : "";
  const publicUrl = `${origin}/${invitation.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${invitation.status === "published" ? "bg-green-100 text-green-700" : "bg-ink-100 text-ink-500"}`}>
              {invitation.status === "published" ? "Teres" : invitation.status === "memory" ? "Memory" : "Draf"}
            </span>
            <h1 className="text-xl font-extrabold text-ink-900">{invitation.title}</h1>
          </div>
          <p className="mt-1 text-sm text-ink-400">/{invitation.slug}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/invitations/${id}/edit`} className="btn btn-primary">
            Edit Undangan
          </Link>
          <Link href={`/dashboard/invitations/${id}/preview`} className="btn btn-outline" target="_blank">
            <Eye size={14} /> Preview
          </Link>
          {invitation.status === "published" && (
            <a href={publicUrl} target="_blank" className="btn btn-outline">
              <ExternalLink size={14} /> Lihat
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-ink-200 pb-2">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={`/dashboard/invitations/${id}/${t.href}`}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              t.exact ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-900"
            }`}
          >
            {t.label}
          </Link>
        ))}
        <Link href={`/dashboard/invitations/${id}/edit`} className="ml-auto rounded-lg px-3 py-1.5 text-sm font-semibold text-gold-600 hover:text-gold-700">
          Buka Editor
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tamu" value={guests.length} icon={Users} />
        <StatCard label="Konfirmasi Hadir" value={stats.counts.attending} icon={CalendarDays} />
        <StatCard label="Perlihatkan" value={analytics.views} icon={Eye} />
        <StatCard
          label="Lokasi"
          value={invitation.city || "—"}
          icon={MapPin}
          small
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-ink-200 bg-white p-5">
          <h2 className="text-sm font-bold text-ink-800">Tautan Undangan</h2>
          <p className="mt-2 break-all rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">
            {publicUrl}
          </p>
          <p className="mt-2 text-xs text-ink-400">
            Bagikan tautan ini atau tambahkan parameter <code>?to=nama-tamu</code> agar pesan tamu personal. Contoh:{" "}
            <code className="rounded bg-ink-100 px-1">{`${publicUrl}?to=budi-santoso`}</code>
          </p>
        </div>
        <div className="rounded-2xl border border-ink-200 bg-white p-5">
          <h2 className="text-sm font-bold text-ink-800">Petunjuk Singkat</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-ink-600">
            <li>Edit konten & tema di Editor Undangan.</li>
            <li>Publikasikan untuk mengaktifkan tautan.</li>
            <li>Kelola tamu & undang via QR / tautan personal.</li>
            <li>Pantau RSVP, buku tamu, dan check-in.</li>
            <li>(Premium) QR check-in, seating, kustom URL.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  small,
}: {
  label: string;
  value: number | string;
  icon: typeof Eye;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{label}</p>
        <Icon size={15} className="text-gold-500" />
      </div>
      <p className={`mt-2 font-extrabold text-ink-900 ${small ? "text-lg truncate" : "text-3xl"}`}>{value}</p>
    </div>
  );
}