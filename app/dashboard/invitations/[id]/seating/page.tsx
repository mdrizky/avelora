import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getInvitationById, listTables, listGuests } from "@/lib/db";
import { InvitationDetailHeader } from "@/components/dashboard/invitation-tabs";
import { SeatingManager } from "@/components/dashboard/seating-manager";

export default async function SeatingPage({
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
  const tables = listTables(id);
  const guests = listGuests(id);

  return (
    <div className="space-y-6">
      <InvitationDetailHeader id={id} slug={invitation.slug} title={invitation.title} status={invitation.status} active="seating" />
      <SeatingManager
        tables={tables.map((t) => ({ table_name: t.table_name, capacity: t.capacity }))}
        guests={guests.map((g) => ({ id: g.id, name: g.name, table_number: g.table_number ?? "" }))}
      />
    </div>
  );
}