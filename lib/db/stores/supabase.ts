/**
 * AVELORA — Backend penyimpanan SUPABASE (Postgres via @supabase/supabase-js).
 *
 * Aktif hanya bila:  DATABASE_STORE=supabase  DAN  SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY terisi. Mode default tetap LOKAL.
 *
 * Semantik sama persis dengan backend lokal: snapshot seluruh DB dimuat
 * ke memori pada boot, getData() sinkron, mutate() mengubah snapshot dan
 * menjadwalkan sinkronisasi (upsert + hapus baris yang tidak ada) secara
 * debounced ke tabel Postgres. Cocok untuk model satu-instans demo.
 *
 * Jalankan `supabase/schema.sql` lebih dulu di SQL Editor project Anda.
 */
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DBData } from "../types";
import { seedDatabase } from "../seed";

const DB_VERSION = 1;
const GLOBAL_KEY = "__AVELORA_DB_SUPABASE__" as const;

interface CollectionMeta {
  col: keyof DBData;
  table: string;
  pk: string;
}

const COLLECTIONS: CollectionMeta[] = [
  { col: "profiles", table: "profiles", pk: "id" },
  { col: "event_categories", table: "event_categories", pk: "id" },
  { col: "templates", table: "templates", pk: "id" },
  { col: "invitations", table: "invitations", pk: "id" },
  { col: "event_schedules", table: "event_schedules", pk: "id" },
  { col: "gallery_images", table: "gallery_images", pk: "id" },
  { col: "guests", table: "guests", pk: "id" },
  { col: "guest_rsvps", table: "guest_rsvps", pk: "id" },
  { col: "guest_messages", table: "guest_messages", pk: "id" },
  { col: "gift_accounts", table: "gift_accounts", pk: "id" },
  { col: "music_tracks", table: "music_tracks", pk: "id" },
  { col: "analytics_events", table: "analytics_events", pk: "id" },
  { col: "checkins", table: "checkins", pk: "id" },
  { col: "seating_tables", table: "seating_tables", pk: "id" },
  { col: "plans", table: "plans", pk: "id" },
  { col: "subscriptions", table: "subscriptions", pk: "id" },
  { col: "orders", table: "orders", pk: "id" },
  { col: "coupons", table: "coupons", pk: "id" },
  { col: "notifications", table: "notifications", pk: "id" },
  { col: "audit_logs", table: "audit_logs", pk: "id" },
  { col: "testimonials", table: "testimonials", pk: "id" },
  { col: "faqs", table: "faqs", pk: "id" },
  { col: "password_resets", table: "password_resets", pk: "token" },
  { col: "verify_tokens", table: "verify_tokens", pk: "token" },
];

const ACTIVE =
  process.env.DATABASE_STORE === "supabase" &&
  !!process.env.SUPABASE_URL &&
  !!process.env.SUPABASE_SERVICE_ROLE_KEY;

interface DbGlobal {
  data: DBData;
  loaded: boolean;
  degraded: boolean;
  dirty: Set<string>;
  timer: ReturnType<typeof setTimeout> | null;
}

function emptyData(): DBData {
  return {
    version: DB_VERSION,
    profiles: [],
    event_categories: [],
    templates: [],
    invitations: [],
    event_schedules: [],
    gallery_images: [],
    guests: [],
    guest_rsvps: [],
    guest_messages: [],
    gift_accounts: [],
    music_tracks: [],
    analytics_events: [],
    checkins: [],
    seating_tables: [],
    plans: [],
    subscriptions: [],
    orders: [],
    coupons: [],
    notifications: [],
    audit_logs: [],
    testimonials: [],
    faqs: [],
    password_resets: [],
    verify_tokens: [],
  };
}

function getGlob(): DbGlobal {
  const g = globalThis as unknown as Record<string, DbGlobal | undefined>;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      data: emptyData(),
      loaded: false,
      degraded: false,
      dirty: new Set<string>(),
      timer: null,
    };
  }
  return g[GLOBAL_KEY] as DbGlobal;
}

let client: SupabaseClient | null = null;

