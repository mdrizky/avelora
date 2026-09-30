import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Check,
  ChevronRight,
  Crown,
  Gift,
  Globe,
  Heart,
  LayoutTemplate,
  Lock,
  Mail,
  MapPin,
  MessageSquareHeart,
  Music,
  PhoneCall,
  Play,
  QrCode,
  Send,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Timer,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/logo";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { CountUp } from "@/components/marketing/count-up";
import { InvitePreview } from "@/components/invite-preview";
import { getSessionUser } from "@/lib/auth/session";
import {
  listCategories,
  listPlans,
  listPublishedTestimonials,
  listTemplates,
} from "@/lib/db";
import { getData } from "@/lib/db/store";
import { fmtIdr, safeTheme, timeAgo } from "@/lib/theme";

/* ------------------------------- util kecil ------------------------------- */

function featureLabel(k: string): string {
  const map: Record<string, string> = {
    invitations: "Jumlah undangan aktif",
    guests: "Batas tamu per acara",
    templates: "Akses template",
    analytics: "Analitik pengunjung real-time",
    watermark: "Watermark AVELORA",
    remove_branding: "Hapus branding AVELORA",
    custom_url: "URL khusus / domain sendiri",
    music: "Musik orisinal berlisensi",
    qr_checkin: "QR check-in di lokasi",
    seating: "Pengaturan meja tamu",
    white_label: "White label untuk agensi",
  };
  return map[k] ?? k.replace(/[-_]/g, " ");
}

