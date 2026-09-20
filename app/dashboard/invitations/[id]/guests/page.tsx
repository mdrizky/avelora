import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getData, getInvitationById, isCheckedIn, listGuests, listTables } from "@/lib/db";
import { InvitationDetailHeader } from "@/components/dashboard/invitation-tabs";
import { GuestsManager } from "@/components/dashboard/guests-manager";

export default async function GuestsPage({
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
  const tableNames = listTables(id).map((t) => t.table_name);
  const rsvpMap = new Map<string, string>();
  getData()
    .guest_rsvps.filter((r) => guests.some((g) => g.id === r.guest_id))
    .forEach((r) => rsvpMap.set(r.guest_id, r.status));

  return (
    <div className="space-y-6">
      <InvitationDetailHeader id={id} slug={invitation.slug} title={invitation.title} status={invitation.status} active="guests" />
      <GuestsManager
        invitationId={id}
        slug={invitation.slug}
        initialGuests={guests.map((g) => ({
          id: g.id,
          name: g.name,
          phone: g.phone ?? "",
          guest_slug: g.guest_slug,
          code: g.code,
          category: g.category ?? "",
          table_number: g.table_number ?? "",
          rsvp: rsvpMap.get(g.id) ?? "pending",
          checked_in: isCheckedIn(g.id),
        }))}
        tableNames={tableNames}
      />
    </div>
  );
}