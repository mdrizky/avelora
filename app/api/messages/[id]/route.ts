import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { deleteMessage, getMessageById, getInvitationById, moderateMessage, toggleFeaturedMessage } from "@/lib/db";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const message = getMessageById(id);
  if (!message) return NextResponse.json({ error: "Pesan tidak ditemukan" }, { status: 404 });
  const inv = getInvitationById(message.invitation_id);
  if (!inv || (inv.owner_id !== user.id && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as { status?: string; featured?: boolean } | null;
  if (body?.featured !== undefined) {
    toggleFeaturedMessage(id);
    return NextResponse.json({ ok: true });
  }
  const status = body?.status;
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ error: "Status harus approved atau rejected" }, { status: 400 });
  }
  moderateMessage(id, status);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const message = getMessageById(id);
  if (!message) return NextResponse.json({ error: "Pesan tidak ditemukan" }, { status: 404 });
  const inv = getInvitationById(message.invitation_id);
  if (!inv || (inv.owner_id !== user.id && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  deleteMessage(id);
  return NextResponse.json({ ok: true });
}