function featureValue(v: unknown, k: string): string {
  if (v === false) return "";
  if (v === true) return "Termasuk";
  if (typeof v === "number") return v.toLocaleString("id-ID");
  if (k === "templates") return v === "all" ? "Semua template" : "Template gratis";
  if (v === "unlimited") return "Tak terbatas";
  return String(v);
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Susun dua daftar berselang-seling lalu potong maksimal `total`. */
function interleave<T>(a: T[], b: T[], total: number): T[] {
  const out: T[] = [];
  for (let i = 0; i < Math.max(a.length, b.length) && out.length < total; i++) {
    if (i < a.length) out.push(a[i]);
    if (out.length < total && i < b.length) out.push(b[i]);
  }
  return out;
}

/* --------------------------------- section -------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  desc,
  tone = "light",
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "center" | "left";
}) {
  const dark = tone === "dark";
  return (
    <div
      data-reveal
      className={[
        "max-w-2xl",
        align === "center" ? "mx-auto text-center" : "",
      ].join(" ")}
    >
      <p
        className={`text-[11px] font-extrabold uppercase tracking-[0.32em] ${
          dark ? "text-gold-400" : "text-gold-600"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-balance text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-[2.75rem] ${
          dark ? "text-white" : "text-ink-900"
        }`}
      >
        {title}
      </h2>
      {desc && (
        <p
          className={`mt-4 text-pretty text-[15px] leading-relaxed sm:text-base ${
            dark ? "text-ink-300" : "text-ink-500"
          }`}
        >
          {desc}
        </p>
      )}
      <div
        className={`animate-draw-line mt-6 h-px w-20 ${align === "center" ? "mx-auto" : "mx-0"}`}
        style={{
          background: "linear-gradient(90deg, transparent, #C9A95E, transparent)",
        }}
      />
    </div>
  );
}

/* ================================== PAGE ================================== */

export default async function Home() {
  const [user, categories, freeTemplates, premiumTemplates, plans, store] = await Promise.all([
    getSessionUser(),
    listCategories(),
    listTemplates({ premium: false }),
    listTemplates({ premium: true }),
    listPlans(),
    getData(),
  ]);

  const allTemplates = [...freeTemplates, ...premiumTemplates];
  // Selipkan gratis & premium bergantian supaya keduanya tampil di grid.
  const featured = interleave(freeTemplates, premiumTemplates, 8);
  const heroTemplate = safeTheme(allTemplates[0]?.theme_config);
  const testimonials = listPublishedTestimonials(6);
  const faqs = store.faqs.filter((f) => f.is_active).slice(0, 8);
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Undangan";

  /* angka nyata dari database */
  const publishedInvitations = store.invitations.filter((i) => i.status === "published").length;
  const totalGuests = store.guests.length;
  const totalRsvps = store.guest_rsvps.filter((r) => r.status === "attending").length;
  const avgRating =
    testimonials.length > 0
      ? Math.round(
          (testimonials.reduce((n, t) => n + t.rating, 0) / testimonials.length) * 10,
        ) / 10
      : 5;

  const startHref = user
    ? "/dashboard/invitations/new"
    : "/register?next=%2Fdashboard%2Finvitations%2Fnew";
  const shareHref = user ? "/dashboard/invitations" : "/register";
  const kesanHref = user
    ? "/dashboard/testimoni"
    : "/login?next=%2Fdashboard%2Ftestimoni";

  const steps = [
    {
      icon: LayoutTemplate,
      title: "Pilih template",
      desc: "Galeri dikurasi per jenis acara — pernikahan, aqiqah, ulang tahun, wisuda, tunangan, hingga acara kantor.",
    },
    {
      icon: Sparkles,
      title: "Sunting isi",
      desc: "Ganti nama, tanggal, lokasi, galeri, dan kado. Semua berubah langsung dengan live preview di layar yang sama.",
    },
    {
      icon: Users,
      title: "Undang tamu",
      desc: "Impor daftar tamu sekaligus. AVELORA membuat link personal per orang sehingga nama mereka tampil otomatis.",
    },
    {
      icon: Share2,
      title: "Bagikan 1 klik",
      desc: "Kirim ke WhatsApp, salin tautan, atau cetak QR. Tidak ada yang perlu diunduh atau diinstal tamu.",
    },
    {
      icon: CalendarCheck,
      title: "Kelola RSVP",
      desc: "Pantau siapa hadir, berapa orang, menu pilihan, dan ucapan yang masuk, semuanya secara langsung.",
    },
    {
      icon: QrCode,
      title: "Check-in di lokasi",
      desc: "Tamu scan QR unik miliknya, dan kamu langsung melihat siapa yang sudah hadir selama acara berlangsung.",
    },
  ];

  const features: { icon: LucideIcon; title: string; desc: string; span: string }[] = [
    {
      icon: Users,
      title: "Undangan personal",
      desc: "Setiap tamu mendapat sapaan dengan namanya sendiri, bukan satu link massal yang terasa dingin.",
      span: "lg:col-span-2",
    },
    {
      icon: CalendarCheck,
      title: "RSVP & rekap real-time",
      desc: "Konfirmasi kehadiran, jumlah orang, menu, hingga catatan tamu terkumpul rapi.",
      span: "",
    },
    {
      icon: MessageSquareHeart,
      title: "Buku tamu digital",
      desc: "Ucapan tamu tampil di undangan dengan moderasi opsional.",
      span: "",
    },
    {
      icon: QrCode,
      title: "QR check-in",
      desc: "Kode unik per tamu. Registrasi cepat tanpa antre.",
      span: "",
    },
    {
      icon: Gift,
      title: "Kado digital",
      desc: "Rekening bank, QRIS, dan e-wallet dalam satu halaman.",
      span: "",
    },
    {
      icon: BarChart3,
      title: "Analitik lengkap",
      desc: "Pengunjung, perangkat, browser, dan konversi RSVP.",
      span: "",
    },
    {
      icon: Music,
      title: "Musik orisinal",
      desc: "Lagu berlisensi AVELORA, atau pakai mp3 milikmu sendiri.",
      span: "",
    },
    {
      icon: Timer,
      title: "Hitung mundur acara",
      desc: "Hitung mundur yang membuat tamu ikut menunggu hari besar.",
      span: "",
    },
    {
      icon: Globe,
      title: "Tampilan multi-bahasa",
      desc: "Tamu bisa berpindah bahasa tanpa kehilangan isi undangan.",
      span: "lg:col-span-2",
    },
  ];

  const guarantees = [
    { icon: Lock, title: "Data aman", desc: "Enkripsi session & password hash." },
    { icon: ShieldCheck, title: "Tanpa spam", desc: "Tidak ada iklan yang menyela tamu." },
    { icon: Smartphone, title: "Cepat di HP", desc: "Ringan dibuka di jaringan seluler." },
    { icon: Wallet, title: "Bayar sesuai pakai", desc: "Naik paket kapan saja." },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-ivory-50">
      <MarketingNav
        isLoggedIn={Boolean(user)}
        avatarInitials={user ? initials(user.first_name + " " + (user.last_name ?? "")) : undefined}
      />

      {/* =========================== 1. HERO =========================== */}
      <section className="grain relative isolate overflow-hidden bg-night-950 text-white">
        {/* latar berlapis */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_-10%,rgba(176,141,66,0.32),transparent_60%)]" />
          <div className="absolute -left-32 top-24 h-[26rem] w-[26rem] animate-float-slow rounded-full bg-wine-800/40 blur-[100px]" />
          <div className="absolute -right-24 top-10 h-[24rem] w-[24rem] animate-float-slow rounded-full bg-gold-600/25 blur-[110px] [animation-delay:2.5s]" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sage-500/10 blur-[100px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(14,17,26,0.9))]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-28 lg:pt-20">
          {/* --- kolom teks --- */}
          <div>
            <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-gold-400/35 bg-gold-400/10 px-4 py-1.5 text-[12px] font-semibold text-gold-300">
              <Sparkles size={13} className="animate-pulse-soft" />
              Platform undangan digital &amp; event experience
            </span>

            <h1
              className="animate-fade-up mt-6 text-balance text-[2.6rem] font-extrabold leading-[1.04] tracking-[-0.02em] sm:text-6xl lg:text-[4.2rem] [animation-delay:80ms]"
            >
              Satu acara,
              <br />
              satu pengalaman
              <br />
              <span className="font-script text-gradient-gold text-[1.35em] leading-[0.9]">
                yang jauh lebih indah.
              </span>
            </h1>

            <p className="animate-fade-up mt-7 max-w-xl text-pretty text-base leading-relaxed text-ink-300 sm:text-lg [animation-delay:160ms]">
              Buat undangan digital premium, kirim ke seluruh tamu lewat WhatsApp, dan kelola
              RSVP sampai QR check-in — semuanya dalam satu dashboard. Gratis untuk mulai, tanpa
              kartu kredit.
            </p>

            <div className="animate-fade-up mt-9 flex flex-col gap-3 sm:flex-row [animation-delay:240ms]">
              <Link
                href={startHref}
                className="btn btn-gold shine group !px-8 !py-4 !text-[15px]"
              >
                Buat Undangan Sekarang
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="#template"
                className="btn group !border !border-white/15 !bg-white/5 !px-8 !py-4 !text-[15px] !text-white backdrop-blur hover:!bg-white/12"
              >
                <Play size={16} className="fill-current" />
                Lihat Hasilnya
              </Link>
            </div>

            <ul className="animate-fade-up mt-9 flex flex-wrap gap-x-6 gap-y-2.5 text-[13px] text-ink-300 [animation-delay:320ms]">
              {[
                "Tanpa kartu kredit",
                "Siap dalam ±20 menit",
                `${allTemplates.length} template siap pakai`,
                "Bisa dibatalkan kapan saja",
              ].map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-sage-500/25 text-sage-300">
                    <Check size={10} strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* --- mockup telepon --- */}
          <div className="animate-fade-in relative mx-auto w-full max-w-[360px] [animation-delay:200ms]">
            {/* cincin orbit */}
            <div className="absolute -inset-10 -z-10">
              <div className="animate-spin-slow absolute inset-0 rounded-full border border-dashed border-gold-400/20" />
              <div className="absolute inset-8 rounded-full border border-white/5" />
            </div>

            <div className="gold-frame relative rounded-[2.75rem] bg-gradient-to-b from-gold-300/70 via-gold-500/40 to-transparent p-[3px]">
              <div className="relative overflow-hidden rounded-[2.6rem] bg-night-900 p-2.5">
                {/* notch */}
                <div className="absolute left-1/2 top-3 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-night-950" />
                <div className="relative overflow-hidden rounded-[2.05rem]">
                  <InvitePreview
                    className="!rounded-none"
                    theme={heroTemplate}
                    title="Daffa &amp; Salsa"
                    subtitle="The Wedding Of"
                    dateLabel="Sabtu, 12 Des 2026"
                  />
                  {/* mockup tombol bawah */}
                  <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-black/25 text-[10px] text-white backdrop-blur">
                      <Music size={12} />
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-black/25 text-[10px] text-white backdrop-blur">
                      <MapPin size={12} />
                    </span>
                    <span className="rounded-full bg-black/25 px-3 text-[9px] font-bold uppercase tracking-widest text-white backdrop-blur">
                      RSVP
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-black/25 text-[10px] text-white backdrop-blur">
                      <MessageSquareHeart size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* kartu mengambang */}
            <div className="animate-float-slow glass absolute -left-6 -top-6 rounded-2xl border border-white/60 px-4 py-3 text-ink-900 shadow-xl">
              <p className="flex items-center gap-1.5 text-xs font-extrabold">
                <CalendarCheck size={13} className="text-sage-500" /> 128 RSVP masuk
              </p>
              <p className="mt-0.5 text-[10px] text-ink-500">rekap real-time</p>
            </div>
            <div className="animate-float-slow glass absolute -right-7 bottom-24 rounded-2xl border border-white/60 px-4 py-3 text-ink-900 shadow-xl [animation-delay:1.8s]">
              <p className="flex items-center gap-1.5 text-xs font-extrabold">
                <QrCode size={13} className="text-gold-600" /> QR Check-in
              </p>
              <p className="mt-0.5 text-[10px] text-ink-500">tanpa antre</p>
            </div>
            <div className="animate-float-slow glass absolute -bottom-5 left-2 rounded-2xl border border-white/60 px-4 py-3 text-ink-900 shadow-xl [animation-delay:3.2s]">
              <p className="flex items-center gap-1.5 text-xs font-extrabold">
                <PhoneCall size={13} className="text-sage-500" /> Kirim via WhatsApp
              </p>
              <p className="mt-0.5 text-[10px] text-ink-500">1 klik ke semua tamu</p>
            </div>
          </div>
        </div>

        {/* marquee kategori */}
        <div className="relative border-y border-white/10 bg-white/[0.03] py-3.5">
          <div className="flex overflow-hidden">
            <div className="animate-marquee flex shrink-0 items-center gap-8 pr-8">
              {[...categories, ...categories].map((c, i) => (
                <Link
                  key={`${c.id}-${i}`}
                  href={`/templates?cat=${c.slug}`}
                  className="flex shrink-0 items-center gap-2 text-[13px] font-semibold text-ink-300 transition-colors hover:text-gold-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                  {c.name}
                </Link>
              ))}
            </div>
            <div className="animate-marquee flex shrink-0 items-center gap-8 pr-8" aria-hidden>
              {[...categories, ...categories].map((c, i) => (
                <span
                  key={`dup-${c.id}-${i}`}
                  className="flex shrink-0 items-center gap-2 text-[13px] font-semibold text-ink-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================= 2. ANGKA KEBERHASILAN ======================= */}
      <section className="border-b border-ink-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 sm:px-6 lg:grid-cols-5">
          {[
            { label: "Template siap pakai", value: allTemplates.length, icon: LayoutTemplate },
            { label: "Jenis acara", value: categories.length, icon: Sparkles },
            { label: "Undangan tayang", value: publishedInvitations, icon: Heart },
            { label: "Tamu terkelola", value: totalGuests, icon: Users },
            { label: "Konfirmasi hadir", value: totalRsvps, icon: CalendarCheck },
          ].map((s, i) => (
            <div
              key={s.label}
              data-reveal
              data-reveal-delay={i * 90}
              className="group relative px-2 py-9 text-center sm:py-11"
            >
              <s.icon
                size={18}
                className="mx-auto text-gold-500/60 transition-transform duration-500 group-hover:scale-110 group-hover:text-gold-600"
              />
              <p className="mt-3 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
                <CountUp value={s.value} />
              </p>
              <p className="mt-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================== 3. TEMPLATE ========================== */}
      <section id="template" className="relative overflow-hidden bg-night-950 py-24 text-white">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,rgba(176,141,66,0.2),transparent)]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              align="left"
              tone="dark"
              eyebrow="Kurasi admin"
              title={
                <>
                  Template yang <span className="font-script text-gradient-gold">berkata memikat</span>
                </>
              }
              desc="Setiap template punya palet, tipografi, dan tata letak yang sudah diuji di layar ponsel. Pilih satu, ubah isinya, tayang hari ini juga."
            />
            <Link
              href="/templates"
              className="btn btn-gold shine shrink-0 self-start lg:self-end"
            >
              Jelajahi {allTemplates.length} Template <ArrowRight size={15} />
            </Link>
          </div>

          {/* chip kategori */}
          <div data-reveal className="no-scrollbar mt-10 flex gap-2.5 overflow-x-auto pb-2">
            <Link
              href="/templates"
              className="shrink-0 rounded-full border border-gold-400 bg-gold-500 px-4 py-2 text-[13px] font-bold text-white"
            >
              Semua
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/templates?cat=${c.slug}`}
                className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-ink-300 transition-colors hover:border-gold-400 hover:text-gold-300"
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* grid template */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {featured.map((t, i) => (
              <Link
                key={t.id}
                href={`/templates/${t.slug}`}
                data-reveal
                data-reveal-delay={Math.min(i, 7) * 70}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-night-900 transition-all duration-500 hover:-translate-y-2 hover:border-gold-400/60"
              >
                <div className="relative overflow-hidden">
                  <div className="transition-transform duration-700 group-hover:scale-[1.06]">
                    <InvitePreview
                      theme={t.theme_config}
                      title={t.name}
                      subtitle={catName(t.category_id)}
                    />
                  </div>
                  {t.is_premium && (
                    <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-gold-300 to-gold-600 px-2.5 py-0.5 text-[10px] font-extrabold text-night-950">
                      <Crown size={10} /> PREMIUM
                    </span>
                  )}
                  <div className="absolute inset-0 grid place-items-center bg-night-950/75 opacity-0 backdrop-blur-[2px] transition-opacity duration-400 group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[12px] font-bold text-ink-900">
                      Lihat detail <ChevronRight size={13} />
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 px-3.5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-white">{t.name}</p>
                    <p className="truncate text-[11px] text-ink-400">
                      {catName(t.category_id)} ·{" "}
                      {t.is_premium ? fmtIdr(t.price) : "Gratis"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======================= 4. ALUR KERJA ======================= */}
      <section id="alur" className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(176,141,66,0.12),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Enam langkah sederhana"
            title="Dari ide sampai tamu hadir, tanpa ribet"
            desc="Tidak perlu paham desain, tidak perlu aplikasi tambahan. Ikuti alurnya dan undanganmu selesai sebelum kopi dingin."
          />

          <div className="relative mt-16">
            {/* garis penghubung (desktop) */}
            <div className="absolute left-0 right-0 top-[38px] hidden h-px lg:block">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-ink-200 to-transparent" />
            </div>

            <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  data-reveal
                  data-reveal-delay={(i % 3) * 110}
                  className="group relative flex gap-5"
                >
                  <div className="relative shrink-0">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl border border-ink-100 bg-white text-gold-600 shadow-[0_14px_34px_-20px_rgba(22,18,14,0.6)] transition-all duration-500 group-hover:-translate-y-1 group-hover:border-gold-400 group-hover:bg-gradient-to-br group-hover:from-gold-400 group-hover:to-gold-600 group-hover:text-white">
                      <s.icon size={24} />
                    </div>
                    <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-ink-900 font-serif text-[11px] font-bold text-gold-300">
                      {i + 1}
                    </span>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-lg font-extrabold text-ink-900">{s.title}</h3>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-ink-500">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ========================= 5. FITUR ========================= */}
      <section id="fitur" className="bg-ivory-100/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Semua yang kamu butuhkan"
            title={
              <>
                Bukan sekadar <span className="font-script text-gold-600">undangan</span> — ini
                EXPERIENCE
              </>
            }
            desc="Setiap fitur dirancang untuk satu tujuan: membuat hari besar terasa lebih tenang bagi kamu dan lebih berkesan bagi tamu."
          />

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                data-reveal
                data-reveal-delay={Math.min(i, 8) * 55}
                className={`hover-lift card-subtle group relative overflow-hidden rounded-2xl border border-ink-100 bg-white p-6 ${
                  f.span ?? ""
                }`}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gold-300/0 blur-2xl transition-all duration-500 group-hover:bg-gold-300/40" />
                <span className="relative grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-ivory-200 to-ivory-100 text-gold-600 transition-colors group-hover:from-gold-400 group-hover:to-gold-600 group-hover:text-white">
                  <f.icon size={20} />
                </span>
                <h3 className="relative mt-4 text-[15px] font-extrabold text-ink-900">{f.title}</h3>
                <p className="relative mt-1.5 text-[13.5px] leading-relaxed text-ink-500">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 6. BAGIKAN VIA WHATSAPP ===================== */}
      <section className="relative overflow-hidden py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-ink-100 bg-gradient-to-br from-white via-ivory-50 to-ivory-100 p-8 sm:p-12 lg:p-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-16 h-72 w-72 rounded-full bg-sage-300/25 blur-3xl" />

            <div className="relative grid items-center gap-12 lg:grid-cols-2">
              <div data-reveal="left">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.32em] text-gold-600">
                  Cara berbagi
                </p>
                <h2 className="mt-3 text-balance text-3xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-4xl">
                  Satu klik, langsung ke WhatsApp tamu
                </h2>
                <p className="mt-4 max-w-lg text-pretty leading-relaxed text-ink-500">
                  AVELORA membuat tautan personal untuk setiap tamu. Daftar nama kamu sudah
                  terisi, tinggal pilih penerimanya — nama dan pesan otomatis ikut terisi, tinggal
                  tekan kirim. QR-nya juga bisa dicetak untuk ditempel di meja.
                </p>

                <ul className="mt-8 space-y-3.5">
                  {[
                    {
                      icon: PhoneCall,
                      title: "Kirim massal per kategori",
                      desc: "Pilih penerima dari daftar tamu, atau kirim ke semuanya sekaligus.",
                    },
                    {
                      icon: Send,
                      title: "Teks pesan sudah disiapkan",
                      desc: "Nama tamu dan tautan undangan terisi otomatis di kolom chat.",
                    },
                    {
                      icon: QrCode,
                      title: "QR yang benar-benar bisa discan",
                      desc: "Unduh PNG resolusi tinggi atau cetak langsung untuk meja tamu.",
                    },
                  ].map((f) => (
                    <li key={f.title} className="flex gap-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-ink-100 bg-white text-gold-600 shadow-sm">
                        <f.icon size={18} />
                      </span>
                      <div>
                        <p className="text-[15px] font-bold text-ink-900">{f.title}</p>
                        <p className="mt-0.5 text-[13.5px] text-ink-500">{f.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>

                <Link href={shareHref} className="btn btn-primary shine group mt-9 !px-7 !py-3.5">
                  Coba Sekarang
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* mockup chat WhatsApp */}
              <div data-reveal="right" className="relative">
                <div className="mx-auto max-w-sm overflow-hidden rounded-[2rem] border-[7px] border-ink-900 bg-white shadow-2xl">
                  <div className="flex items-center gap-3 bg-[#075E54] px-4 py-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white">
                      <Users size={16} />
                    </span>
                    <div>
                      <p className="text-[13px] font-bold text-white">Daffa &amp; Salsa</p>
                      <p className="text-[10px] text-white/70">Undangan ⋅ 128 tamu</p>
                    </div>
                  </div>
                  <div className="space-y-2.5 bg-[#ECE5DD] p-4">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-800 shadow-sm">
                      Halo Kak <strong>Andi Wijaya</strong> 👋
                      <br />
                      Undangan kami sudah siap. Silakan Buka.
                      <br />
                      <span className="mt-1.5 block rounded-lg border border-dashed border-gold-400 bg-ivory-100 px-2 py-1.5 text-center text-[11px] font-bold text-gold-700">
                        avlora.id/i/dan-salsa
                      </span>
                      <span className="mt-1 block text-right text-[9px] text-ink-400">10:02 ✓✓</span>
                    </div>
                    <div className="ml-auto max-w-[60%] rounded-2xl rounded-tr-sm bg-[#DCF8C6] px-3.5 py-2.5 text-[12.5px] text-ink-800 shadow-sm">
                      InsyaAllah hadir! 🤍
                      <span className="mt-1 block text-right text-[9px] text-ink-400">10:05 ✓✓</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 shadow-sm">
                      <span className="h-2 w-2 animate-pulse-soft rounded-full bg-sage-500" />
                      <span className="text-[11.5px] text-ink-500">Mengetik…</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-t border-ink-100 bg-white px-3 py-2.5">
                    <span className="flex-1 rounded-full bg-ivory-100 px-3 py-2 text-[11.5px] text-ink-400">
                      Tulis pesan…
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#075E54] text-white">
                      <Send size={14} />
                    </span>
                  </div>
                </div>

                <div className="glass animate-float-slow absolute -bottom-6 -left-4 rounded-2xl border border-white/70 px-4 py-3 shadow-xl">
                  <p className="text-[11px] font-extrabold text-ink-900">118 terkirim</p>
                  <p className="text-[10px] text-ink-500">dari 128 tamu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= 7. HARGA ========================= */}
      <section id="harga" className="bg-ivory-100/50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Harga transparan"
            title="Mulai gratis, naikkan paket kapan saja"
            desc="Tidak ada biaya tersembunyi. Pindah paket kapan pun, dan seluruh data acara tetap utuh."
          />

          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((p, i) => {
              const feats = (Object.entries(p.features) as [string, unknown][])
                .map(([k, v]) => ({ k, label: featureLabel(k), text: featureValue(v, k) }))
                .filter((f) => f.text !== "")
                .slice(0, 6);
              const popular = p.name === "premium";
              return (
                <div
                  key={p.id}
                  data-reveal
                  data-reveal-delay={i * 90}
                  className={`hover-lift relative flex flex-col rounded-2xl border bg-white p-7 ${
                    popular
                      ? "border-gold-400 shadow-[0_28px_60px_-30px_rgba(176,141,66,0.7)] ring-4 ring-gold-400/12"
                      : "border-ink-100 card-subtle"
                  }`}
                >
                  {popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white">
                      Paling laris
                    </span>
                  )}
                  <h3 className="text-lg font-extrabold text-ink-900">{p.display_name}</h3>
                  <div className="mt-3 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold tracking-tight text-ink-900">
                      {p.price === 0 ? "Gratis" : fmtIdr(p.price)}
                    </span>
                    {p.price > 0 && (
                      <span className="text-sm font-medium text-ink-400">/{p.period}</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-[13px] text-ink-400">
                    {p.price === 0
                      ? "Selamanya, tanpa kartu kredit."
                      : "Bisa berhenti kapan saja."}
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {feats.map((f) => (
                      <li key={f.k} className="flex items-start gap-2 text-[13px] text-ink-600">
                        <span
                          className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                            popular ? "bg-gold-100 text-gold-700" : "bg-sage-100 text-sage-700"
                          }`}
                        >
                          <Check size={10} strokeWidth={3} />
                        </span>
                        <span>
                          <span className="text-ink-500">{f.label}: </span>
                          <span className="font-bold text-ink-800">{f.text}</span>
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={user ? "/dashboard/billing" : `/register?next=%2Fdashboard%2Fbilling`}
                    className={`btn mt-7 w-full ${
                      popular
                        ? "btn-gold shine"
                        : p.price === 0
                          ? "btn-outline"
                          : "btn-primary"
                    }`}
                  >
                    {p.price === 0 ? "Mulai Gratis" : `Pilih ${p.display_name}`}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-ink-500">
            {guarantees.map((g) => (
              <span key={g.title} className="inline-flex items-center gap-1.5">
                <g.icon size={14} className="text-sage-500" /> {g.title}
              </span>
            ))}
            <Link href="/#fitur" className="font-semibold text-gold-600 hover:underline">
              Bandingkan semua fitur →
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== 8. CERITA TAMU (TESTIMONI) ===================== */}
      <section id="cerita" className="relative overflow-hidden py-24">
        <div className="pointer-events-none absolute inset-x-0 top-10 -z-10 h-80 bg-[radial-gradient(50%_100%_at_50%_0%,rgba(125,102,128,0.1),transparent)]" />
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <SectionHeading
              align="left"
              eyebrow="Dari pengguna asli"
              title={
                <>
                  Cerita dari mereka yang{" "}
                  <span className="font-script text-gold-600">sudah merayakan</span>
                </>
              }
              desc="Setiap pesan di bawah ini dikirim langsung dari dashboard pengguna, lalu diverifikasi admin sebelum tayang. Tidak ada testimoni karangan."
            />
            <div data-reveal className="flex flex-wrap items-center gap-3 lg:justify-end">
              <div className="flex items-center gap-2 rounded-2xl border border-ink-100 bg-white px-4 py-3">
                <span className="flex gap-0.5 text-gold-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" strokeWidth={0} />
                  ))}
                </span>
                <span className="text-sm font-extrabold text-ink-900">{avgRating}</span>
                <span className="text-[12px] text-ink-400">/ 5.0</span>
              </div>
              <Link href={kesanHref} className="btn btn-gold shine group">
                Kirim Ceritamu
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {testimonials.length === 0 ? (
            <div className="mt-12 rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
              <MessageSquareHeart size={34} className="mx-auto text-ink-300" />
              <p className="mt-4 font-bold text-ink-900">Belum ada cerita yang tayang</p>
              <p className="mt-1 text-sm text-ink-500">
                Jadilah yang pertama — kirim pesanmu dari dashboard.
              </p>
              <Link href={kesanHref} className="btn btn-gold mt-6">
                Kirim Pesan Pertama
              </Link>
            </div>
          ) : (
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <figure
                  key={t.id}
                  data-reveal
                  data-reveal-delay={Math.min(i, 5) * 90}
                  className="hover-lift card-subtle group relative flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white p-6"
                >
                  <MessageSquareHeart
                    size={44}
                    className="absolute -right-2 -top-2 rotate-12 text-ivory-200 transition-colors group-hover:text-gold-200"
                  />
                  <div className="relative flex gap-0.5 text-gold-500">
                    {Array.from({ length: t.rating }).map((_, n) => (
                      <Star key={n} size={15} fill="currentColor" strokeWidth={0} />
                    ))}
                  </div>
                  <blockquote className="relative mt-4 flex-1 text-[14.5px] leading-relaxed text-ink-700">
                    “{t.content}”
                  </blockquote>
                  {t.event_title && (
                    <p className="relative mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-ivory-100 px-3 py-1 text-[11px] font-semibold text-ink-600">
                      <Sparkles size={11} className="text-gold-500" /> {t.event_title}
                    </p>
                  )}
                  <figcaption className="relative mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-[12px] font-extrabold text-white">
                      {initials(t.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink-900">{t.name}</p>
                      <p className="truncate text-[12px] text-ink-400">
                        {t.role}
                        {t.created_at ? ` · ${timeAgo(t.created_at)}` : ""}
                      </p>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          {/* ajakan kirim pesan */}
          <div
            data-reveal
            className="mt-10 flex flex-col items-center justify-between gap-5 rounded-2xl border border-dashed border-gold-400/50 bg-gradient-to-r from-ivory-100 to-white p-7 sm:flex-row"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white">
                <Mail size={20} />
              </span>
              <div>
                <p className="text-[15px] font-extrabold text-ink-900">
                  Sudah merayakan dengan AVELORA?
                </p>
                <p className="mt-0.5 text-[13.5px] text-ink-500">
                  Tulis pengalamanmu, admin akan membacanya dan memverifikasi sebelum tayang.
                </p>
              </div>
            </div>
            <Link href={kesanHref} className="btn btn-gold shine shrink-0">
              Tulis Pesanmu <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================= 9. FAQ ========================= */}
      <section id="faq" className="bg-ivory-100/50 py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Pertanyaan umum"
            title="Masih ada yang mengganjal?"
            desc="Kalau jawabanmu tidak ada di sini, tim kami siap membantu lewat email."
          />
          <div className="mt-12 space-y-3">
            {faqs.map((f, i) => (
              <details
                key={f.id}
                data-reveal
                data-reveal-delay={Math.min(i, 7) * 55}
                className="group card-subtle overflow-hidden rounded-2xl border border-ink-100 bg-white transition-colors open:border-gold-300"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[15px] font-bold text-ink-900 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start gap-3">
                    <span className="mt-0.5 font-serif text-lg text-gold-500">Q</span>
                    {f.question}
                  </span>
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-ink-200 text-ink-500 transition-all duration-300 group-open:rotate-45 group-open:border-gold-400 group-open:bg-gold-500 group-open:text-white">
                    <span className="text-base leading-none">+</span>
                  </span>
                </summary>
                <div className="px-5 pb-5 pl-[3.25rem] text-[14px] leading-relaxed text-ink-500">
                  {f.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== 10. PENUTUP + CTA ===================== */}
      <section className="relative overflow-hidden bg-night-950 py-24 text-white">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(176,141,66,0.28),transparent)]" />
          <div className="animate-float-slow absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-wine-800/30 blur-[100px]" />
          <div className="animate-float-slow absolute -right-16 top-10 h-80 w-80 rounded-full bg-gold-600/20 blur-[100px] [animation-delay:2s]" />
        </div>

        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <span
            data-reveal
            className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-[12px] font-semibold text-gold-300"
          >
            <Sparkles size={13} /> Hari besarmu tidak perlu dimulai dengan stres
          </span>

          <h2
            data-reveal
            data-reveal-delay={80}
            className="mt-7 text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]"
          >
            Buat undangan yang bikin tamu{" "}
            <span className="font-script text-gradient-gold">takut lewat</span>
          </h2>

          <p
            data-reveal
            data-reveal-delay={150}
            className="mx-auto mt-6 max-w-2xl text-pretty text-[15px] leading-relaxed text-ink-300 sm:text-[17px]"
          >
            Ribuan keluarga dan organizer sudah memulai dari akun gratis. Kamu tidak perlu
            desainer mahal, tidak perlu aplikasi yang rumit, dan tidak perlu menunggu
            berbulan-bulan untuk mencetak undangan. Pilih satu template, isi detail acaramu, lalu
            bagikan ke seluruh tamu hari ini juga. Kalau ada yang ingin disesuaikan — warna,
            urutan acara, kado, bahkan cara membagikannya — semua bisa kamu ubat sendiri tanpa
            menunggu bantuan siapa pun.
          </p>

          <div
            data-reveal
            data-reveal-delay={220}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link href={startHref} className="btn btn-gold shine group !px-9 !py-4 !text-[15px]">
              {user ? "Buat Undangan Baru" : "Mulai Gratis Sekarang"}
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/templates"
              className="btn !border !border-white/15 !bg-white/5 !px-9 !py-4 !text-[15px] !text-white backdrop-blur hover:!bg-white/12"
            >
              Lihat Template
            </Link>
          </div>

          <p className="mt-6 text-[12.5px] text-ink-400">
            Gratis selamanya untuk 3 undangan ⋅ tanpa kartu kredit ⋅ bisa berhenti kapan saja
          </p>

          <div className="mt-16 grid gap-4 border-t border-white/10 pt-12 sm:grid-cols-3">
            {[
              {
                stat: "20 menit",
                label: "Rata-rata waktu untuk membuat undangan pertama",
              },
              { stat: "1 klik", label: "Untuk mengirim ke seluruh daftar tamu" },
              { stat: "0%", label: "Biaya tersembunyi di paket gratis" },
            ].map((s, i) => (
              <div key={s.stat} data-reveal data-reveal-delay={i * 100} className="text-center">
                <p className="text-3xl font-extrabold text-gradient-cream">{s.stat}</p>
                <p className="mx-auto mt-2 max-w-[16rem] text-[13px] leading-relaxed text-ink-400">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= 11. FOOTER ========================= */}
      <footer className="border-t border-ink-100 bg-ivory-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <div>
              <Logo />
              <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-ink-500">
                AVELORA adalah platform undangan digital dan event experience untuk pernikahan,
                aqiqah, ulang tahun, wisuda, tunangan, dan acara perusahaan. Buat Beautifully.
                Invite effortlessly. Celebrate together.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-500">
                  <Music size={12} className="text-gold-500" /> Musik berlisensi
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-500">
                  <ShieldCheck size={12} className="text-sage-500" /> Data terlindungi
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-500">
                  <Smartphone size={12} className="text-gold-500" /> 100% mobile friendly
                </span>
              </div>
            </div>

            {[
              {
                title: "Produk",
                links: [
                  ["Semua template", "/templates"],
                  ["Harga paket", "/#harga"],
                  ["Fitur lengkap", "/#fitur"],
                  ["Cara kerja", "/#alur"],
                ],
              },
              {
                title: "Akun",
                links: [
                  ["Masuk", "/login"],
                  ["Daftar", "/register"],
                  ["Lupa sandi", "/forgot-password"],
                  ["Dashboard", "/dashboard"],
                ],
              },
              {
                title: "Cerita",
                links: [
                  ["Cerita tamu", "/#cerita"],
                  ["Kirim pesanmu", "/dashboard/testimoni"],
                  ["Pertanyaan umum", "/#faq"],
                  ["Hubungi kami", "mailto:halo@avelora.id"],
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="text-[13px] font-extrabold uppercase tracking-[0.16em] text-ink-900">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5 text-[13.5px] text-ink-500">
                  {col.links.map(([label, href]) => (
                    <li key={label}>
                      {href.startsWith("mailto:") ? (
                        <a
                          href={href}
                          className="group inline-flex items-center gap-1 hover:text-gold-600"
                        >
                          {label}
                          <ChevronRight
                            size={12}
                            className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                          />
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="group inline-flex items-center gap-1 hover:text-gold-600"
                        >
                          {label}
                          <ChevronRight
                            size={12}
                            className="opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                          />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-7 sm:flex-row">
            <p className="text-[12.5px] text-ink-400">
              © {new Date().getFullYear()} AVELORA. Seluruh hak cipta dilindungi.
            </p>
            <div className="flex items-center gap-5 text-[12.5px] text-ink-400">
              <Link href="/#harga" className="hover:text-gold-600">Rincian harga</Link>
              <Link href="/#faq" className="hover:text-gold-600">Bantuan</Link>
              <a href="mailto:halo@avelora.id" className="hover:text-gold-600">
                halo@avelora.id
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
