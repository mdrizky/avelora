import { redirect } from "next/navigation";
import { Editor } from "@/components/editor/editor";
import { requireUser } from "@/lib/auth/session";
import { getInvitationById, getData, listGifts, listSchedules, listGallery } from "@/lib/db";
import { getEntitlements } from "@/lib/services/entitlement";

export default async function EditInvitationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const invitation = getInvitationById(id);
  if (!invitation || (invitation.owner_id !== user.id && user.role !== "admin")) {
    redirect("/dashboard/invitations");
  }
  const [tracks, gifts, schedules, gallery] = [
    getData().music_tracks.filter((m) => m.is_active),
    listGifts(id),
    listSchedules(id),
    listGallery(id),
  ];
  const e = getEntitlements(user.id);

  return (
    <Editor
      invitation={{
        id: invitation.id,
        slug: invitation.slug,
        title: invitation.title,
        status: invitation.status === "published" ? "published" : "draft",
        event_date: invitation.event_date ?? "",
        timezone: invitation.timezone,
        city: invitation.city ?? "",
        music_track_id: invitation.music_track_id ?? "",
        content_data: invitation.content_data,
        theme_config: invitation.theme_config,
      }}
      themeConfig={invitation.theme_config}
      musicTracks={tracks.map((t) => ({ id: t.id, title: t.title, artist: t.artist }))}
      gifts={gifts}
      schedules={schedules}
      gallery={gallery.map((g) => ({ id: g.id, url: g.image_url, order: g.order_index }))}
      entitlement={{
        planLabel: e.planLabel,
        premiumAllowed: e.features.templates !== "free",
        canMusic: e.features.music === true,
        canCustomUrl: e.features.custom_url === true,
        canRemoveBranding: e.features.remove_branding === true,
      }}
    />
  );
}