import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resetSchema } from "@/lib/services/validators";
import { getData, mutate } from "@/lib/db/store";
import { hashPassword } from "@/lib/auth/password";
import { rateLimit } from "@/lib/services/rate-limit";

export async function POST(req: NextRequest) {
  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  const rl = rateLimit(`reset:${ip}`, 5, 15 * 60000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
  }
  let input;
  try {
    input = resetSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const tokenRow = getData().password_resets.find(
    (t) => t.token === input.token && t.email.toLowerCase() === input.email.toLowerCase(),
  );
  if (!tokenRow || new Date(tokenRow.expires_at).getTime() < Date.now()) {
    return NextResponse.json(
      { error: "Tautan reset tidak valid atau sudah kedaluwarsa." },
      { status: 400 },
    );
  }
  mutate((d) => {
    d.password_resets = d.password_resets.filter((t) => t.token !== input.token);
    const user = d.profiles.find((p) => p.email.toLowerCase() === input.email.toLowerCase());
    if (user) user.password_hash = hashPassword(input.password);
  });
  return NextResponse.json({ ok: true });
}