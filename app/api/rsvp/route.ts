import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { rsvpSchema } from "@/lib/services/validators";
import {
  addGuest,
  getGuestBySlug,
  getInvitationById,
  listGuests,
  pushNotification,
  recordAnalytics,
  setRsvp,
} from "@/lib/db";
import { rateLimit } from "@/lib/services/rate-limit";

const bodySchema = rsvpSchema.extend({
  invitation_id: z.string(),
  guest_slug: z.string().optional(),
  name: z.string().min(1).max(80),
});

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  const rl = rateLimit(`rsvp:${ip}`, 20, 60000);
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
  if (inv.status !== "published" && inv.status !== "memory") {
    return NextResponse.json({ error: "Konfirmasi masih ditutup" }, { status: 403 });
  }

  let guest = input.guest_slug ? getGuestBySlug(inv.id, input.guest_slug) : undefined;
  if (!guest) {
    guest = listGuests(inv.id).find(
      (g) => g.name.toLowerCase() === input.name.toLowerCase(),
    );
  }
  if (!guest) {
    guest = addGuest({ invitation_id: inv.id, name: input.name });
  }

  setRsvp(guest.id, {
    status: input.status,
    attending_count: input.attending_count ?? (input.status === "attending" ? 1 : 0),
    meal_preference: input.meal_preference,
    answers: input.answers,
    special_request: input.special_request,
  });
  recordAnalytics({
    invitation_id: inv.id,
    event_type: "rsvp",
    device: "unknown",
    browser: "unknown",
  });
  pushNotification({
    user_id: inv.owner_id,
    type: "rsvp",
    title: "RSVP Baru",
    body: `${guest.name} mengonfirmasi "${input.status}" untuk ${inv.title}.`,
    link: `/dashboard/invitations/${inv.id}/guests`,
  });

  return NextResponse.json({ ok: true, guest: { name: guest.name, code: guest.code } });
}