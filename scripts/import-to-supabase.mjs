#!/usr/bin/env node
/**
 * AVELORA — Import seed ke Supabase.
 *
 *   node scripts/import-to-supabase.mjs [--dry-run] [--keep] [--seed <file>] [--env <file>]
 *
 * Persyaratan:
 *   - supabase/schema.sql sudah dijalankan di SQL Editor project Anda.
 *   - Kredensial: SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY
 *     (dari file .env / .env.local, atau env variabel shell).
 *
 * Default seed: supabase/seed-data.json (hasil `npm run db:export`).
 * Tanpa --keep: baris yang tidak ada di seed ikut dihapus (mirror).
 * Dengan --dry-run: hanya mencetak rencana (tidak memanggil Supabase).
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// --- argumen sederhana -----------------------------------------------------
const argv = process.argv.slice(2);
const flag = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? (i + 1 < argv.length ? argv[i + 1] : def) : def;
};
const has = (name) => argv.includes(`--${name}`);
const DRY_RUN = has("dry-run");
const KEEP = has("keep");
const seedFile = path.resolve(root, flag("seed", "supabase/seed-data.json"));
const envFile = flag("env");
if (has("env")) {
  const p = path.resolve(root, envFile);
  if (existsSync(p)) {
    process.loadEnvFile(p);
  } else {
    console.error(`File env tidak ditemukan: ${p}`);
    process.exit(1);
  }
} else {
  for (const p of [path.join(root, ".env.local"), path.join(root, ".env")]) {
    if (existsSync(p)) {
      try {
        process.loadEnvFile(p);
      } catch {
        /* lewati */
      }
      break;
    }
  }
}

// --- seed ------------------------------------------------------------------
if (!existsSync(seedFile)) {
  console.error(`Seed tidak ditemukan: ${seedFile}`);
  console.error("Jalankan `npm run db:export` lebih dulu.");
  process.exit(1);
}
const seed = JSON.parse(readFileSync(seedFile, "utf-8"));

// Koleksi -> (tabel, kolom primary key). Nama tabel = nama koleksi.
const TABLES = [
  { col: "profiles", pk: "id" },
  { col: "event_categories", pk: "id" },
  { col: "templates", pk: "id" },
  { col: "invitations", pk: "id" },
  { col: "event_schedules", pk: "id" },
  { col: "gallery_images", pk: "id" },
  { col: "guests", pk: "id" },
  { col: "guest_rsvps", pk: "id" },
  { col: "guest_messages", pk: "id" },
  { col: "gift_accounts", pk: "id" },
  { col: "music_tracks", pk: "id" },
  { col: "analytics_events", pk: "id" },
  { col: "checkins", pk: "id" },
  { col: "seating_tables", pk: "id" },
  { col: "plans", pk: "id" },
  { col: "subscriptions", pk: "id" },
  { col: "orders", pk: "id" },
  { col: "coupons", pk: "id" },
  { col: "notifications", pk: "id" },
  { col: "audit_logs", pk: "id" },
  { col: "testimonials", pk: "id" },
  { col: "faqs", pk: "id" },
  { col: "password_resets", pk: "token" },
  { col: "verify_tokens", pk: "token" },
];

if (DRY_RUN) {
  console.log("== DRY-RUN: rencana import (tanpa memanggil Supabase) ==");
  for (const t of TABLES) {
    const rows = seed.collections?.[t.col] ?? [];
    console.log(`  ${t.col.padEnd(20)} upsert=${rows.length} baris${KEEP ? " (keep)" : " + hapus yg tak ada"}`);
  }
  console.log("Gunakan tanpa --dry-run untuk mengeksekusi.");
  process.exit(0);
}

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY belum diset.");
  console.error("Isi .env.local (lihat .env.local.example) atau export di shell sebelum menjalankan.");
  process.exit(1);
}

const sb = createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } });
console.log(`Import ke Supabase dimulai (${seed.generated_at ?? "-"}).\n`);

let failed = 0;
for (const t of TABLES) {
  const rows = seed.collections?.[t.col] ?? [];
  const pretty = rows.length.toString().padStart(4);
  try {
    if (!KEEP) {
      if (rows.length === 0) {
        const { error } = await sb.from(t.col).delete().neq(t.pk, "-");
        if (error) throw error;
      } else {
        const ids = rows.map((r) => String(r[t.pk]));
        const { error: delErr } = await sb.from(t.col).delete().not(t.pk, "in", `(${ids.join(",")})`);
        if (delErr) throw delErr;
      }
    }
    if (rows.length > 0) {
      const { error } = await sb.from(t.col).upsert(rows, { onConflict: t.pk });
      if (error) throw error;
    }
    console.log(`  OK  ${t.col.padEnd(20)} ${pretty} baris`);
  } catch (err) {
    failed++;
    console.error(`  XX  ${t.col.padEnd(20)} GAGAL: ${err instanceof Error ? err.message : err}`);
  }
}

console.log(`\nSelesai. Gagal: ${failed}`);
if (failed > 0) process.exitCode = 1;
else console.log("Sekarang set DATABASE_STORE=supabase di .env.local dan jalankan `npm run dev`.");