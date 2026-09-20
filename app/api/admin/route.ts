import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { appendAuditLog, setMusicAudio, toggleEntity } from "@/lib/db";

const bodySchema = z.object({
  type: z.enum(["toggle", "music"]),
  collection: z.string(),
  id: z.string(),
  is_active: z.boolean().optional(),
  audio_url: z.string().optional(),
});

const ALLOWED_COLLECTIONS = ["templates", "plans", "music_tracks", "event_categories", "testimonials"] as const;

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const input = bodySchema.safeParse(await req.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  const b = input.data;
  if (!ALLOWED_COLLECTIONS.includes(b.collection as (typeof ALLOWED_COLLECTIONS)[number])) {
    return NextResponse.json({ error: "Koleksi tidak dikenal" }, { status: 400 });
  }
  if (b.type === "toggle" && typeof b.is_active === "boolean") {
    toggleEntity(b.collection as (typeof ALLOWED_COLLECTIONS)[number], b.id, b.is_active);
    appendAuditLog("toggle", b.collection, b.id, { is_active: b.is_active });
  } else if (b.type === "music" && b.audio_url !== undefined) {
    setMusicAudio(b.id, b.audio_url);
    appendAuditLog("set-music-audio", "music_tracks", b.id, { audio_url: b.audio_url });
  } else {
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}