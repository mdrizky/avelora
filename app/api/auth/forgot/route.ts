import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { forgotSchema } from "@/lib/services/validators";
import { getUserByEmail } from "@/lib/db";
import { mutate } from "@/lib/db/store";
import { generateToken } from "@/lib/auth/session";
import { rateLimit } from "@/lib/services/rate-limit";

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  const rl = rateLimit(`forgot:${ip}`, 5, 15 * 60000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Terlalu banyak permintaan. Coba lagi nanti." }, { status: 429 });
  }
  let input;
  try {
    input = forgotSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Alamat email tidak valid" }, { status: 400 });
  }
  const user = getUserByEmail(input.email);
  if (user) {
    const token = generateToken(24);
    mutate((d) => {
      d.password_resets = d.password_resets.filter((t) => t.email !== input.email);
      d.password_resets.push({
        token,
        email: input.email,
        expires_at: new Date(Date.now() + 60 * 60000).toISOString(),
      });
    });
  }
  // Selalu balas ok agar tidak membocorkan eksistensi email.
  return NextResponse.json({ ok: true }, { status: 200 });
}