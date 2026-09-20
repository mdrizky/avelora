import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { destroySession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  await destroySession();
  const next = req.nextUrl.clone();
  next.pathname = "/";
  next.searchParams.delete("next");
  return NextResponse.redirect(next);
}