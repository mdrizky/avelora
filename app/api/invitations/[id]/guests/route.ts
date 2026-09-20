import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { bulkAddGuests, getInvitationById } from "@/lib/db";

const bodySchema = z.object({
  names: z
    .array(z.object({ name: z.string().min(1).max(80), phone: z.string().optional() }))
    .min(1)
    .max(500),
  category: z.string().max(40).optional(),
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
  const count = bulkAddGuests(id, input.names);
  return NextResponse.json({ ok: true, created: count });
}