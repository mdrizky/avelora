import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { registerSchema } from "@/lib/services/validators";
import { createUser, getUserByEmail } from "@/lib/db";
import { mutate } from "@/lib/db/store";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/services/rate-limit";

function ip(req: NextRequest): string {
  return (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(`register:${ip(req)}`, 10, 15 * 60000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }
  let input;
  try {
    input = registerSchema.parse(await req.json());
  } catch (e) {
    const msg = e instanceof z.ZodError ? e.issues[0]?.message : "Data tidak valid";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (getUserByEmail(input.email)) {
    return NextResponse.json({ error: "Email sudah terdaftar. Silakan masuk." }, { status: 409 });
  }
  const profile = createUser({
    email: input.email,
    first_name: input.first_name,
    last_name: input.last_name,
    password_hash: hashPassword(input.password),
  });
  // Dev: verifikasi otomatis (belum ada infrastruktur email di MVP).
  mutate((d) => {
    const u = d.profiles.find((p) => p.id === profile.id);
    if (u) u.is_verified = true;
  });
  await createSession(profile.id);
  return NextResponse.json({ ok: true, user: { id: profile.id, email: profile.email } });
}