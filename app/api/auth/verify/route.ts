import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getData, mutate } from "@/lib/db/store";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    token?: string;
  } | null;
  if (!body?.email || !body?.token) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const email = body.email.toLowerCase();
  const row = getData().verify_tokens.find(
    (t) => t.token === body.token && t.email.toLowerCase() === email,
  );
  if (!row || new Date(row.expires_at).getTime() < Date.now()) {
    return NextResponse.json(
      { error: "Tautan verifikasi tidak valid atau kedaluwarsa." },
      { status: 400 },
    );
  }
  mutate((d) => {
    d.verify_tokens = d.verify_tokens.filter((t) => t.token !== body.token);
    const user = d.profiles.find((p) => p.email.toLowerCase() === email);
    if (user) user.is_verified = true;
  });
  return NextResponse.json({ ok: true });
}