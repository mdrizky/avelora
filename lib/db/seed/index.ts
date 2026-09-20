import type { DBData } from "../types";
import { hashPassword } from "../../auth/password";
import { buildTemplates } from "./palettes";
import {
  ago,
  buildDemoAnalytics,
  buildDemoCheckins,
  buildDemoGallery,
  buildDemoGifts,
  buildDemoGuests,
  buildDemoInvitations,
  buildDemoMessages,
  buildDemoRsvps,
  buildDemoSchedules,
  buildDemoTables,
  DEMO_OWNER,
  iso,
} from "./content";

/**
 * Membuat dataset awal (dev/demo) untuk AVELORA.
 * Dipanggil oleh lib/db/store.ts ketika file `.data/db.json` belum ada.
 */
export function seedDatabase(): DBData {
  const now = new Date().toISOString();
  const created = ago(90);

  void now;

  const templates = buildTemplates(created);
  const tpl = {
    wedding: templates.find((t) => t.category_id === "cat-wedding")!.id,
    aqiqah: templates.find((t) => t.category_id === "cat-aqiqah")!.id,
    birthday: templates.find((t) => t.id === "tpl-birthday-2")!.id,
  };

  const data: DBData = {
    version: 1,
    profiles: [
      {
        id: "u-admin",
        email: "admin@avelora.id",
        first_name: "Admin",
        last_name: "AVELORA",
        role: "admin",
        password_hash: hashPassword("admin123"),
        is_verified: true,
        is_suspended: false,
        created_at: ago(120),
        last_login_at: iso(0, 9, 12),
      },
      {
        id: DEMO_OWNER,
        email: "demo@avelora.id",
        first_name: "Daffa",
        last_name: "Nusantara",
        phone: "0812 0000 1111",
        role: "user",
        password_hash: hashPassword("demo123"),
        is_verified: true,
        is_suspended: false,
        created_at: created,
        last_login_at: iso(-1, 20, 5),
      },
    ],
    event_categories: [
      { id: "cat-wedding", name: "Pernikahan", slug: "pernikahan", icon: "heart", tagline: "Momen sakral penuh cinta", is_active: true },
      { id: "cat-aqiqah", name: "Aqiqah", slug: "aqiqah", icon: "baby", tagline: "Syukur atas kelahiran buah hati", is_active: true },
      { id: "cat-khitan", name: "Khitanan", slug: "khitanan", icon: "star", tagline: "Perayaan sunatan ananda", is_active: true },
      { id: "cat-birthday", name: "Ulang Tahun", slug: "ulang-tahun", icon: "cake", tagline: "Rayakan bertambahnya usia", is_active: true },
      { id: "cat-graduation", name: "Wisuda", slug: "wisuda", icon: "graduation-cap", tagline: "Raih impian, rayakan kelulusan", is_active: true },
      { id: "cat-corporate", name: "Acara Korporat", slug: "acara-korporat", icon: "briefcase", tagline: "Seminar, launching & gathering", is_active: true },
      { id: "cat-engagement", name: "Tunangan", slug: "tunangan", icon: "rings", tagline: "Menuju jenjang yang serius", is_active: true },
      { id: "cat-milestone", name: "Momen Lainnya", slug: "momen-lainnya", icon: "sparkles", tagline: "Perayaan apa pun jadi digital", is_active: true },
    ],
    templates,
    invitations: buildDemoInvitations(now, tpl),
    event_schedules: buildDemoSchedules(),
    gallery_images: buildDemoGallery(),
    guests: buildDemoGuests(),
    guest_rsvps: buildDemoRsvps(),
    guest_messages: buildDemoMessages(),
    gift_accounts: buildDemoGifts(),
    music_tracks: [
      { id: "track-1", title: "Serenade Kasih", artist: "Avelora Ensemble", category: "Akustik", audio_url: "", duration: "3:12", license_note: "Karya orisinal sintesis AVELORA", is_active: true, created_at: ago(100) },
      { id: "track-2", title: "Akad Jiwa", artist: "Avelora Strings", category: "Pernikahan", audio_url: "", duration: "4:05", license_note: "Karya orisinal sintesis AVELORA", is_active: true, created_at: ago(100) },
      { id: "track-3", title: "Doa untuk Buah Hati", artist: "Avelora Choir", category: "Aqiqah", audio_url: "", duration: "3:40", license_note: "Karya orisinal sintesis AVELORA", is_active: true, created_at: ago(100) },
      { id: "track-4", title: "Tahniah", artist: "Avelora New Age", category: "Khitanan", audio_url: "", duration: "2:58", license_note: "Karya orisinal sintesis AVELORA", is_active: true, created_at: ago(100) },
      { id: "track-5", title: "Confetti March", artist: "Avelora Band", category: "Ulang Tahun", audio_url: "", duration: "2:33", license_note: "Karya orisinal sintesis AVELORA", is_active: true, created_at: ago(100) },
    ],
    analytics_events: buildDemoAnalytics(),
    checkins: buildDemoCheckins(),
    seating_tables: buildDemoTables(),
    plans: [
      { id: "plan-free", name: "free", display_name: "Gratis", price: 0, period: "bulan", is_active: true, features: { invitations: 3, guests: 100, templates: "free", analytics: true, watermark: true, remove_branding: false, custom_url: false, music: false, qr_checkin: false, seating: false } },
      { id: "plan-basic", name: "basic", display_name: "Basic", price: 49000, period: "bulan", is_active: true, features: { invitations: 10, guests: 500, templates: "free", analytics: true, watermark: true, remove_branding: false, custom_url: false, music: false, qr_checkin: false, seating: false } },
      { id: "plan-premium", name: "premium", display_name: "Premium", price: 99000, period: "bulan", is_active: true, features: { invitations: "unlimited", guests: 1000, templates: "all", analytics: true, watermark: true, remove_branding: true, custom_url: true, music: true, qr_checkin: true, seating: true } },
      { id: "plan-pro", name: "pro", display_name: "Pro", price: 199000, period: "bulan", is_active: true, features: { invitations: "unlimited", guests: "unlimited", templates: "all", analytics: true, watermark: true, remove_branding: true, custom_url: true, music: true, qr_checkin: true, seating: true, white_label: true } },
    ],
    subscriptions: [
      { id: "sub-1", owner_id: DEMO_OWNER, plan_id: "plan-free", status: "active", starts_at: created, ends_at: iso(275) },
    ],
    orders: [],
    coupons: [
      { id: "cpn-1", code: "WELCOME10", discount_type: "percent", discount_value: 10, quota: 500, used_count: 3, is_active: true },
    ],
    notifications: [
      { id: "ntf-1", user_id: DEMO_OWNER, type: "rsvp", title: "RSVP Baru", body: "Andi Wijaya mengonfirmasi kehadiran.", link: "/dashboard/invitations/inv-01/guests", read: false, created_at: ago(5, 12, 2) },
      { id: "ntf-2", user_id: DEMO_OWNER, type: "guestbook", title: "Ucapan Baru", body: "Febriansyah menulis pesan di buku tamu.", link: "/dashboard/invitations/inv-01/guestbook", read: false, created_at: ago(4, 18, 46) },
      { id: "ntf-3", user_id: DEMO_OWNER, type: "system", title: "Selamat Datang di AVELORA", body: "Selesaikan profil dan buat undangan pertamamu.", link: "/dashboard/invitations", read: true, created_at: created },
    ],
    audit_logs: [
      { id: "al-1", admin_id: "u-admin", action: "create_template", entity_type: "template", entity_id: "tpl-golden-ring", metadata: { name: "Golden Ring" }, created_at: ago(89) },
      { id: "al-2", admin_id: "u-admin", action: "publish_plan", entity_type: "plan", entity_id: "plan-pro", created_at: ago(89, 10, 30) },
    ],
    testimonials: [
      { id: "tst-1", name: "Sari Wulandari", role: "Event Organizer", content: "Mengelola 200 tamu jadi jauh lebih mudah. QR check-in-nya keren!", rating: 5, is_active: true },
      { id: "tst-2", name: "Bagas Ramadhan", role: "Freelancer", content: "Bikin undangan pernikahan kurang dari 20 menit. Tamu langsung bisa RSVP.", rating: 5, is_active: true },
      { id: "tst-3", name: "Nadia Putri", role: "Ibu Rumah Tangga", content: "Tamu memuji undangan digital kami. Semuanya personal dengan nama masing-masing.", rating: 5, is_active: true },
      { id: "tst-4", name: "Hendra Gunawan", role: "Pemilik Kafe", content: "Acara launching jadi profesional dengan tema premium. Sangat direkomendasikan.", rating: 4, is_active: true },
      { id: "tst-5", name: "Maya Anggraini", role: "Guru", content: "Fitur buku tamu dan musik orisinalnya bagus. Anak-anak suka!", rating: 5, is_active: true },
    ],
    faqs: [
      { id: "faq-1", question: "Bagaimana cara membuat undangan digital?", answer: "Daftar lalu pilih jenis acara dan template, sesuaikan konten dengan live preview, lalu publikasikan dan bagikan link-nya.", order_index: 1, is_active: true },
      { id: "faq-2", question: "Apakah tamu melihat undangan yang personal?", answer: "Ya. Gunakan filter nama tamu di menu Tamu, lalu bagikan link personal (contoh: /undangan?to=budi-santoso) agar nama mereka otomatis muncul.", order_index: 2, is_active: true },
      { id: "faq-3", question: "Bisakah saya menambahkan musik?", answer: "Premium dan Pro memiliki akses pustaka musik orisinal berlisensi AVELORA yang dapat diputar otomatis di undangan.", order_index: 3, is_active: true },
      { id: "faq-4", question: "Apakah AVELORA berbayar?", answer: "Tersedia paket gratis. Paket berbayar membuka template premium, musik, domain khusus, QR check-in, dan tanpa watermark.", order_index: 4, is_active: true },
      { id: "faq-5", question: "Bagaimana tamu mengisi RSVP?", answer: "Tamu cukup membuka link undangan, menekan tombol RSVP, lalu memilih kehadiran. Data masuk ke dashboard Anda.", order_index: 5, is_active: true },
      { id: "faq-6", question: "Apakah mendukung QR check-in?", answer: "Ya, tersedia untuk paket Premium dan Pro. Setiap tamu mendapat kode unik untuk proses registrasi di lokasi.", order_index: 6, is_active: true },
    ],
    password_resets: [],
    verify_tokens: [],
  };

  return data;
}