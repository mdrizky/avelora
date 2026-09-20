# AVELORA — Digital Invitation & Event Platform

Platform undangan digital + manajemen acara (RSVP, buku tamu, QR check-in, analitik, templat, editor live, billing, dan panel admin). Dibangun dengan **Next.js 16 (App Router) + React 19 + Tailwind CSS v4**, data-first lokal, dan siap dicolokkan ke **Supabase/Postgres**.

---

## Mulai cepat

```bash
npm install
npm run dev        # http://localhost:3000
```

> Next.js 16 di sini punya API berbeda dari versi lama (params/searchParams async, dsb.). Saat memodifikasi kode, patuhi panduan `node_modules/next/dist/docs/`.

### Akun demo

| Akun | Email | Sandi | Peran |
|---|---|---|---|
| Host | `demo@avelora.id` | `demo123` | user (3 undangan contoh) |
| Admin | `admin@avelora.id` | `admin123` | admin |

Undangan publik contoh: `/ahmad-sarah` (publish), `/aqiqah-rayyan` (publish + Event Memory), `/naura-birthday` (draft). Personalisasi tamu: `/ahmad-sarah?to=budi-santoso`.

---

## Di mana database-nya?

Ada **dua mode penyimpanan**, dipilih lewat env `DATABASE_STORE`:

1. **`local` (default)** — file JSON di **`C:\Projects\avelora\.data\db.json`**.
   - Dibuat otomatis saat server pertama kali berjalan (diisi seed bawaan).
   - Semua tulis disimpan debounced 400 ms ke berkas ini.

2. **`supabase`** — Postgres di project Supabase Anda (lihat bagian "Migrasi ke Supabase").
   - Setiap perubahan tetap tersimpan di memori lalu disinkronkan (upsert per koleksi) ke tabel Postgres.

Ketiga sistem (repo, route, UI) **tidak berubah** apa pun modenya — hanya backend penyimpanan yang diganti di `lib/db/store.ts` (`stores/local.ts` vs `stores/supabase.ts`).

---

## Struktur data

Skema 1:1 dengan PRD & tipe di `lib/db/types.ts`:

- Master: `profiles`, `event_categories`, `templates`, `music_tracks`, `plans`, `coupons`
- Undangan: `invitations` (`content_data`/`theme_config` jsonb), `event_schedules`, `gallery_images`, `gift_accounts`
- Tamu & interaksi: `guests`, `guest_rsvps`, `guest_messages`, `seating_tables`, `checkins`, `analytics_events`
- Billing & ops: `subscriptions`, `orders`, `notifications`, `audit_logs`
- Konten publik: `testimonials`, `faqs`
- Token: `password_resets`, `verify_tokens`

DDL lengkap (relasional + indeks + RLS): **`supabase/schema.sql`**.

---

## Migrasi ke Supabase

1. **Buat project** di [supabase.com](https://supabase.com) (berbayar/free tier bebas).
2. **Jalankan skema**: buka `supabase/schema.sql`, tempel isinya ke **SQL Editor** project Anda, jalankan.
3. **Ambil kredensial**: Project Settings → API → salin **Project URL** dan **`service_role`** key.
4. **Isi env**: salin `.env.local.example` → `.env.local`:

   ```env
   DATABASE_STORE=supabase
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   ```

   > `service_role` = kunci server-only. Jangan pernah diletakkan di kode client.

5. **Ekspor & impor data lokal Anda**:

   ```bash
   npm run db:export      # .data/db.json -> supabase/seed-data.json
   npm run db:import      # seed-data.json -> tabel Supabase (upsert + hapus yg tak ada)
   npm run db:import:dry  # pratinjau rencana import tanpa mengeksekusi
   ```

6. **Jalankan**:

   ```bash
   npm run dev
   ```

   Log saat boot menampilkan `[avelora:db] Supabase siap. Total N baris …`.
   Jika Supabase tidak terjangkau, aplikasi jatuh ke **mode degradasi** (memakai seed lokal) dengan peringatan jelas di log.

Skrip lain: `npm run db:reset` menghapus `db.json` sehingga di-reseed saat server di-restart.

---

## Skrip

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server (hot reload) |
| `npm run build` | Production build |
| `npm run start` | Jalankan build (parameter port: `npm start -- -p 3100`) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |
| `npm run db:export` | Ekspor DB lokal → `supabase/seed-data.json` |
| `npm run db:import` | Import seed → Supabase |
| `npm run db:import:dry` | Pratinjau import |
| `npm run db:reset` | Reset DB lokal ke seed murni (restart server setelahnya) |

---

## Fitur (100% MVP)

**Publik**
- Landing (`/`), templat (`/templates`), harga (`/pricing`), undangan publik `/[slug]` dengan 5 kategori (Pernikahan, Aqiqah, Khitanan, Ulang Tahun, Wisuda), personalisasi `?to=<guest-slug>`, buku tamu, RSVP, amplop/kado, jadwal + peta, galeri, memori acara untuk undangan yang sudah lewat, musik (`track_id`), waterfall greeting.

**Guest flow (API ber-rate-limit + deteksi device/browser)**
- `POST /api/rsvp` (cari/buat tamu, konfirmasi, notifikasi ke pemilik)
- `POST /api/messages` (mode moderasi sesuai `auto_approve`, notifikasi)
- `POST /api/track` (analitik kunjungan, visitor-hash)

**Autentikasi**
- Daftar, masuk, keluar, lupa sandi & reset (token tersimpan di DB; tanpa SMTP — demo), verifikasi email (token).

**Dashboard host** (per undangan)
- Ringkasan & statistik, editor live (autosave, publish, tautan salin, hapus, preview ponsel), Tamu (import massal, cari, meja, tautan pribadi), Buku Tamu (moderasi + semat), Analitik 7 hari (device/browser), Seating (denah + penempatan), Check-in (cari/QR tamu, fitur QR premium).
- Billing (paket & aktivasi simulasi; tanpa payment gateway — demo), profil & sandi.

**Admin**
- Statistik platform, toggle templat/paket/testimoni, atur URL audio musik berlisensi, moderasi buku tamu lintas-undangan. (Route `/admin` hanya untuk peran `admin`.)

---

## Keamanan & model data

- Sesuai Next 16: `params`/`searchParams`/`cookies()` async; `useSearchParams` di dalam `<Suspense>`; rate-limit di server (`server-only`); halaman publik `noindex`.
- Sesi = cookie HMAC-signed (AUTH_SECRET) — tanpa tabel sesi.
- Kunci `service_role` hanya dipakai sisi server (mode Supabase); RLS aktif di semua tabel `supabase/schema.sql`.
- `GET /api/messages`, `GET /api/notifications`, `PATCH/DELETE /api/messages/[id]`, dsb. dilindungi owner/admin.

---

## Troubleshooting

- **`DATABASE_STORE=supabase` tanpa kunci** → jatuh ke penyimpanan lokal dengan peringatan di log.
- **Import gagal sebagian** → ada baris yang tidak lolos tipe kolom (mis. angka/boolean salah). Periksa `supabase/schema.sql` dan pesan error `XX  <tabel>` di log import.
- **Build di mesin tanpa env** → mode lokal default; tidak butuh Supabase saat `npm run build`.
- **Satu kejadian perubahan menyinkronkan semua koleksi** (model snapshot single-instance) — cukup untuk demo; untuk multi-instance produksi, pindahkan ke repository async per-row.