#!/usr/bin/env node
/**
 * AVELORA — Uji integrasi API penuh (node:test, tanpa dependensi tambah).
 *
 *   TEST_BASE_URL=http://...  uji terhadap server yang sudah berjalan
 *   npm test                  menumbuhkan server sendiri di port 3391
 *                             dengan basis data TERISOLASI (AVELORA_DATA_DIR)
 *                             di folder temp, lalu dibersihkan.
 *
 * Catatan: mode TEST_BASE_URL memakai DB server aktif (ada baris uji baru).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.TEST_PORT ?? 3391);
const BASE = process.env.TEST_BASE_URL ?? `http://127.0.0.1:${PORT}`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
async function getAsync(url, headers) {
  return fetch(url, { headers, redirect: "manual" });
}
async function postAsync(url, body, headers) {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(headers ?? {}) },
    body: JSON.stringify(body),
  });
}
async function patchAsync(url, body, headers) {
  return fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(headers ?? {}) },
    body: JSON.stringify(body),
  });
}
async function json(res) {
  return res.json().catch(() => ({}));
}
function cookiesOf(res) {
  const sc = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
  return sc.map((c) => c.split(";")[0]).join("; ");
}
async function waitReady(url, ms = 60000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const r = await fetch(url);
      if (r.status === 200) return;
    } catch {
      /* belum siap */
    }
    await sleep(500);
  }
  throw new Error("Server tidak siap dalam batas waktu.");
}

let child = null;
let tempDir = null;

