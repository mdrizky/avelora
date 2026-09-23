import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { appendAuditLog, createTemplate, deleteInvitation, getData, setMusicAudio, setUserSuspended, toggleEntity } from "@/lib/db";

const bodySchema = z.object({
  type: z.enum(["toggle", "music", "create_template", "suspend_user", "delete_invitation"]),
  collection: z.string().default(""),
  id: z.string(),
  is_active: z.boolean().optional(),
  audio_url: z.string().optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
  category_id: z.string().optional(),
  thumbnail_url: z.string().optional(),
  is_premium: z.boolean().optional(),
  price: z.number().nonnegative().optional(),
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
  if ((b.type === "toggle" || b.type === "music") && !ALLOWED_COLLECTIONS.includes(b.collection as (typeof ALLOWED_COLLECTIONS)[number])) {
    return NextResponse.json({ error: "Koleksi tidak dikenal" }, { status: 400 });
  }
  if (b.type === "toggle" && typeof b.is_active === "boolean") {
    toggleEntity(b.collection as (typeof ALLOWED_COLLECTIONS)[number], b.id, b.is_active);
    appendAuditLog("toggle", b.collection, b.id, { is_active: b.is_active });
  } else if (b.type === "music" && b.audio_url !== undefined) {
    setMusicAudio(b.id, b.audio_url);
    appendAuditLog("set-music-audio", "music_tracks", b.id, { audio_url: b.audio_url });
  } else if (b.type === "create_template" && b.name && b.slug && b.category_id) {
    const template = createTemplate({
      name: b.name,
      slug: b.slug,
      category_id: b.category_id,
      thumbnail_url: b.thumbnail_url,
      is_premium: b.is_premium,
      price: b.price,
    });
    appendAuditLog("create-template", "templates", template.id, { name: template.name });
    return NextResponse.json({ ok: true, template });
  } else if (b.type === "suspend_user" && b.id) {
    const target = getData().profiles.find((profile) => profile.id === b.id);
    if (!target || target.role === "admin") return NextResponse.json({ error: "Akun admin tidak dapat dinonaktifkan" }, { status: 400 });
    setUserSuspended(b.id, b.is_active !== true);
    appendAuditLog("suspend-user", "profiles", b.id, { is_suspended: b.is_active !== true });
  } else if (b.type === "delete_invitation" && b.id) {
    deleteInvitation(b.id);
    appendAuditLog("delete-invitation", "invitations", b.id);
  } else {
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}