import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { getUserById, updatePasswordHash } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/auth/password";

const bodySchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8, "Kata sandi baru minimal 8 karakter"),
});

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = bodySchema.safeParse(await req.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });

  const profile = getUserById(user.id);
  if (!profile || !verifyPassword(input.data.current_password, profile.password_hash)) {
    return NextResponse.json({ error: "Kata sandi saat ini salah" }, { status: 400 });
  }
  updatePasswordHash(user.id, hashPassword(input.data.new_password));
  return NextResponse.json({ ok: true });
}