import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { appendAuditLog, appendUserActivity, createBlogPost, createBroadcast, createCoupon, createFaq, createTemplate, createTestimonial, deleteInvitation, forceLogoutUser, getData, incrementUserWarning, setMusicAudio, setUserBanned, setUserSuspended, toggleEntity, updateOrderStatus, updatePasswordHash, upsertSystemSetting } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { createImpersonatedSession } from "@/lib/auth/session";

const bodySchema = z.object({
  type: z.enum(["toggle", "music", "create_template", "create_coupon", "create_broadcast", "create_blog", "create_faq", "create_testimonial", "update_setting", "update_order", "impersonate", "suspend_user", "ban_user", "warn_user", "force_logout", "reset_password", "delete_invitation"]),
  collection: z.string().default(""),
  id: z.string().default(""),
  is_active: z.boolean().optional(),
  audio_url: z.string().optional(),
  name: z.string().optional(),
  slug: z.string().optional(),
  category_id: z.string().optional(),
  thumbnail_url: z.string().optional(),
  is_premium: z.boolean().optional(),
  price: z.number().nonnegative().optional(),
  discount_type: z.enum(["percent", "amount"]).optional(),
  discount_value: z.number().nonnegative().optional(),
  quota: z.number().int().nonnegative().optional(),
  expires_at: z.string().optional(),
  reason: z.string().max(500).optional(),
  password: z.string().min(8).optional(),
  body: z.string().optional(),
  excerpt: z.string().optional(),
  target: z.string().optional(),
  setting_key: z.string().optional(),
  setting_value: z.string().optional(),
  role: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  status: z.enum(["draft", "published"]).optional(),
  order_status: z.enum(["paid", "refunded"]).optional(),
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
  } else if (b.type === "create_coupon" && b.name && b.discount_type && b.discount_value !== undefined && b.quota !== undefined) {
    const coupon = createCoupon({ code: b.name, discount_type: b.discount_type, discount_value: b.discount_value, quota: b.quota, expires_at: b.expires_at });
    appendAuditLog("create-coupon", "coupons", coupon.id, { code: coupon.code });
    return NextResponse.json({ ok: true, coupon });
  } else if (b.type === "create_broadcast" && b.name && b.body && b.target) {
    const broadcast = createBroadcast(user.id, b.name, b.body, b.target);
    appendAuditLog("create-broadcast", "broadcasts", broadcast.id, { target: b.target, recipients: broadcast.recipient_count, admin_id: user.id });
    return NextResponse.json({ ok: true, broadcast });
  } else if (b.type === "create_blog" && b.name && b.slug && b.body) {
    const post = createBlogPost(user.id, { title: b.name, slug: b.slug, excerpt: b.excerpt ?? "", body: b.body, status: b.status ?? "draft" });
    appendAuditLog("create-blog", "blog_posts", post.id, { admin_id: user.id });
    return NextResponse.json({ ok: true, post });
  } else if (b.type === "create_faq" && b.name && b.body) {
    const faq = createFaq(b.name, b.body);
    appendAuditLog("create-faq", "faqs", faq.id, { admin_id: user.id });
    return NextResponse.json({ ok: true, faq });
  } else if (b.type === "create_testimonial" && b.name && b.body) {
    const testimonial = createTestimonial(b.name, b.role ?? "", b.body, b.rating ?? 5);
    appendAuditLog("create-testimonial", "testimonials", testimonial.id, { admin_id: user.id });
    return NextResponse.json({ ok: true, testimonial });
  } else if (b.type === "update_setting" && b.setting_key && b.setting_value !== undefined) {
    upsertSystemSetting(b.setting_key, b.setting_value, user.id);
    appendAuditLog("update-setting", "system_settings", b.setting_key, { admin_id: user.id });
  } else if (b.type === "update_order" && b.id && b.order_status) {
    const order = updateOrderStatus(b.id, b.order_status);
    if (!order) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    appendAuditLog(b.order_status === "paid" ? "verify-payment" : "refund-order", "orders", b.id, { reason: b.reason, admin_id: user.id });
  } else if (b.type === "impersonate" && b.id) {
    const target = getData().profiles.find((profile) => profile.id === b.id);
    if (!target || target.role === "admin" || target.is_suspended || target.is_banned) return NextResponse.json({ error: "User tidak dapat di-impersonate" }, { status: 400 });
    await createImpersonatedSession(user.id, target.id, target.session_version ?? 0);
    appendAuditLog("impersonate-user", "profiles", target.id, { admin_id: user.id });
    return NextResponse.json({ ok: true, redirect: "/dashboard" });
  } else if (b.type === "suspend_user" && b.id) {
    const target = getData().profiles.find((profile) => profile.id === b.id);
    if (!target || target.role === "admin") return NextResponse.json({ error: "Akun admin tidak dapat dinonaktifkan" }, { status: 400 });
    setUserSuspended(b.id, b.is_active !== true);
    appendAuditLog("suspend-user", "profiles", b.id, { is_suspended: b.is_active !== true });
  } else if ((b.type === "ban_user" || b.type === "warn_user" || b.type === "force_logout" || b.type === "reset_password") && b.id) {
    const target = getData().profiles.find((profile) => profile.id === b.id);
    if (!target || target.role === "admin") return NextResponse.json({ error: "Akun admin tidak dapat diubah melalui aksi ini" }, { status: 400 });
    if (b.type === "ban_user") setUserBanned(b.id, b.is_active !== true);
    if (b.type === "warn_user") incrementUserWarning(b.id, b.reason);
    if (b.type === "force_logout") forceLogoutUser(b.id);
    if (b.type === "reset_password") {
      if (!b.password) return NextResponse.json({ error: "Password baru wajib diisi" }, { status: 400 });
      updatePasswordHash(b.id, hashPassword(b.password));
      forceLogoutUser(b.id);
    }
    appendUserActivity(b.id, b.type, "profile", b.id, undefined, undefined, b.reason ? { reason: b.reason, admin_id: user.id } : { admin_id: user.id });
    appendAuditLog(b.type, "profiles", b.id, { reason: b.reason, admin_id: user.id });
  } else if (b.type === "delete_invitation" && b.id) {
    deleteInvitation(b.id);
    appendAuditLog("delete-invitation", "invitations", b.id);
  } else {
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}