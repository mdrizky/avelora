import { notFound } from "next/navigation";
import { Viewer } from "@/components/invitation/viewer";
import {
  getInvitationBySlug,
  getGuestBySlug,
  listSchedules,
  listGallery,
  listGifts,
  listMessages,
  getMusicTrack,
} from "@/lib/db";

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}) {
  const [p, sp] = await Promise.all([params, searchParams]);
  const invitation = getInvitationBySlug(p.slug);
  if (!invitation || invitation.status === "draft") notFound();

  const schedules = listSchedules(invitation.id);
  const gallery = listGallery(invitation.id);
  const gifts = listGifts(invitation.id);
  const messages = listMessages(invitation.id, "approved");

  const track = invitation.music_track_id
    ? getMusicTrack(invitation.music_track_id)
    : null;

  let guestName = "";
  let guestSlug = "";
  let guestId: string | null = null;
  if (sp.to) {
    const g = getGuestBySlug(invitation.id, sp.to.toLowerCase());
    if (g) {
      guestName = g.name;
      guestSlug = g.guest_slug;
      guestId = g.id;
    }
  }

  return (
    <Viewer
      invitation={{
        id: invitation.id,
        slug: invitation.slug,
        title: invitation.title,
        event_date: invitation.event_date ?? null,
        timezone: invitation.timezone,
        city: invitation.city ?? "",
        status: invitation.status,
        content_data: invitation.content_data,
        theme_config: invitation.theme_config,
      }}
      schedules={schedules}
      gallery={gallery.map((g) => ({ id: g.id, url: g.image_url, order: g.order_index }))}
      gifts={gifts}
      messages={messages.map((m) => ({
        id: m.id,
        guest_name: m.guest_name,
        message: m.message,
        is_featured: m.is_featured,
        created_at: m.created_at,
      }))}
      guestName={guestName}
      guestSlug={guestSlug}
      guestId={guestId}
      musicTrack={track ? { id: track.id, title: track.title, artist: track.artist, audio_url: track.audio_url } : null}
      invitationId={invitation.id}
    />
  );
}