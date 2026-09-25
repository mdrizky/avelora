import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSessionUser } from "@/lib/auth/session";
import { appendAuditLog } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "Supabase Storage belum dikonfigurasi" }, { status: 503 });
  const form = await request.formData();
  const file = form.get("file");
  const bucket = form.get("bucket") === "audio" ? "avelora-audio" : "avelora-assets";
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: "Ukuran file maksimal 15MB" }, { status: 400 });
  const allowed = bucket === "avelora-audio" ? ["audio/mpeg", "audio/wav", "audio/ogg"] : ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "Tipe file tidak didukung" }, { status: 400 });
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `admin/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const result = await supabase.storage.from(bucket).upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type, upsert: false });
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
  const publicUrl = supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  appendAuditLog("upload-asset", "storage", path, { bucket, filename: file.name, admin_id: user.id });
  return NextResponse.json({ ok: true, url: publicUrl, bucket, path });
}