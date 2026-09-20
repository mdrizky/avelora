import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { listNotifications } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 20);
  const notifications = listNotifications(user.id).slice(0, limit);
  return NextResponse.json({ notifications });
}