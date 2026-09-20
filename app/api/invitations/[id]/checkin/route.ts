import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { checkIn, getGuestById, getGuestByCode, getInvitationById, listCheckins } from "@/lib/db";

const bodySchema = z.object({
  guest_id: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
});

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const inv = getInvitationById(id);
  if (!inv || (inv.owner_id !== user.id && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  let input;
  try {
    input = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const guest = input.guest_id
    ? getGuestById(input.guest_id)
    : input.code
      ? getGuestByCode(input.code)
      : undefined;
  if (!guest || guest.invitation_id !== id) {
    return NextResponse.json({ error: "Tamu tidak ditemukan" }, { status: 404 });
  }
  checkIn(guest.id, user.id);
  return NextResponse.json({ ok: true, guest: { id: guest.id, name: guest.name, code: guest.code } });
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const inv = getInvitationById(id);
  if (!inv || (inv.owner_id !== user.id && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ checkins: listCheckins(id) });
}