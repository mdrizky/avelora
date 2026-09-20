import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getInvitationById, listMessages } from "@/lib/db";
import { InvitationDetailHeader } from "@/components/dashboard/invitation-tabs";
import { GuestbookModeration } from "@/components/dashboard/guestbook-moderation";

export default async function GuestbookPage({
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
  const messages = listMessages(id, "all");

  return (
    <div className="space-y-6">
      <InvitationDetailHeader id={id} slug={invitation.slug} title={invitation.title} status={invitation.status} active="guestbook" />
      <GuestbookModeration
        initialMessages={messages.map((m) => ({
          id: m.id,
          guest_name: m.guest_name,
          message: m.message,
          status: m.status,
          is_featured: m.is_featured,
          created_at: m.created_at,
        }))}
      />
    </div>
  );
}