test("AVELORA API — alur utuh (publik, auth, reset sandi, undangan, dashboard, admin)", async (t) => {
  const selfManaged = !process.env.TEST_BASE_URL;
  if (selfManaged) {
    tempDir = mkdtempSync(path.join(tmpdir(), "avelora-test-"));
    const DATA_FILE = path.join(tempDir, "db.json");
    child = spawn(
      process.execPath,
      [path.join("node_modules", "next", "dist", "bin", "next"), "start", "-p", String(PORT)],
      {
        cwd: ROOT,
        env: { ...process.env, AVELORA_DATA_DIR: tempDir },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    child.stderr?.on("data", (d) => process.stderr.write(`[server] ${d}`));
    await waitReady(BASE);
  } else {
    const DATA_FILE = path.join(ROOT, ".data", "db.json");
  }

  const checks = [];
  const check = (name, ok, extra = "") => checks.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? " | " + extra : ""}`);

  // Helper untuk baca token dari DB terisolasi (hanya mode self-managed)
  async function readResetToken(email) {
    if (!tempDir) return null;
    await sleep(700); // tunggu flush mutate
    const db = JSON.parse(readFileSync(path.join(tempDir, "db.json"), "utf-8"));
    return (db.password_resets ?? []).find((x) => x.email.toLowerCase() === email.toLowerCase())?.token ?? null;
  }

  try {
    // ---------- Publik ----------
    check("GET /", (await getAsync(BASE + "/")).status === 200);
    check("GET /ahmad-sarah", (await getAsync(BASE + "/ahmad-sarah")).status === 200);
    check("GET /ahmad-sarah?to=budi-santoso", (await getAsync(BASE + "/ahmad-sarah?to=budi-santoso")).status === 200);
    check("GET /templates", (await getAsync(BASE + "/templates")).status === 200);
    check("GET /pricing", (await getAsync(BASE + "/pricing")).status === 200);
    check("GET /login", (await getAsync(BASE + "/login")).status === 200);
    check("GET /forgot-password", (await getAsync(BASE + "/forgot-password")).status === 200);
    check("GET /reset-password", (await getAsync(BASE + "/reset-password")).status === 200);

    // ---------- Auth ----------
    const email = `test-${Date.now()}@test.id`;
    const password = "simpan1234";
    const newPassword = "ganti5678";

    let r = await postAsync(BASE + "/api/auth/register", {
      email,
      password,
      first_name: "Uji",
      last_name: "Automation",
    });
    const userCookie = cookiesOf(r);
    check("register", r.status === 200 && !!userCookie, String(r.status));

    r = await postAsync(BASE + "/api/auth/register", {
      email,
      password,
      first_name: "Dup",
      last_name: "Email",
    });
    check("register duplikat -> 409", r.status === 409, String(r.status));

    r = await postAsync(BASE + "/api/auth/login", {
      email,
      password: "salah1234",
    });
    check("login sandi salah -> 401", r.status === 401, String(r.status));

    r = await postAsync(BASE + "/api/auth/login", { email, password });
    check("login benar", r.status === 200 && !!cookiesOf(r), String(r.status));

    // ---------- Lupa sandi -> reset -> login (siklus utuh) ----------
    r = await postAsync(BASE + "/api/auth/forgot", { email });
    check("forgot -> 200", r.status === 200, String(r.status));
    let token = await readResetToken(email);
    check("token reset tersimpan", !!token, token ? "" : "tidak ada");

    r = await postAsync(BASE + "/api/auth/reset", { email, token, password: newPassword });
    check("reset dengan token", r.status === 200, `${r.status} ${(await json(r)).error ?? ""}`);

    r = await postAsync(BASE + "/api/auth/login", { email, password: newPassword });
    check("login sandi baru", r.status === 200, String(r.status));

    r = await postAsync(BASE + "/api/auth/reset", { email, token, password: newPassword });
    check("token bekas ditolak -> 400", r.status === 400, String(r.status));

    // pulihkan sandi asli (siklus kedua)
    r = await postAsync(BASE + "/api/auth/forgot", { email });
    token = await readResetToken(email);
    r = await postAsync(BASE + "/api/auth/reset", { email, token, password });
    check("pulihkan sandi asli", r.status === 200, String(r.status));

    // ---------- Dashboard & Undangan ----------
    r = await getAsync(BASE + "/dashboard", { cookie: userCookie });
    check("GET /dashboard", r.status === 200, String(r.status));

    r = await postAsync(BASE + "/api/invitations", {
      category_id: "cat-wedding",
      template_id: "tpl-wedding-1",
      title: `Tes Otomasi ${Date.now()}`,
      content_data: {
        cover: {
          title: "Automation Wedding",
          subtitle: "Uji integrasi",
          cover_image: "",
          show_verses: true,
          opening_text: "Basmalah",
        },
      },
    }, { cookie: userCookie });
    const created = await json(r);
    check("buat undangan -> 201", r.status === 201 && !!created.id, `${r.status} ${created.error ?? ""}`);
    const invId = created.id;
    const invSlug = created.slug;

    r = await patchAsync(BASE + `/api/invitations/${invId}`, {
      status: "published",
      title: "Tes Otomasi Wedding",
      timezone: "Asia/Jakarta",
    }, { cookie: userCookie });
    check("publish undangan", r.status === 200, String(r.status));

    await sleep(600);
    r = await getAsync(BASE + `/${invSlug}`);
    check("GET undangan publik", r.status === 200, String(r.status));

    // RSVP: payload benar (invitation_id + name + status + attending_count + meal_preference + answers)
    r = await postAsync(BASE + "/api/rsvp", {
      invitation_id: invId,
      name: "Tamu Uji",
      status: "attending",
      attending_count: 2,
      meal_preference: "Prasmanan",
      answers: { q1: "Prasmanan" },
    }, { cookie: userCookie });
    check("POST /api/rsvp", r.status === 200, String(r.status));

    // Messages: payload benar (invitation_id + guest_name + message)
    r = await postAsync(BASE + "/api/messages", {
      invitation_id: invId,
      guest_name: "Tamu Uji",
      message: "Selamat! (uji otomasi)",
    });
    check("POST /api/messages", r.status === 200, String(r.status));

    // Track: payload benar (invitation_id saja)
    r = await postAsync(BASE + "/api/track", {
      invitation_id: invId,
    });
    check("POST /api/track", r.status === 200, String(r.status));

    // Notifikasi: GET /api/notifications memerlukan cookie user
    r = await getAsync(BASE + "/api/notifications", { cookie: userCookie });
    const notifs = await json(r);
    const list = Array.isArray(notifs.notifications) ? notifs.notifications : (Array.isArray(notifs) ? notifs : []);
    const hasRsvp = list.some((n) => n.type === "rsvp");
    const hasGb = list.some((n) => n.type === "guestbook");
    check("notifikasi rsvp + buku tamu", hasRsvp && hasGb, `rsvp=${hasRsvp} gb=${hasGb} total=${list.length}`);

    // Pesan masuk mode moderasi
    r = await getAsync(`${BASE}/api/messages?invitation_id=${invId}`, { cookie: userCookie, redirect: "manual" });
    const msgs = await json(r);
    const pending = Array.isArray(msgs.messages) ? msgs.messages : (Array.isArray(msgs) ? msgs : []);
    const target = pending.find((m) => m.message?.includes && m.message.endsWith("(uji otomasi)"));
    check("pesan masuk mode moderasi (pending)", Array.isArray(pending) && !!target, "tidak ditemukan");

    r = await patchAsync(BASE + `/api/messages/${target.id}`, { status: "approved" }, { cookie: userCookie });
    check("moderasi pesan -> approved", r.status === 200, String(r.status));

    // ---------- Manajemen undangan ----------
    r = await postAsync(BASE + `/api/invitations/${invId}/guests`, {
      names: [
        { name: "Tamu Meja Utama", phone: "0811" },
        { name: "Tamu Meja Kedua" },
      ],
    }, { cookie: userCookie });
    const bulk = await json(r);
    check("tambah tamu massal", r.status === 200 && bulk.created === 2, `${r.status} created=${bulk.created}`);

    await sleep(600);
    const db3 = JSON.parse(readFileSync(tempDir ? path.join(tempDir, "db.json") : path.join(ROOT, ".data", "db.json"), "utf-8"));
    const invited = (db3.guests ?? []).find((g) => g.invitation_id === invId && g.name === "Tamu Meja Utama");
    check("tamu tersimpan", !!invited, invited?.code ?? "tidak");

    r = await postAsync(BASE + `/api/invitations/${invId}/checkin`, { code: invited.code }, { cookie: userCookie });
    check("check-in per kode", r.status === 200, `${r.status} ${(await json(r)).error ?? ""}`);

    r = await getAsync(BASE + `/api/invitations/${invId}/checkin`, { cookie: userCookie });
    const ci = await json(r);
    check("daftar check-in memuat uji", (ci.checkins ?? []).some((c) => c.guest_code === invited.code), String((ci.checkins ?? []).length));

    const page = (p) => getAsync(BASE + `/dashboard/invitations/${invId}${p ? "/" + p : ""}`, { cookie: userCookie }).then((x) => x.status);
    check("halaman ringkasan", (await page("")) === 200);
    check("halaman tamu", (await page("guests")) === 200);
    check("halaman buku tamu", (await page("guestbook")) === 200);
    check("halaman check-in", (await page("checkin")) === 200);
    check("halaman seating", (await page("seating")) === 200);
    check("halaman analitik", (await page("analytics")) === 200);

    // ---------- Billing / profil ----------
    r = await postAsync(BASE + "/api/billing/activate", { plan_id: "plan-premium" }, { cookie: userCookie });
    check("aktivasi premium", r.status === 200, String(r.status));

    r = await patchAsync(BASE + "/api/profile", { first_name: "Uji", last_name: "Automation Perbaikan" }, { cookie: userCookie });
    check("update profil", r.status === 200, String(r.status));

    check("GET /dashboard/billing", (await getAsync(BASE + "/dashboard/billing", { cookie: userCookie })).status === 200);
    check("GET /dashboard/profile", (await getAsync(BASE + "/dashboard/profile", { cookie: userCookie })).status === 200);
    check("GET /dashboard/settings", (await getAsync(BASE + "/dashboard/settings", { cookie: userCookie })).status === 200);

    // ---------- Admin / kontrol akses ----------
    r = await getAsync(BASE + "/admin", { cookie: userCookie });
    check("GET /admin sebagai user -> redirect", r.status === 307, String(r.status));

    r = await postAsync(BASE + "/api/admin", {
      type: "toggle",
      collection: "templates",
      id: "tpl-wedding-1",
      is_active: false,
    }, { cookie: userCookie });
    check("api/admin non-admin -> 403", r.status === 403, String(r.status));

    r = await postAsync(BASE + "/api/auth/login", { email: "admin@avelora.id", password: "admin123" });
    const adminCookie = cookiesOf(r);
    check("login admin", r.status === 200, String(r.status));

    r = await getAsync(BASE + "/admin", { cookie: adminCookie });
    check("GET /admin sebagai admin", r.status === 200, String(r.status));

    r = await postAsync(BASE + "/api/admin", {
      type: "toggle",
      collection: "templates",
      id: "tpl-wedding-1",
      is_active: false,
    }, { cookie: adminCookie });
    check("admin nonaktifkan template", r.status === 200, String(r.status));
    r = await postAsync(BASE + "/api/admin", {
      type: "toggle",
      collection: "templates",
      id: "tpl-wedding-1",
      is_active: true,
    }, { cookie: adminCookie });
    check("admin aktifkan template", r.status === 200, String(r.status));

    assert.ok(checks.every((c) => c.startsWith("PASS")), "Ada uji yang gagal.\n" + checks.join("\n"));
  } finally {
    console.log(checks.join("\n"));
    if (child) {
      child.kill();
      await new Promise((res) => child.once("exit", res));
      child = null;
    }
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
      tempDir = null;
    }
  }
});

process.on("exit", () => {
  if (child) child.kill();
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
});