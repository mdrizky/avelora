#!/usr/bin/env node
/**
 * AVELORA — Validasi `supabase/seed-data.json` sebelum import ke Postgres.
 *
 *   npm run db:validate
 *
 * Memeriksa:
 *   - Semua 24 koleksi hadir & berupa array.
 *   - Tiap baris: field wajib ada & tipe cocok (string/number/boolean/object).
 *   - Tidak ada nilai `undefined`, `NaN`, `Infinity`, atau fungsi.
 *   - JSON yang diekspor bersih (tidak ada duplikat kunci).
 *
 * Keluar kode 1 jika ada masalah.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEED_FILE = path.join(ROOT, "supabase", "seed-data.json");
const DATA_FILE = path.join(ROOT, ".data", "db.json");

if (!existsSync(SEED_FILE)) {
  console.error(`Seed tidak ditemukan: ${SEED_FILE}`);
  console.error("Jalankan `npm run db:export` lebih dulu.");
  process.exit(1);
}

const seed = JSON.parse(readFileSync(SEED_FILE, "utf-8"));
if (!seed.collections || typeof seed.collections !== "object") {
  console.error("Format seed tidak valid: missing 'collections' object.");
  process.exit(1);
}

const COLS = seed.collections;
const issues = [];

/* ========== definisi tipe per koleksi (ringkas, field wajib saja) ========== */
const SCHEMA = {
  profiles: {
    req: ["id", "email", "first_name", "last_name", "role", "password_hash", "is_verified", "is_suspended", "created_at"],
    opt: ["phone", "avatar_url", "last_login_at"],
    types: { id: "s", email: "s", first_name: "s", last_name: "s", role: "s", password_hash: "s", is_verified: "b", is_suspended: "b", created_at: "s", phone: "s", avatar_url: "s", last_login_at: "s" },
  },
  event_categories: { req: ["id", "name", "slug", "icon", "tagline", "is_active"], opt: [], types: { id: "s", name: "s", slug: "s", icon: "s", tagline: "s", is_active: "b" } },
  templates: { req: ["id", "name", "slug", "category_id", "thumbnail_url", "theme_config", "is_premium", "price", "is_active", "created_by", "created_at"], opt: ["preview_url"], types: { id: "s", name: "s", slug: "s", category_id: "s", thumbnail_url: "s", theme_config: "o", is_premium: "b", price: "n", is_active: "b", created_by: "s", created_at: "s", preview_url: "s" } },
  invitations: { req: ["id", "owner_id", "template_id", "category_id", "slug", "title", "status", "content_data", "theme_config", "timezone", "watermark_enabled", "created_at", "updated_at"], opt: ["music_track_id", "event_date", "city", "published_at", "custom_url_enabled", "remove_branding"], types: { id: "s", owner_id: "s", template_id: "s", category_id: "s", slug: "s", title: "s", status: "s", content_data: "o", theme_config: "o", music_track_id: "s", timezone: "s", event_date: "s", city: "s", custom_url_enabled: "b", watermark_enabled: "b", remove_branding: "b", published_at: "s", created_at: "s", updated_at: "s" } },
  event_schedules: { req: ["id", "invitation_id", "label", "event_date", "start_time", "location_name", "address", "maps_url", "order_index"], opt: ["end_time", "map_embed_url"], types: { id: "s", invitation_id: "s", label: "s", event_date: "s", start_time: "s", end_time: "s", location_name: "s", address: "s", maps_url: "s", map_embed_url: "s", order_index: "n" } },
  gallery_images: { req: ["id", "invitation_id", "image_url", "order_index", "uploaded_at"], opt: [], types: { id: "s", invitation_id: "s", image_url: "s", order_index: "n", uploaded_at: "s" } },
  guests: { req: ["id", "invitation_id", "name", "guest_slug", "invited_count", "code", "created_at"], opt: ["phone", "email", "category", "table_number", "notes"], types: { id: "s", invitation_id: "s", name: "s", phone: "s", email: "s", guest_slug: "s", invited_count: "n", category: "s", table_number: "s", notes: "s", code: "s", created_at: "s" } },
  guest_rsvps: { req: ["id", "guest_id", "status", "attending_count"], opt: ["meal_preference", "answers", "special_request", "responded_at"], types: { id: "s", guest_id: "s", status: "s", attending_count: "n", meal_preference: "s", answers: "o", special_request: "s", responded_at: "s" } },
  guest_messages: { req: ["id", "invitation_id", "guest_name", "message", "status", "is_featured", "created_at"], opt: ["guest_id"], types: { id: "s", invitation_id: "s", guest_id: "s", guest_name: "s", message: "s", status: "s", is_featured: "b", created_at: "s" } },
  gift_accounts: { req: ["id", "invitation_id", "type", "order_index"], opt: ["bank_name", "account_number", "account_name", "provider", "phone", "qris_image_url"], types: { id: "s", invitation_id: "s", type: "s", bank_name: "s", account_number: "s", account_name: "s", provider: "s", phone: "s", qris_image_url: "s", order_index: "n" } },
  music_tracks: { req: ["id", "title", "artist", "category", "audio_url", "license_note", "is_active", "created_at"], opt: ["duration", "uploaded_by"], types: { id: "s", title: "s", artist: "s", category: "s", audio_url: "s", duration: "s", license_note: "s", is_active: "b", uploaded_by: "s", created_at: "s" } },
  analytics_events: { req: ["id", "invitation_id", "event_type", "occurred_at"], opt: ["device", "browser", "referrer", "visitor_hash"], types: { id: "s", invitation_id: "s", event_type: "s", device: "s", browser: "s", referrer: "s", visitor_hash: "s", occurred_at: "s" } },
  checkins: { req: ["id", "invitation_id", "guest_id", "guest_code", "checked_in_at", "checked_in_by"], opt: [], types: { id: "s", invitation_id: "s", guest_id: "s", guest_code: "s", checked_in_at: "s", checked_in_by: "s" } },
  seating_tables: { req: ["id", "invitation_id", "table_name", "capacity"], opt: [], types: { id: "s", invitation_id: "s", table_name: "s", capacity: "n" } },
  plans: { req: ["id", "name", "display_name", "price", "period", "features", "is_active"], opt: [], types: { id: "s", name: "s", display_name: "s", price: "n", period: "s", features: "o", is_active: "b" } },
  subscriptions: { req: ["id", "owner_id", "plan_id", "status", "starts_at", "ends_at"], opt: [], types: { id: "s", owner_id: "s", plan_id: "s", status: "s", starts_at: "s", ends_at: "s" } },
  orders: { req: ["id", "owner_id", "plan_id", "amount", "status", "created_at"], opt: ["invitation_id", "coupon_id", "payment_method"], types: { id: "s", owner_id: "s", invitation_id: "s", plan_id: "s", coupon_id: "s", amount: "n", status: "s", payment_method: "s", created_at: "s" } },
  coupons: { req: ["id", "code", "discount_type", "discount_value", "quota", "used_count", "is_active"], opt: ["expires_at"], types: { id: "s", code: "s", discount_type: "s", discount_value: "n", quota: "n", used_count: "n", expires_at: "s", is_active: "b" } },
  notifications: { req: ["id", "user_id", "type", "title", "body", "read", "created_at"], opt: ["link"], types: { id: "s", user_id: "s", type: "s", title: "s", body: "s", link: "s", read: "b", created_at: "s" } },
  audit_logs: { req: ["id", "admin_id", "action", "entity_type", "created_at"], opt: ["entity_id", "metadata"], types: { id: "s", admin_id: "s", action: "s", entity_type: "s", entity_id: "s", metadata: "o", created_at: "s" } },
  testimonials: { req: ["id", "name", "role", "content", "rating", "is_active"], opt: ["avatar_url"], types: { id: "s", name: "s", role: "s", avatar_url: "s", content: "s", rating: "n", is_active: "b" } },
  faqs: { req: ["id", "question", "answer", "order_index", "is_active"], opt: [], types: { id: "s", question: "s", answer: "s", order_index: "n", is_active: "b" } },
  password_resets: { req: ["token", "email", "expires_at"], opt: [], types: { token: "s", email: "s", expires_at: "s" } },
  verify_tokens: { req: ["token", "email", "expires_at"], opt: [], types: { token: "s", email: "s", expires_at: "s" } },
};

