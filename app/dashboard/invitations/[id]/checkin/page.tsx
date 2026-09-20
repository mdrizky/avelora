import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getEntitlements } from "@/lib/services/entitlement";
import { getInvitationById, isCheckedIn, listCheckins, listGuests } from "@/lib/db";
import { InvitationDetailHeader } from "@/components/dashboard/invitation-tabs";
import { CheckinApp } from "@/components/dashboard/checkin-app";

export default async function CheckinPage({
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
  const e = getEntitlements(user.id);
  const guests = listGuests(id);
  const checkins = listCheckins(id);

  return (
    <div className="space-y-6">
      <InvitationDetailHeader id={id} slug={invitation.slug} title={invitation.title} status={invitation.status} active="checkin" />
      <CheckinApp
        invitationId={id}
        slug={invitation.slug}
        premium={e.features.qr_checkin === true}
        guests={guests.map((g) => ({
          id: g.id,
          name: g.name,
          code: g.code,
          guest_slug: g.guest_slug,
          table_number: g.table_number ?? "",
          checked_in: isCheckedIn(g.id),
        }))}
        checkins={checkins.map((c) => ({
          id: c.id,
          guest_name: checkins.length ? (guests.find((g) => g.id === c.guest_id)?.name ?? c.guest_code) : c.guest_code,
          guest_code: c.guest_code,
          checked_in_at: c.checked_in_at,
        }))}
      />
    </div>
  );
}