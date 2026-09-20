import type {
  AnalyticsEvent,
  Checkin,
  EventSchedule,
  GalleryImage,
  GiftAccount,
  Guest,
  GuestMessage,
  GuestRsvp,
  Invitation,
  InvitationContent,
  SeatingTable,
} from "../types";
import { SAMPLE_IMG, theme } from "./palettes";

export const DEMO_OWNER = "u-demo";

const DAY = 86400000;
export function iso(daysOffset: number, h = 12, m = 0): string {
  const d = new Date(Date.now() + daysOffset * DAY);
  d.setHours(h, m, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(h)}:${pad(m)}:00`;
}
export function isoDate(daysOffset: number): string {
  return iso(daysOffset, 0, 0).slice(0, 10);
}
export function ago(days: number, h = 10, m = 0): string {
  return iso(-days, h, m);
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const WEDDING_STORY: InvitationContent["story"] = {
  title: "Perjalanan Kami",
  items: [
    {
      id: "st-1",
      title: "Pertama Bertemu",
      date: "Januari 2019",
      description: "Takdir mempertemukan kami di sebuah acara komunitas di Pekanbaru.",
      photo: SAMPLE_IMG.story1,
    },
    {
      id: "st-2",
      title: "Menjalin Komitmen",
      date: "Juli 2022",
      description: "Empat tahun berjalan berdua, kami saling menguatkan dan memantapkan hati.",
      photo: SAMPLE_IMG.hands,
    },
    {
      id: "st-3",
      title: "Lamaran",
      date: "Mei 2026",
      description: "Dengan izin kedua keluarga, kami resmi bertunangan menuju jenjang pernikahan.",
      photo: SAMPLE_IMG.couple,
    },
  ],
};

function weddingContent(): InvitationContent {
  return {
    cover: { title: "Ahmad & Sarah", subtitle: "Kami mengundang Anda", show_verses: true, cover_image: SAMPLE_IMG.couple },
    hero: { photo: SAMPLE_IMG.couple, caption: "Together with their families" },
    couple: {
      groomName: "Ahmad Fadli",
      groomFullName: "Ahmad Fadli R., S.T.",
      groomParents: "Putra dari Bapak H. Rusdi & Ibu Hj. Nurhayati",
      groomPhoto: SAMPLE_IMG.groom,
      brideName: "Sarah Putri",
      brideFullName: "Sarah Putri Aswita, S.Pd.",
      brideParents: "Putri dari Bapak Drs. Aswita & Ibu Dra. Lindawati",
      bridePhoto: SAMPLE_IMG.bride,
      greeting: "Bismillahirrahmanirrahim",
    },
    story: WEDDING_STORY,
    rsvp: {
      header: "Konfirmasi Kehadiran",
      require_phone: true,
      questions: [
        { id: "q-1", label: "Pilihan menu", type: "meal", choices: ["Nasi Kotak", "Prasmanan", "Tidak makan"], required: false },
        { id: "q-2", label: "Membawa pendamping", type: "yes_no", required: false },
      ],
    },
    gift: { header: "Tanda Cinta", message: "Doa restu Anda adalah hadiah terindah. Jika ingin berbagi, silakan melalui: " },
    guestbook: { header: "Kata Sambutan", message: "Tuliskan doa dan harapan terbaik Anda.", auto_approve: true },
    music: { track_id: "track-2", autoplay: false },
  };
}

function aqiqahContent(): InvitationContent {
  return {
    cover: { title: "Aqiqah Rayyan", subtitle: "Undangan Tasmiyah & Aqiqah", show_verses: true, cover_image: SAMPLE_IMG.baby },
    hero: { photo: SAMPLE_IMG.baby, caption: "Alhamdulillah telah lahir buah hati kami" },
    child: {
      childName: "Rayyan Alfarizi",
      childParents: "Putra pertama dari Bpk. Edward & Ibu Nadia",
      age: "40 hari",
      photo: SAMPLE_IMG.baby2,
    },
    story: {
      title: "Kelahiran",
      items: [
        { id: "st-a1", title: "Lahir dengan Selamat", date: isoDate(-20), description: "Allah amanahkan kami putra pertama dengan berat badan 3,4 kg.", photo: SAMPLE_IMG.baby },
        { id: "st-a2", title: "Tasmiyah", date: isoDate(-7), description: "Diberi nama Rayyan Alfarizi, semoga menjadi anak yang saleh dan berbakti.", photo: SAMPLE_IMG.baby2 },
      ],
    },
    rsvp: { header: "Konfirmasi Kehadiran", require_phone: false, questions: [] },
    gift: { header: "Tanda Terima Kasih", message: "Cukup kehadiran & doa Anda bagi kami." },
    guestbook: { header: "Doa & Ucapan", message: "Sampaikan ucapan dan doa untuk Rayyan.", auto_approve: true },
    music: { track_id: "track-3", autoplay: false },
  };
}

function birthdayContent(): InvitationContent {
  return {
    cover: { title: "Naura's Birthday", subtitle: "7th Birthday Party", show_verses: false, cover_image: SAMPLE_IMG.cake },
    hero: { photo: SAMPLE_IMG.confetti, caption: "A joyful day for our little star" },
    birthday: { birthdayName: "Naura Alsa", age: "7", photo: SAMPLE_IMG.cake },
    story: {
      title: "Merayakan",
      items: [
        { id: "st-b1", title: "Happy 7", date: isoDate(21), description: "Rayakan ulang tahun Naura yang ke-7 bersama keluarga.", photo: SAMPLE_IMG.confetti },
      ],
    },
    rsvp: { header: "RSVP", require_phone: false, questions: [] },
    gift: { header: "Hadiah", message: "Kehadiran Anda adalah hadiah terbaik. Kado tidak wajib, tapi kami haturkan terima kasih." },
    guestbook: { header: "Pesan", message: "Tulis ucapan untuk Naura di sini.", auto_approve: true },
    music: { track_id: "track-5", autoplay: false },
  };
}

export function buildDemoInvitations(
  now: string,
  templateIds: { wedding: string; aqiqah: string; birthday: string },
): Invitation[] {
  const invitations: Invitation[] = [];
  { // inv-01 wedding — published, +85 hari
    const inv: Omit<Invitation, "content_data"> & { content_data: unknown } = {
      id: "inv-01",
      owner_id: DEMO_OWNER,
      template_id: templateIds.wedding,
      category_id: "cat-wedding",
      slug: "ahmad-sarah",
      title: "Ahmad & Sarah",
      status: "published",
      content_data: {},
      theme_config: theme("Evergold", "evergold", "serif", "classic"),
      music_track_id: "track-2",
      timezone: "Asia/Jakarta",
      event_date: isoDate(85),
      city: "Pekanbaru",
      custom_url_enabled: false,
      watermark_enabled: true,
      remove_branding: false,
      published_at: ago(14),
      created_at: ago(20),
      updated_at: ago(3),
    };
    inv.content_data = weddingContent();
    invitations.push(inv as Invitation);
  }
  { // inv-02 aqiqah — published, -20 hari (Event Memory)
    const inv: Omit<Invitation, "content_data"> & { content_data: unknown } = {
      id: "inv-02",
      owner_id: DEMO_OWNER,
      template_id: templateIds.aqiqah,
      category_id: "cat-aqiqah",
      slug: "aqiqah-rayyan",
      title: "Aqiqah Rayyan",
      status: "published",
      content_data: {},
      theme_config: theme("Sage Baby", "sagegarden", "sans", "classic"),
      music_track_id: "track-3",
      timezone: "Asia/Jakarta",
      event_date: isoDate(-20),
      city: "Pekanbaru",
      watermark_enabled: true,
      published_at: ago(35),
      created_at: ago(38),
      updated_at: ago(21),
    };
    inv.content_data = aqiqahContent();
    invitations.push(inv as Invitation);
  }
  { // inv-03 birthday — draft
    const inv: Omit<Invitation, "content_data"> & { content_data: unknown } = {
      id: "inv-03",
      owner_id: DEMO_OWNER,
      template_id: templateIds.birthday,
      category_id: "cat-birthday",
      slug: "naura-birthday",
      title: "Naura's Birthday",
      status: "draft",
      content_data: {},
      theme_config: theme("Candy Blush", "blushpetal", "script", "classic"),
      timezone: "Asia/Jakarta",
      event_date: isoDate(21),
      city: "Pekanbaru",
      watermark_enabled: true,
      created_at: ago(2),
      updated_at: ago(1),
    };
    inv.content_data = birthdayContent();
    invitations.push(inv as Invitation);
  }
  return invitations;
}

export function buildDemoSchedules(): EventSchedule[] {
  return [
    {
      id: "sch-01a", invitation_id: "inv-01", label: "Akad Nikah",
      event_date: isoDate(85), start_time: "09:00", end_time: "11:00",
      location_name: "Gedung Utama Ballroom", address: "Jl. Soekarno-Hatta No. 88, Pekanbaru",
      maps_url: "https://maps.google.com/?q=Jl.+Soekarno-Hatta+No.88+Pekanbaru", order_index: 1,
    },
    {
      id: "sch-01b", invitation_id: "inv-01", label: "Resepsi",
      event_date: isoDate(85), start_time: "13:00", end_time: "17:00",
      location_name: "Gedung Utama Ballroom", address: "Jl. Soekarno-Hatta No. 88, Pekanbaru",
      maps_url: "https://maps.google.com/?q=Jl.+Soekarno-Hatta+No.88+Pekanbaru", order_index: 2,
    },
    {
      id: "sch-02", invitation_id: "inv-02", label: "Tasmiyah & Aqiqah",
      event_date: isoDate(-20), start_time: "08:00", end_time: "11:00",
      location_name: "Masjid Raya An-Nur", address: "Jl. Jend. Sudirman No. 269, Pekanbaru",
      maps_url: "https://maps.google.com/?q=Masjid+An-Nur+Pekanbaru", order_index: 1,
    },
    {
      id: "sch-03", invitation_id: "inv-03", label: "Pesta Ulang Tahun",
      event_date: isoDate(21), start_time: "19:00", end_time: "21:30",
      location_name: "Rumah Kertapati", address: "Jl. Kertapati No. 12, Pekanbaru",
      maps_url: "https://maps.google.com/?q=Jl.+Kertapati+Pekanbaru", order_index: 1,
    },
  ];
}

export function buildDemoGallery(): GalleryImage[] {
  return [
    { id: "img-w1", invitation_id: "inv-01", image_url: SAMPLE_IMG.couple, order_index: 1, uploaded_at: ago(15) },
    { id: "img-w2", invitation_id: "inv-01", image_url: SAMPLE_IMG.bride, order_index: 2, uploaded_at: ago(15) },
    { id: "img-w3", invitation_id: "inv-01", image_url: SAMPLE_IMG.groom, order_index: 3, uploaded_at: ago(15) },
    { id: "img-w4", invitation_id: "inv-01", image_url: SAMPLE_IMG.table, order_index: 4, uploaded_at: ago(14) },
    { id: "img-w5", invitation_id: "inv-01", image_url: SAMPLE_IMG.venue, order_index: 5, uploaded_at: ago(14) },
    { id: "img-w6", invitation_id: "inv-01", image_url: SAMPLE_IMG.story1, order_index: 6, uploaded_at: ago(14) },
    { id: "img-w7", invitation_id: "inv-01", image_url: SAMPLE_IMG.hands, order_index: 7, uploaded_at: ago(14) },
    { id: "img-a1", invitation_id: "inv-02", image_url: SAMPLE_IMG.baby, order_index: 1, uploaded_at: ago(36) },
    { id: "img-a2", invitation_id: "inv-02", image_url: SAMPLE_IMG.baby2, order_index: 2, uploaded_at: ago(36) },
    { id: "img-b1", invitation_id: "inv-03", image_url: SAMPLE_IMG.cake, order_index: 1, uploaded_at: ago(1) },
    { id: "img-b2", invitation_id: "inv-03", image_url: SAMPLE_IMG.confetti, order_index: 2, uploaded_at: ago(1) },
  ];
}

export function buildDemoGuests(): Guest[] {
  const guests: Guest[] = [
    { id: "g-01", invitation_id: "inv-01", name: "Budi Santoso", phone: "0812 3456 7890", email: "budi@mail.com", guest_slug: "budi-santoso", invited_count: 1, category: "Teman", table_number: "07", code: "AVL-92832", created_at: ago(12) },
    { id: "g-02", invitation_id: "inv-01", name: "Siti Rahma", phone: "0813 2233 4455", guest_slug: "siti-rahma", invited_count: 1, category: "Keluarga", table_number: "02", code: "AVL-30821", created_at: ago(12) },
    { id: "g-03", invitation_id: "inv-01", name: "Andi Wijaya", phone: "0821 9876 5432", guest_slug: "andi-wijaya", invited_count: 2, category: "Keluarga", table_number: "12", code: "AVL-77410", created_at: ago(11) },
    { id: "g-04", invitation_id: "inv-01", name: "Rizky Pratama", phone: "0856 1112 2233", guest_slug: "rizky-pratama", invited_count: 1, category: "Teman", table_number: "05", code: "AVL-55821", created_at: ago(11) },
    { id: "g-05", invitation_id: "inv-01", name: "Dewi Lestari", phone: "0877 8899 0011", guest_slug: "dewi-lestari", invited_count: 1, category: "Rekan Kantor", table_number: "03", code: "AVL-20018", created_at: ago(10) },
    { id: "g-06", invitation_id: "inv-02", name: "H. Zainal Abidin", phone: "0812 4445 6677", guest_slug: "zainal-abidin", invited_count: 4, category: "Keluarga", code: "AVL-11203", created_at: ago(30) },
    { id: "g-07", invitation_id: "inv-02", name: "Maya Sari", phone: "0813 5567 8899", guest_slug: "maya-sari", invited_count: 1, category: "Tetangga", code: "AVL-99541", created_at: ago(29) },
    { id: "g-08", invitation_id: "inv-03", name: "Kak Rara", phone: "0852 1234 5678", guest_slug: "rara-aulia", invited_count: 1, category: "Keluarga", code: "AVL-66170", created_at: ago(1) },
    { id: "g-09", invitation_id: "inv-03", name: "Om Bima", phone: "0822 3344 5566", guest_slug: "bima-hanafi", invited_count: 2, category: "Keluarga", code: "AVL-44729", created_at: ago(1) },
  ];
  return guests;
}

export function buildDemoRsvps(): GuestRsvp[] {
  return [
    { id: "r-01", guest_id: "g-01", status: "attending", attending_count: 1, meal_preference: "Prasmanan", answers: { "q-1": "Prasmanan", "q-2": "Ya" }, responded_at: ago(7, 19, 40) },
    { id: "r-02", guest_id: "g-02", status: "attending", attending_count: 1, meal_preference: "Nasi Kotak", answers: { "q-1": "Nasi Kotak", "q-2": "Tidak" }, responded_at: ago(6, 8, 15) },
    { id: "r-03", guest_id: "g-03", status: "attending", attending_count: 2, meal_preference: "Prasmanan", answers: { "q-1": "Prasmanan", "q-2": "Ya" }, responded_at: ago(5, 12, 0) },
    { id: "r-04", guest_id: "g-04", status: "not_attending", attending_count: 0, responded_at: ago(4, 9, 30) },
    { id: "r-05", guest_id: "g-05", status: "maybe", attending_count: 1, responded_at: ago(2, 21, 5) },
    { id: "r-06", guest_id: "g-06", status: "attending", attending_count: 3, responded_at: ago(30, 10, 0) },
    { id: "r-07", guest_id: "g-07", status: "pending", attending_count: 0 },
    { id: "r-08", guest_id: "g-08", status: "attending", attending_count: 1, responded_at: ago(0, 9, 55) },
    { id: "r-09", guest_id: "g-09", status: "pending", attending_count: 0 },
  ];
}

export function buildDemoMessages(): GuestMessage[] {
  return [
    { id: "msg-1", invitation_id: "inv-01", guest_id: "g-03", guest_name: "Andi Wijaya", message: "Barakallahu lakuma, semoga menjadi keluarga sakinah mawaddah warahmah. 🤲", status: "approved", is_featured: true, created_at: ago(6, 14, 20) },
    { id: "msg-2", invitation_id: "inv-01", guest_id: "g-01", guest_name: "Budi Santoso", message: "Selamat menempuh hidup baru! Sukses selalu.", status: "approved", is_featured: false, created_at: ago(5, 9, 10) },
    { id: "msg-3", invitation_id: "inv-01", guest_name: "Febriansyah", message: "Semoga berkah dan bahagia selalu.", status: "approved", is_featured: false, created_at: ago(4, 18, 45) },
    { id: "msg-4", invitation_id: "inv-01", guest_name: "Lia Oktaviani", message: "Akadnya jangan sampai telat deng dia ya 😄", status: "approved", is_featured: false, created_at: ago(2, 11, 0) },
    { id: "msg-5", invitation_id: "inv-01", guest_id: "g-05", guest_name: "Dewi Lestari", message: "InsyaAllah hadir. Selamat ya!", status: "approved", is_featured: false, created_at: ago(1, 20, 30) },
    { id: "msg-6", invitation_id: "inv-02", guest_id: "g-06", guest_name: "H. Zainal Abidin", message: "Alhamdulillah, selamat untuk keluarga. Semoga Rayyan tumbuh sehat dan saleh.", status: "approved", is_featured: true, created_at: ago(25, 8, 0) },
    { id: "msg-7", invitation_id: "inv-02", guest_name: "Ummi Hamidah", message: "MashaAllah tabarakallah bayinya lucu!", status: "approved", is_featured: false, created_at: ago(18, 15, 30) },
    { id: "msg-8", invitation_id: "inv-03", guest_name: "Unknown Guest", message: "Ulang tahun ke-7, kapan ditraktir nih?", status: "pending", is_featured: false, created_at: ago(0, 7, 12) },
  ];
}

export function buildDemoGifts(): GiftAccount[] {
  return [
    { id: "gft-1", invitation_id: "inv-01", type: "bank", bank_name: "BCA", account_number: "8830138145", account_name: "Ahmad Fadli R.", order_index: 1 },
    { id: "gft-2", invitation_id: "inv-01", type: "bank", bank_name: "BRI", account_number: "00270100774030", account_name: "Sarah Putri A.", order_index: 2 },
    { id: "gft-3", invitation_id: "inv-01", type: "bank", bank_name: "Mandiri", account_number: "1370012345678", account_name: "Ahmad Fadli R.", order_index: 3 },
    { id: "gft-4", invitation_id: "inv-01", type: "qris", provider: "QRIS", phone: "081234567890", order_index: 4 },
    { id: "gft-5", invitation_id: "inv-01", type: "ewallet", provider: "DANA", phone: "081234567890", order_index: 5 },
    { id: "gft-6", invitation_id: "inv-02", type: "bank", bank_name: "BSI", account_number: "7211556601", account_name: "Edward Hartono", order_index: 1 },
  ];
}

export function buildDemoTables(): SeatingTable[] {
  return Array.from({ length: 8 }, (_, i) => ({
    id: `tbl-${String(i + 1).padStart(2, "0")}`,
    invitation_id: "inv-01",
    table_name: `Meja ${String(i + 1).padStart(2, "0")}`,
    capacity: 10,
  }));
}

const DEVICES = ["mobile", "mobile", "desktop", "mobile", "tablet", "desktop", "mobile"];
const BROWSERS = ["Chrome", "Safari", "Chrome", "Chrome", "Safari", "Edge", "Chrome"];
const REFERRERS = ["", "https://t.me/", "", "", "https://instagram.com/", "", "https://wa.me/"];

function analyticsFor(invitation_id: string, count: number, spreadDays: number): AnalyticsEvent[] {
  const events: AnalyticsEvent[] = [];
  for (let i = 0; i < count; i++) {
    const day = Math.round(spreadDays * (i / Math.max(count - 1, 1)));
    events.push({
      id: `anl-${invitation_id}-${i + 1}`,
      invitation_id,
      event_type: "view",
      device: DEVICES[i % DEVICES.length],
      browser: BROWSERS[i % BROWSERS.length],
      referrer: REFERRERS[i % REFERRERS.length],
      visitor_hash: `vh-${(i * 7) % 13}`,
      occurred_at: ago(day, 9 + (i % 10), (i * 17) % 60),
    });
  }
  return events;
}

export function buildDemoAnalytics(): AnalyticsEvent[] {
  const views = [
    ...analyticsFor("inv-01", 14, 35),
    ...analyticsFor("inv-02", 6, 30),
    ...analyticsFor("inv-03", 2, 1),
  ];
  const rsvp: AnalyticsEvent[] = [
    { id: "anl-rsvp-1", invitation_id: "inv-01", event_type: "rsvp", device: "mobile", browser: "Chrome", visitor_hash: "vh-1", occurred_at: ago(7, 19, 40) },
    { id: "anl-rsvp-2", invitation_id: "inv-01", event_type: "rsvp", device: "mobile", browser: "Safari", visitor_hash: "vh-3", occurred_at: ago(6, 8, 15) },
    { id: "anl-rsvp-3", invitation_id: "inv-02", event_type: "rsvp", device: "mobile", browser: "Chrome", visitor_hash: "vh-0", occurred_at: ago(30, 10, 0) },
    { id: "anl-gb-1", invitation_id: "inv-01", event_type: "guestbook", device: "desktop", browser: "Chrome", visitor_hash: "vh-5", occurred_at: ago(6, 14, 20) },
  ];
  return [...views, ...rsvp];
}

export function buildDemoCheckins(): Checkin[] {
  return [
    { id: "ck-1", invitation_id: "inv-01", guest_id: "g-01", guest_code: "AVL-92832", checked_in_at: ago(0, 9, 2), checked_in_by: DEMO_OWNER },
    { id: "ck-2", invitation_id: "inv-01", guest_id: "g-02", guest_code: "AVL-30821", checked_in_at: ago(0, 9, 15), checked_in_by: DEMO_OWNER },
  ];
}

export { SAMPLE_IMG, slugify };
export type { InvitationContent };