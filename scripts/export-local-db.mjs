#!/usr/bin/env node
/**
 * AVELORA — Ekspor database lokal ke berkas seed untuk Supabase.
 *
 *   node scripts/export-local-db.mjs [sumber]   ->  supabase/seed-data.json
 *
 * Sumber default: .data/db.json
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = process.argv[2] ?? path.join(root, ".data", "db.json");
const target = path.join(root, "supabase", "seed-data.json");

if (!existsSync(source)) {
  console.error(`Tidak dapat menemukan DB lokal: ${source}`);
  console.error("Jalankan aplikasi sekali (npm run dev) agar seed terbentuk, lalu coba lagi.");
  process.exit(1);
}

const db = JSON.parse(readFileSync(source, "utf-8"));

const COLLECTION_KEYS = [
  "profiles",
  "event_categories",
  "templates",
  "invitations",
  "event_schedules",
  "gallery_images",
  "guests",
  "guest_rsvps",
  "guest_messages",
  "gift_accounts",
  "music_tracks",
  "analytics_events",
  "checkins",
  "seating_tables",
  "plans",
  "subscriptions",
  "orders",
  "coupons",
  "notifications",
  "audit_logs",
  "testimonials",
  "faqs",
  "password_resets",
  "verify_tokens",
  "user_activities",
  "broadcasts",
  "blog_posts",
  "content_reports",
  "system_settings",
  "payment_gateways",
];

const collections = {};
let total = 0;
for (const key of COLLECTION_KEYS) {
  const rows = Array.isArray(db[key]) ? db[key] : [];
  collections[key] = rows;
  total += rows.length;
}

const seed = {
  app: "avelora",
  version: db.version ?? 1,
  generated_at: new Date().toISOString(),
  total_rows: total,
  collections,
};

writeFileSync(target, JSON.stringify(seed, null, 2), "utf-8");
console.log(`Ekspor selesai: ${total} baris dari ${COLLECTION_KEYS.length} koleksi ->`);
console.log(`  ${target}`);
console.log("Langkah berikut: tempel supabase/schema.sql di SQL Editor, lalu `npm run db:import`.");