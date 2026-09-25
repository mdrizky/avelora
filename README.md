# AVELORA

Platform undangan digital dan manajemen acara: RSVP, buku tamu, QR check-in, analitik, templat, editor live, billing demo, dan panel admin.

Teknologi: **Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, dan Supabase PostgreSQL**.

## Penting: penyebab error di SQL Editor

Jangan tempel isi `lib/db/stores/supabase.ts` ke Supabase SQL Editor. File itu adalah kode TypeScript yang dijalankan oleh server Next.js. Itulah sebabnya Supabase menampilkan error pada:

```text
import "server-only";
```

Yang boleh ditempel dan dijalankan di SQL Editor hanya isi file [`supabase/schema.sql`](supabase/schema.sql). Setelah tabel selesai dibuat, aplikasi memakai `@supabase/supabase-js` dari sisi server untuk membaca dan menulis data.

## Menjalankan lokal

Prasyarat: Node.js 20.6 atau lebih baru.

```bash
npm install
copy .env.local.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

Tanpa perubahan env, aplikasi memakai database lokal di `.data/db.json`. File tersebut dibuat otomatis saat aplikasi pertama kali berjalan dan berisi seed demo.

### Akun demo

| Akun | Email | Sandi | Peran |
|---|---|---|---|
| Host | `demo@avelora.id` | `demo123` | user |
| Admin | `admin@avelora.id` | `admin123` | admin |

Contoh URL: `/ahmad-sarah` (publish), `/aqiqah-rayyan` (publish + Event Memory), `/naura-birthday` (draft). Personalisasi tamu: `/ahmad-sarah?to=budi-santoso`.

## Mengaktifkan Supabase

Supabase adalah database online. Agar aplikasi juga bisa diakses publik, aplikasi Next.js tetap perlu dideploy ke Vercel atau hosting Node.js lain.

### 1. Buat project dan tabel

1. Buat project di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**.
3. Buka file [`supabase/schema.sql`](supabase/schema.sql) di repo, salin seluruh isinya, tempel ke SQL Editor, lalu klik **Run**.
4. Pastikan query selesai tanpa error dan tabel Avelora terlihat di **Table Editor**.

Jangan menjalankan `supabase.ts` di SQL Editor. File itu tetap berada di repo.

### 2. Isi kredensial server

Salin `.env.local.example` menjadi `.env.local`, lalu isi:

```env
DATABASE_STORE=supabase
SUPABASE_URL=https://project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
AUTH_SECRET=ganti-dengan-string-acak-minimal-32-karakter
```

`SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` tersedia di **Project Settings → API**. Gunakan `service_role` hanya di server. Jangan beri nama variabel ini dengan awalan `NEXT_PUBLIC_`, jangan commit `.env.local`, dan jangan menaruh key tersebut di komponen client.

### 3. Pindahkan seed lokal ke Supabase

Jika ingin memakai data demo/lokal yang sudah ada:

```bash
npm run db:export
npm run db:import:dry
npm run db:import
```

`db:export` membuat `supabase/seed-data.json` dari `.data/db.json`. Import melakukan upsert dan, secara default, menghapus baris yang tidak ada di seed. Untuk mempertahankan baris yang sudah ada di Supabase, gunakan:

```bash
node scripts/import-to-supabase.mjs --keep
```

Jika tidak punya data lokal, cukup jalankan `npm run db:export` setelah aplikasi lokal pernah dijalankan, lalu lakukan import.

### 4. Jalankan dan verifikasi

```bash
npm run dev
```

Log yang benar:

```text
[avelora:db] Supabase siap. Total N baris di 30 tabel.
```

Uji login, buka `/ahmad-sarah`, kirim RSVP, lalu cek tabel terkait di Supabase Table Editor. Jika env Supabase salah atau tabel belum dibuat, aplikasi memakai seed lokal dalam mode degraded dan menulis peringatan di terminal.

## Deploy online

Contoh menggunakan Vercel:

1. Push repo ke GitHub.
2. Import repository di [vercel.com](https://vercel.com).
3. Di **Project Settings → Environment Variables**, tambahkan `DATABASE_STORE`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, dan `AUTH_SECRET` untuk environment yang dipakai.
4. Deploy ulang setelah semua env tersimpan.
5. Buka URL deployment dan verifikasi login, undangan publik, RSVP, serta dashboard.

Supabase hanya menyediakan database; Supabase tidak otomatis menjalankan server Next.js. Gunakan **service role key** sebagai environment variable server pada hosting, bukan sebagai `NEXT_PUBLIC_*`.

## Mode penyimpanan

`lib/db/store.ts` memilih backend berdasarkan env:

- `DATABASE_STORE=local`: `.data/db.json`, cocok untuk demo/development.
- `DATABASE_STORE=supabase` dengan dua credential lengkap: Postgres Supabase.
- `DATABASE_STORE=supabase` tanpa credential lengkap: fallback lokal dengan warning.

Backend Supabase memuat seluruh koleksi ke memory saat boot, lalu menyinkronkan perubahan dengan debounce. Model ini cocok untuk demo atau satu instance. Untuk multi-instance production dengan trafik besar, repository perlu diubah menjadi operasi async per baris/transaksi.

## Struktur database

Skema relasional lengkap, index, foreign key, dan RLS ada di [`supabase/schema.sql`](supabase/schema.sql). Koleksi aplikasi:

- Master: `profiles`, `event_categories`, `templates`, `music_tracks`, `plans`, `coupons`.
- Undangan: `invitations`, `event_schedules`, `gallery_images`, `gift_accounts`.
- Tamu/interaksi: `guests`, `guest_rsvps`, `guest_messages`, `seating_tables`, `checkins`, `analytics_events`.
- Billing/operasional: `subscriptions`, `orders`, `notifications`, `audit_logs`.
- Konten publik: `testimonials`, `faqs`.
- Token: `password_resets`, `verify_tokens`.
- Admin/platform: `user_activities`, `broadcasts`, `blog_posts`, `content_reports`, `system_settings`, `payment_gateways`.

## Fitur MVP

- Halaman publik, lima kategori acara, templat, pricing, galeri, jadwal, peta, musik, amplop/kado, Event Memory, dan personalisasi `?to=<guest-slug>`.
- RSVP, buku tamu dengan moderasi, analytics view, rate limit, deteksi device/browser, dan notifikasi host.
- Register, login, logout, verifikasi email demo, lupa/reset password, dan sesi cookie HMAC.
- Dashboard host: editor live, publish, guests, seating, buku tamu, analytics, QR check-in, billing simulasi, profil, dan password.
- Admin: statistik, pengaturan templat/paket/testimoni/musik, dan moderasi buku tamu lintas undangan.

Pembayaran dan pengiriman email belum terhubung ke provider eksternal; keduanya masih alur demo berbasis database.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Menjalankan development server |
| `npm run build` | Membuat production build |
| `npm run start` | Menjalankan production build |
| `npm run lint` | Menjalankan ESLint |
| `npm test` | Menjalankan API tests |
| `npx tsc --noEmit` | Type check TypeScript |
| `npm run db:export` | Ekspor `.data/db.json` ke `supabase/seed-data.json` |
| `npm run db:import` | Import seed ke Supabase dan mirror koleksi |
| `npm run db:import:dry` | Melihat rencana import tanpa menulis |
| `npm run db:reset` | Menghapus database lokal agar dibuat ulang dari seed |
| `npm run db:validate` | Memvalidasi seed |

## Troubleshooting

### `syntax error at or near "server-only"`

Kode TypeScript masuk ke SQL Editor. Hapus query tersebut dan jalankan hanya [`supabase/schema.sql`](supabase/schema.sql).

### `DATABASE_STORE=supabase` tetapi masih memakai lokal

Pastikan `.env.local` berada di root repo, nama variabel tepat, tidak ada tanda kutip aneh, lalu restart `npm run dev`. `SUPABASE_SERVICE_ROLE_KEY` wajib terisi.

### Import gagal

Pastikan schema sudah dijalankan lebih dulu, `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` benar, lalu jalankan `npm run db:import:dry`. Pesan `XX <tabel>` menunjukkan tabel yang gagal.

### Database Supabase kosong

Schema hanya membuat tabel. Jalankan `npm run db:export` lalu `npm run db:import` untuk memasukkan data demo.

### Update fitur admin di project Supabase lama

Setelah update kode yang menambah kontrol admin, jalankan ulang seluruh [`supabase/schema.sql`](supabase/schema.sql) di SQL Editor. Statement schema sudah memakai `if not exists`, `add column if not exists`, dan policy yang idempotent sehingga tidak menghapus data lama. Schema juga membuat bucket Storage `avelora-assets` dan `avelora-audio`.

### Next.js 16

Saat memodifikasi kode, ikuti dokumentasi lokal di `node_modules/next/dist/docs/`. `params`, `searchParams`, dan `cookies()` pada App Router versi ini bersifat async.