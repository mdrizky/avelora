import Link from "next/link";
import {
  BarChart3,
  ExternalLink,
  Pencil,
  Settings2,
  Users,
} from "lucide-react";
import { InvitePreview } from "@/components/invite-preview";
import type { Invitation } from "@/lib/db/types";
import { analyticsFor, listGuests, rsvpStats } from "@/lib/db";

export function statusLabel(s: Invitation["status"]): string {
  return (
    { draft: "Draf", published: "Tayang", expired: "Berakhir", memory: "Kenangan" }[s] ?? s
  );
}

export function statusColor(s: Invitation["status"]): string {
  return (
    {
      draft: "bg-ink-100 text-ink-600",
      published: "bg-sage-100 text-sage-700",
      expired: "bg-ink-100 text-ink-500",
      memory: "bg-gold-100 text-gold-700",
    }[s] ?? "bg-ink-100 text-ink-600"
  );
}

export function InvitationCard({
  inv,
  showOwner = false,
}: {
  inv: Invitation;
  showOwner?: boolean;
}) {
  const published = inv.status === "published" || inv.status === "expired" || inv.status === "memory";
  const stats = analyticsFor(inv.id);
  const rsvp = rsvpStats(inv.id);
  const guestCount = listGuests(inv.id).length;
  return (
    <div className="card-subtle overflow-hidden rounded-2xl border border-ink-100 bg-white">
      <div className="relative">
        <InvitePreview
          theme={inv.theme_config}
          title={inv.content_data.cover.title}
          subtitle={inv.title}
          dateLabel={inv.event_date ?? ""}
          compact
        />
        <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusColor(inv.status)}`}>
          {statusLabel(inv.status)}
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="truncate font-bold text-ink-900">{inv.content_data.cover.title}</p>
          <p className="font-mono text-xs text-ink-500">/{inv.slug}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl bg-ivory-100 py-2">
            <p className="font-bold text-ink-900">{stats.views}</p>
            <p className="text-ink-500">Dilihat</p>
          </div>
          <div className="rounded-xl bg-ivory-100 py-2">
            <p className="font-bold text-ink-900">{rsvp.counts.attending}</p>
            <p className="text-ink-500">Hadir</p>
          </div>
          <div className="rounded-xl bg-ivory-100 py-2">
            <p className="font-bold text-ink-900">{guestCount}</p>
            <p className="text-ink-500">Tamu</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/dashboard/invitations/${inv.id}/edit`} className="btn btn-primary !py-2 !text-xs">
            <Pencil size={13} /> Edit
          </Link>
          <Link href={`/dashboard/invitations/${inv.id}`} className="btn btn-outline !py-2 !text-xs">
            <Settings2 size={13} /> Kelola
          </Link>
        </div>
        <div className="flex items-center justify-between border-t border-ink-100 pt-2 text-xs text-ink-500">
          <Link href={`/dashboard/invitations/${inv.id}/preview`} className="inline-flex items-center gap-1 font-semibold text-gold-600 hover:text-gold-700" target="_blank">
            <ExternalLink size={13} /> Preview
          </Link>
          <Link href={`/dashboard/invitations/${inv.id}/guests`} className="inline-flex items-center gap-1 hover:text-gold-600">
            <Users size={13} /> Tamu
          </Link>
          <Link href={`/dashboard/invitations/${inv.id}/analytics`} className="inline-flex items-center gap-1 hover:text-gold-600">
            <BarChart3 size={13} /> Analitik
          </Link>
          {published ? (
            <Link href={`/${inv.slug}`} className="inline-flex items-center gap-1 hover:text-gold-600" target="_blank">
              <ExternalLink size={13} /> Lihat
            </Link>
          ) : (
            <span className="text-ink-300">Belum tayang</span>
          )}
        </div>
        {showOwner && <p className="truncate border-t border-ink-100 pt-2 text-xs text-ink-500">dimiliki oleh {inv.owner_id}</p>}
      </div>
    </div>
  );
}