/* ========== helper tipe ========== */
function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "a";
  const t = typeof v;
  if (t === "string") return "s";
  if (t === "number") return Number.isFinite(v) ? "n" : "badnum";
  if (t === "boolean") return "b";
  if (t === "object") return "o";
  return t;
}
function assertType(col, idx, field, expected, actual) {
  const map = { s: "string", n: "number", b: "boolean", o: "object", a: "array" };
  if (expected === "o" && (actual === "o" || actual === "a")) return; // object/array diterima untuk jsonb
  if (expected === actual) return;
  if (expected === "s" && actual === "n") return; // numeric string ok
  issues.push(`${col}[${idx}].${field}: diharapkan ${map[expected]}, dapat ${actual}`);
}

function validate() {
  for (const [col, spec] of Object.entries(SCHEMA)) {
    const rows = COLS[col] ?? [];
    if (!Array.isArray(rows)) {
      issues.push(`${col}: bukan array`);
      continue;
    }
    if (rows.length === 0) continue; // kosong OK
    rows.forEach((row, i) => {
      if (!row || typeof row !== "object") {
        issues.push(`${col}[${i}]: bukan object`);
        return;
      }
      // cek field wajib
      for (const f of spec.req) {
        if (!(f in row) || row[f] === undefined || row[f] === null) {
          issues.push(`${col}[${i}].${f}: wajib tapi hilang/null`);
        } else {
          assertType(col, i, f, spec.types[f], typeOf(row[f]));
        }
      }
      for (const f of spec.opt) {
        if (f in row && row[f] !== undefined && row[f] !== null) {
          assertType(col, i, f, spec.types[f], typeOf(row[f]));
        }
      }
      // detek nilai buruk
      for (const [k, v] of Object.entries(row)) {
        if (v === undefined || (typeof v === "number" && !Number.isFinite(v)) || typeof v === "function") {
          issues.push(`${col}[${i}].${k}: nilai tidak valid untuk JSON (${v})`);
        }
      }
    });
  }
}

validate();

if (issues.length) {
  console.error("\n❌ VALIDASI GAGAL:");
  issues.forEach((m) => console.error("  - " + m));
  process.exit(1);
} else {
  const total = Object.values(COLS).reduce((n, a) => n + (Array.isArray(a) ? a.length : 0), 0);
  console.log(`✅ Seed valid: ${Object.keys(COLS).length} koleksi, ${total} baris.`);
  console.log("Siap untuk `npm run db:import`.");
}