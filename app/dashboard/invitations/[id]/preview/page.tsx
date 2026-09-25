import Link from "next/link";
import { Eye, X } from "lucide-react";
import { notFound } from "next/navigation";
import { Viewer } from "@/components/invitation/viewer";
import { requireUser } from "@/lib/auth/session";
import { getInvitationById, getMusicTrack, getGuestBySlug, listGallery, listGifts, listMessages, listSchedules } from "@/lib/db";

export default async function InvitationPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const user = await requireUser();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const invitation = getInvitationById(id);
  if (!invitation || (invitation.owner_id !== user.id && user.role !== "admin")) notFound();

  const guest = query.to ? getGuestBySlug(invitation.id, query.to.toLowerCase()) : undefined;
  const track = invitation.music_track_id ? getMusicTrack(invitation.music_track_id) : null;

  return (
    <main className="min-h-screen bg-ink-900">
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-white/10 bg-ink-950/95 px-4 py-3 text-white backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-2 text-sm"><Eye size={16} className="shrink-0 text-gold-300" /><span className="truncate">Mode preview · {invitation.title}</span><span className="hidden rounded-full bg-gold-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gold-300 sm:inline">Tidak publik</span></div>
        <div className="flex shrink-0 items-center gap-2"><Link href={`/dashboard/invitations/${id}/edit`} className="hidden rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/10 sm:inline">Edit</Link><Link href={`/dashboard/invitations/${id}`} aria-label="Tutup preview" className="grid h-8 w-8 place-items-center rounded-lg border border-white/20 text-white hover:bg-white/10"><X size={16} /></Link></div>
      </div>
      <Viewer
        invitation={{ id: invitation.id, slug: invitation.slug, title: invitation.title, event_date: invitation.event_date ?? null, timezone: invitation.timezone, city: invitation.city ?? "", status: invitation.status, content_data: invitation.content_data, theme_config: invitation.theme_config }}
        schedules={listSchedules(id)}
        gallery={listGallery(id).map((item) => ({ id: item.id, url: item.image_url, order: item.order_index }))}
        gifts={listGifts(id)}
        messages={listMessages(id, "approved").map((message) => ({ id: message.id, guest_name: message.guest_name, message: message.message, is_featured: message.is_featured, created_at: message.created_at }))}
        guestName={guest?.name ?? ""}
        guestSlug={guest?.guest_slug ?? ""}
        guestId={guest?.id ?? null}
        musicTrack={track ? { id: track.id, title: track.title, artist: track.artist, audio_url: track.audio_url } : null}
        invitationId={invitation.id}
      />
    </main>
  );
}