import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { markNotificationsRead } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { ids?: string[] } | null;
  markNotificationsRead(user.id, body?.ids);
  return NextResponse.json({ ok: true });
}