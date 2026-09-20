import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getInvitationById, recordAnalytics } from "@/lib/db";
import { rateLimit } from "@/lib/services/rate-limit";

function detectDevice(ua: string): { device: string; browser: string } {
  const u = ua.toLowerCase();
  let device = "desktop";
  if (u.includes("ipad")) device = "tablet";
  else if (/mobile|android|iphone/.test(u)) device = "mobile";
  let browser = "unknown";
  if (u.includes("edg/")) browser = "Edge";
  else if (u.includes("chrome")) browser = "Chrome";
  else if (u.includes("safari")) browser = "Safari";
  else if (u.includes("firefox")) browser = "Firefox";
  return { device, browser };
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { invitation_id?: string } | null;
  if (!body?.invitation_id) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  const inv = getInvitationById(body.invitation_id);
  if (!inv) return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 });

  const ip = (req.headers.get("x-forwarded-for") ?? "anon").split(",")[0].trim();
  const rl = rateLimit(`track:${inv.id}:${ip}`, 60, 60000);
  if (!rl.ok) return NextResponse.json({ ok: true }, { status: 200 });

  const { device, browser } = detectDevice(req.headers.get("user-agent") ?? "");
  const vh = req.headers.get("x-visitor-hash") ?? undefined;
  recordAnalytics({
    invitation_id: inv.id,
    event_type: "view",
    device,
    browser,
    referrer: req.headers.get("referer") ?? undefined,
    visitor_hash: vh,
  });
  return NextResponse.json({ ok: true });
}