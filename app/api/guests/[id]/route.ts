import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { deleteGuest, getGuestById, getInvitationById, updateGuest } from "@/lib/db";

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().max(80).optional(),
  invited_count: z.number().int().min(1).max(20).optional(),
  category: z.string().max(40).optional(),
  table_number: z.string().max(40).optional(),
  notes: z.string().max(300).optional(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const guest = getGuestById(id);
  if (!guest) return NextResponse.json({ error: "Tamu tidak ditemukan" }, { status: 404 });
  const inv = getInvitationById(guest.invitation_id);
  if (!inv || (inv.owner_id !== user.id && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let input;
  try {
    input = patchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const patch: Record<string, unknown> = {};
  for (const key of ["name", "phone", "email", "invited_count", "category", "table_number", "notes"] as const) {
    if (input[key] !== undefined) patch[key] = input[key];
  }
  const guestId = id;
  updateGuest(guestId, patch as Parameters<typeof updateGuest>[1]);
  return NextResponse.json({ ok: true, guest: getGuestById(guestId) });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const guest = getGuestById(id);
  if (!guest) return NextResponse.json({ error: "Tamu tidak ditemukan" }, { status: 404 });
  const inv = getInvitationById(guest.invitation_id);
  if (!inv || (inv.owner_id !== user.id && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  deleteGuest(id);
  return NextResponse.json({ ok: true });
}