import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { messageSchema } from "@/lib/services/validators";
import {
  addMessage,
  getGuestBySlug,
  getInvitationById,
  listGuests,
  listMessages,
  pushNotification,
} from "@/lib/db";
import { rateLimit } from "@/lib/services/rate-limit";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const invitationId = req.nextUrl.searchParams.get("invitation_id") ?? "";
  if (!invitationId) return NextResponse.json({ error: "invitation_id wajib" }, { status: 400 });
  const inv = getInvitationById(invitationId);
  if (!inv || (inv.owner_id !== user.id && user.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const statusParam = req.nextUrl.searchParams.get("status") ?? "all";
  const status = statusParam === "pending" || statusParam === "approved" || statusParam === "all" ? statusParam : "all";
  const messages = listMessages(invitationId, status);
  return NextResponse.json({ messages });
}

const bodySchema = messageSchema.extend({
  invitation_id: z.string(),
  guest_slug: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  const rl = rateLimit(`msg:${ip}`, 20, 60000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Terlalu banyak permintaan" }, { status: 429 });
  }

  let input;
  try {
    input = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const inv = getInvitationById(input.invitation_id);
  if (!inv) return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 });

  let guest = input.guest_slug ? getGuestBySlug(inv.id, input.guest_slug) : undefined;
  if (!guest) {
    guest = listGuests(inv.id).find(
      (g) => g.name.toLowerCase() === input.guest_name.toLowerCase(),
    );
  }
  const autoApprove = inv.content_data.guestbook?.auto_approve ?? false;

  addMessage({
    invitation_id: inv.id,
    guest_id: guest?.id,
    guest_name: input.guest_name,
    message: input.message,
    auto_approve: autoApprove,
  });

  pushNotification({
    user_id: inv.owner_id,
    type: "guestbook",
    title: "Ucapan Baru",
    body: `${input.guest_name} menulis pesan di buku tamu ${inv.title}.`,
    link: `/dashboard/invitations/${inv.id}/guestbook`,
  });

  return NextResponse.json({
    ok: true,
    auto: autoApprove,
    message: autoApprove ? "Ucapan terkirim" : "Ucapan terkirim dan menunggu moderasi",
  });
}