import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { updateProfile } from "@/lib/db";

const bodySchema = z.object({
  first_name: z.string().min(1).max(40).optional(),
  last_name: z.string().min(1).max(40).optional(),
  phone: z.string().max(30).optional(),
  bio: z.string().max(160).optional(),
});

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let input;
  try {
    input = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const profile = updateProfile(user.id, input);
  return NextResponse.json({ ok: true, profile });
}