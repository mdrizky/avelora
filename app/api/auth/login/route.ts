import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { loginSchema } from "@/lib/services/validators";
import { getUserByEmail } from "@/lib/db";
import { mutate } from "@/lib/db/store";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/services/rate-limit";

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  let input;
  try {
    input = loginSchema.parse(await req.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0]?.message : "Data tidak valid";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const key = `${input.email.toLowerCase()}:${ip}`;
  const rl = rateLimit(`login:${key}`, 10, 15 * 60000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Coba lagi 15 menit lagi." },
      { status: 429 },
    );
  }
  const user = getUserByEmail(input.email);
  if (!user || !verifyPassword(input.password, user.password_hash)) {
    return NextResponse.json(
      { error: "Email atau kata sandi salah." },
      { status: 401 },
    );
  }
  if (user.is_suspended) {
    return NextResponse.json({ error: "Akun Anda dinonaktifkan." }, { status: 403 });
  }
  mutate((d) => {
    const u = d.profiles.find((p) => p.id === user.id);
    if (u) u.last_login_at = new Date().toISOString();
  });
  await createSession(user.id);
  return NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, role: user.role },
  });
}