function makeClient(): SupabaseClient | null {
  if (!ACTIVE) return null;
  if (client) return client;
  client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Muat seluruh koleksi dari Postgres ke snapshot memori. */
async function fetchAllSnapshot(sb: SupabaseClient): Promise<DBData> {
  const data = emptyData();
  for (const c of COLLECTIONS) {
    const { data: rows, error } = await sb.from(c.table).select("*");
    if (error) throw error;
    data[c.col] = (rows ?? []) as never;
  }
  data.version = DB_VERSION;
  try {
    const { data: meta } = await sb.from("avelora_meta").select("key,value").eq("key", "version").single();
    if (meta && Number(meta.value)) data.version = Number(meta.value);
  } catch {
    /* meta opsional */
  }
  return data;
}

function escPg(v: string): string {
  return v.replace(/'/g, "''");
}

/** Sinkronkan koleksi yang berubah ke Postgres (upsert + hapus yg tak ada). */
async function flushCollections(sb: SupabaseClient, cols: string[]) {
  const glob = getGlob();
  for (const col of cols) {
    const meta = COLLECTIONS.find((c) => c.col === col);
    if (!meta) continue;
    const rows = (glob.data[col as keyof DBData] as unknown[]) ?? [];
    try {
      if (rows.length === 0) {
        const { error } = await sb.from(meta.table).delete().neq(meta.pk, "-"); // hapus semua
        if (error) throw error;
      } else {
        const ids = rows.map((r) => (r as Record<string, string>)[meta.pk]);
        // Hapus baris yang TIDAK ada di snapshot
        const { error: delErr } = await sb.from(meta.table).delete().not(meta.pk, "in", `(${ids.map(escPg).join(",")})`);
        if (delErr) throw delErr;
        const { error: upErr } = await sb.from(meta.table).upsert(rows as never[], { onConflict: meta.pk });
        if (upErr) throw upErr;
      }
    } catch (err) {
      console.error(`[avelora:db:supabase] Sinkronisasi ${meta.table} gagal:`, err);
    }
  }
}

async function bootstrap() {
  if (!ACTIVE) return;
  const glob = getGlob();
  if (glob.loaded) return;
  const sb = makeClient();
  if (!sb) return;
  try {
    const snapshot = await fetchAllSnapshot(sb);
    glob.data = snapshot;
    glob.loaded = true;
    const total = COLLECTIONS.reduce((n, c) => n + (snapshot[c.col] as unknown[]).length, 0);
    console.log(`[avelora:db] Supabase siap. Total ${total} baris di ${COLLECTIONS.length} tabel.`);
  } catch (err) {
    glob.data = seedDatabase();
    glob.loaded = true;
    glob.degraded = true;
    console.error(
      "[avelora:db] Gagal memuat dari Supabase. Jatuh ke seed lokal (MODE DEGRADED, tulis akan dilewati). " +
        "Periksa SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY dan pastikan supabase/schema.sql sudah dijalankan.",
      err,
    );
  }
}

/** Trap bootstrap saat module dievaluasi (server boot / hot reload). */
await bootstrap();

export function getData(): DBData {
  const glob = getGlob();
  if (!glob.loaded) {
    // Teoretis tidak terjadi karena bootstrap; jaga-jaga.
    glob.data = seedDatabase();
    glob.loaded = true;
  }
  return glob.data;
}

export function mutate(fn: (data: DBData) => void) {
  const glob = getGlob();
  const data = getData();
  fn(data);
  if (glob.degraded) return;
  const sb = makeClient();
  if (!sb) return;
  // tandai koleksi yang berubah dengan membandingkan? Simpel: semua berubah.
  for (const c of COLLECTIONS) glob.dirty.add(c.col as string);
  if (glob.timer) clearTimeout(glob.timer);
  glob.timer = setTimeout(() => {
    const cols = [...glob.dirty];
    glob.dirty.clear();
    flushCollections(sb, cols).catch((err) => console.error("[avelora:db:supabase] flush:", err));
  }, 500);
}

export function saveNow(): Promise<void> {
  const glob = getGlob();
  const sb = makeClient();
  if (!sb || glob.degraded) return Promise.resolve();
  if (glob.timer) {
    clearTimeout(glob.timer);
    glob.timer = null;
  }
  const cols = [...glob.dirty];
  glob.dirty.clear();
  return flushCollections(sb, cols).catch((err) => console.error("[avelora:db:supabase] saveNow:", err));
}

export function resetToSeed() {
  const glob = getGlob();
  glob.data = seedDatabase();
  for (const c of COLLECTIONS) glob.dirty.add(c.col as string);
  const sb = makeClient();
  if (sb && !glob.degraded) {
    if (glob.timer) clearTimeout(glob.timer);
    glob.timer = setTimeout(() => {
      const cols = [...glob.dirty];
      glob.dirty.clear();
      flushCollections(sb, cols).catch(() => undefined);
    }, 100);
  }
}

export function uid(): string {
  return crypto.randomUUID();
}

export function sid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Nama tabel koleksi (utk skrip/uji eksternal). */
export const SUPABASE_ACTIVE = ACTIVE;