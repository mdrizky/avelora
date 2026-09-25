/**
 * AVELORA — Backend penyimpanan LOKAL (file `.data/db.json`).
 * Dipakai default. Semua fungsi sinkron atas snapshot dalam memori,
 * dengan persist ke file secara debounced 400ms.
 */
import "server-only";
import * as fs from "node:fs";
import * as path from "node:path";
import type { DBData } from "../types";
import { seedDatabase } from "../seed";

const DB_VERSION = 1;
// AVELORA_DATA_DIR memungkinkan mode uji memakai basis data terisolasi
// (mis. suite `npm test` menunjuk ke folder temp agar tidak mengotori db.dev).
const DATA_DIR = process.env.AVELORA_DATA_DIR
  ? path.resolve(process.env.AVELORA_DATA_DIR)
  : path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const GLOBAL_KEY = "__AVELORA_DB_LOCAL__" as const;

interface DbGlobal {
  data: DBData;
  loaded: boolean;
  dirty: boolean;
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
    user_activities: [],
    broadcasts: [],
    blog_posts: [],
    content_reports: [],
    system_settings: [],
    payment_gateways: [],
  };
}

function loadFromDisk(): DBData | null {
  try {
    if (!fs.existsSync(DB_FILE)) return null;
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as DBData;
    if (parsed.version !== DB_VERSION) return null;
    return { ...emptyData(), ...parsed };
  } catch {
    return null;
  }
}

function persist(data: DBData) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[avelora:db] Gagal menyimpan file data:", err);
  }
}

function getGlob(): DbGlobal {
  const g = globalThis as unknown as Record<string, DbGlobal | undefined>;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      data: emptyData(),
      loaded: false,
      dirty: false,
      timer: null,
    };
  }
  return g[GLOBAL_KEY] as DbGlobal;
}

export function getData(): DBData {
  const glob = getGlob();
  if (!glob.loaded) {
    const fromDisk = loadFromDisk();
    glob.data = fromDisk ?? seedDatabase();
    glob.loaded = true;
    if (!fromDisk) persist(glob.data);
  }
  return glob.data;
}

export function mutate(fn: (data: DBData) => void) {
  const glob = getGlob();
  const data = getData();
  fn(data);
  glob.dirty = true;
  if (glob.timer) clearTimeout(glob.timer);
  glob.timer = setTimeout(() => {
    if (glob.dirty) {
      persist(glob.data);
      glob.dirty = false;
    }
  }, 400);
}

export function saveNow() {
  const glob = getGlob();
  persist(glob.data);
  glob.dirty = false;
  if (glob.timer) {
    clearTimeout(glob.timer);
    glob.timer = null;
  }
}

export function resetToSeed() {
  const glob = getGlob();
  glob.data = seedDatabase();
  glob.dirty = false;
  if (glob.timer) {
    clearTimeout(glob.timer);
    glob.timer = null;
  }
  persist(glob.data);
}

export function uid(): string {
  return crypto.randomUUID();
}

export function sid(): string {
  return Math.random().toString(36).slice(2, 10);
}