import { NextResponse } from "next/server";
import { getImpersonator, createSession } from "@/lib/auth/session";

export async function GET(request: Request) {
  const admin = await getImpersonator();
  if (!admin) return NextResponse.redirect(new URL("/login", request.url));
  await createSession(admin.id, admin.session_version ?? 0);
  return NextResponse.redirect(new URL("/admin/users", request.url));
}