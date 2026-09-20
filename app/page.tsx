import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Check,
  Gift,
  Heart,
  MapPin,
  Menu,
  MessageSquareHeart,
  Music,
  QrCode,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { listCategories, listTemplates, listPlans } from "@/lib/db";
import { getData } from "@/lib/db/store";
import { getSessionUser } from "@/lib/auth/session";
import type { ThemeConfig } from "@/lib/db/types";

const FONT_CLASS: Record<ThemeConfig["font"], string> = {
  serif: "font-serif",
  sans: "font-sans",
  script: "font-script",
};

function fmtPrice(n: number) {
  return n === 0 ? "Rp0" : `Rp${(n / 1000).toLocaleString("id-ID")}rb`;
}

function MiniInvite({ theme }: { theme: ThemeConfig }) {
  const pal = theme.palette;
  return (
    <div
      className="inv-cover w-full overflow-hidden"
      style={{
        ["--inv-cover-bg" as string]: pal.background,
        ["--inv-cover-fg" as string]: pal.foreground,
      }}
    >
      <div
        className="flex min-h-[430px] flex-col items-center justify-center gap-3 px-6 text-center"
        style={{ background: pal.background, color: pal.foreground }}
      >
        <span className="text-[11px] tracking-[0.35em] uppercase opacity-70" style={{ color: pal.muted }}>
          The Wedding of
        </span>
        <h3 className={`${FONT_CLASS[theme.font]} text-4xl leading-tight`} style={{ color: pal.primary }}>
          Ahmad &amp; Sarah
        </h3>
        <div className="my-1 flex items-center gap-2 text-[11px] uppercase tracking-widest" style={{ color: pal.foreground }}>
          <MapPin size={12} /> Sabtu, 12 Des 2026
        </div>
        <div className="grid grid-cols-4 gap-2">
          {["120", "08", "45", "22"].map((v, i) => (
            <div
              key={i}
              className="w-12 rounded-lg border px-1 py-2 text-center"
              style={{ borderColor: pal.soft, opacity: 0.85 }}
            >
              <div className={`${FONT_CLASS[theme.font]} text-xl`} style={{ color: pal.foreground }}>
                {v}
              </div>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: pal.muted }}>
                {["hr", "mn", "dt", "tk"][i]}
              </div>
            </div>
          ))}
        </div>
        <div
          className="mt-2 rounded-full px-5 py-2 text-xs font-semibold"
          style={{ background: pal.primary, color: pal.background === "#171310" ? "#fff" : "#fff" }}
        >
          Buka Undangan
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ t }: { t: { id: string; name: string; category_id: string; is_premium: boolean; theme_config: ThemeConfig } }) {
  const pal = t.theme_config.palette;
  const cat = listCategories().find((c) => c.id === t.category_id);
  return (
    <Link
      href={`/templates?cat=${cat?.slug ?? ""}`}
      className="card-subtle group overflow-hidden rounded-2xl border border-ink-100 bg-white transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[3/4] w-full" style={{ background: pal.background }}>
        <div
          className="absolute inset-x-0 top-0 flex h-full flex-col items-center justify-center gap-2 px-4 text-center"
          style={{ color: pal.foreground }}
        >
          <span className={`${FONT_CLASS[t.theme_config.font]} text-3xl`} style={{ color: pal.primary }}>
            {t.name}
          </span>
          <span className="text-[11px] uppercase tracking-[0.3em]" style={{ color: pal.muted }}>
            {cat?.name ?? "Undangan"}
          </span>
          <span className="mt-3 h-10 w-10 rounded-full border" style={{ borderColor: pal.soft }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-ink-900">{t.name}</p>
          <p className="text-xs text-ink-500">{cat?.tagline ?? ""}</p>
        </div>
        {t.is_premium && (
          <span className="rounded-full bg-gold-100 px-2.5 py-0.5 text-[11px] font-bold text-gold-700">
            PREMIUM
          </span>
        )}
      </div>
    </Link>
  );
}

export default async function Home() {
  const [user, categories, templates, plans, store] = await Promise.all([
    getSessionUser(),
    listCategories(),
    listTemplates({ premium: false }),
    listPlans(),
    getData(),
  ]);
  const featured = [...templates, ...listTemplates({ premium: true })].slice(0, 4);
  const testimonials = store.testimonials.filter((t) => t.is_active).slice(0, 3);
  const faqs = store.faqs.filter((f) => f.is_active).slice(0, 6);

  const steps = [
    { icon: Sparkles, title: "Create", desc: "Pilih acara & template premium dari pustaka yang dikurasi admin." },
    { icon: Heart, title: "Personalize", desc: "Sunting konten dengan live preview — hasil langsung terlihat." },
    { icon: Users, title: "Invite", desc: "Bagikan link personal; nama tamu muncul otomatis di undangan." },
    { icon: CalendarCheck, title: "RSVP", desc: "Tamu konfirmasi kehadiran, menu, dan pesan dalam satu klik." },
    { icon: QrCode, title: "Check-in", desc: "Kode QR unik untuk registrasi tamu di lokasi (Premium+)." },
    { icon: Sparkles, title: "Celebrate & Remember", desc: "Album otomatis dan memori acara untuk dikenang selamanya." },
  ];

  const features = [
    { icon: Users, title: "Undangan Personal", desc: "Setiap tamu disapa dengan namanya sendiri lewat link personal." },
    { icon: CalendarCheck, title: "RSVP Otomatis", desc: "Rekap kehadiran, jumlah orang, hingga preferensi menu." },
    { icon: MessageSquareHeart, title: "Buku Tamu Digital", desc: "Ucapan tampil langsung dengan moderasi opsional." },
    { icon: QrCode, title: "QR Check-in", desc: "Registrasi tamu cepat & rapi berbekal kode unik AVL-XXXXX." },
    { icon: Gift, title: "Kado Digital", desc: "Rekening bank, QRIS, dan e-wallet dalam satu halaman." },
    { icon: BarChart3, title: "Analitik Lengkap", desc: "Pengunjung, perangkat, browser, hingga konversi RSVP." },
  ];

  return (
    <main className="min-h-screen">
      {/* ------------------------------- Navbar ------------------------------ */}
      <header className="sticky top-0 z-50 border-b border-ink-100/80 bg-ivory-50/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-ink-700 md:flex">
            <a href="#fitur" className="transition-colors hover:text-ink-900">Fitur</a>
            <a href="#template" className="transition-colors hover:text-ink-900">Template</a>
            <a href="#harga" className="transition-colors hover:text-ink-900">Harga</a>
            <a href="#faq" className="transition-colors hover:text-ink-900">FAQ</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link href="/dashboard" className="btn btn-gold !px-5 !py-2.5">
                  Buka Dashboard <ArrowRight size={15} />
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost !px-5 !py-2.5">Masuk</Link>
                <Link href="/register" className="btn btn-primary !px-5 !py-2.5">Mulai Gratis</Link>
              </>
            )}
          </div>
          <details className="md:hidden">
            <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg border border-ink-200">
              <Menu size={20} />
            </summary>
            <div className="absolute right-4 top-16 w-56 rounded-2xl border border-ink-100 bg-white p-3 card-subtle">
              <a href="#fitur" className="block rounded-lg px-3 py-2 text-sm hover:bg-ivory-100">Fitur</a>
              <a href="#template" className="block rounded-lg px-3 py-2 text-sm hover:bg-ivory-100">Template</a>
              <a href="#harga" className="block rounded-lg px-3 py-2 text-sm hover:bg-ivory-100">Harga</a>
              <div className="my-2 h-px bg-ink-100" />
              {user ? (
                <Link href="/dashboard" className="btn btn-gold w-full">Buka Dashboard</Link>
              ) : (
                <div className="grid gap-2">
                  <Link href="/login" className="btn btn-outline w-full">Masuk</Link>
                  <Link href="/register" className="btn btn-primary w-full">Mulai Gratis</Link>
                </div>
              )}
            </div>
          </details>
        </div>
      </header>

      {/* -------------------------------- Hero ------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(176,141,66,0.14),transparent)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:pb-24 lg:pt-20">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-100/40 px-3.5 py-1.5 text-xs font-semibold text-gold-700">
              <Sparkles size={13} /> Undangan digital & event experience premium
            </span>
            <h1 className="mt-5 text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
              One Event. <br />
              <span className="font-script font-normal text-gold-600">One Digital Experience.</span>
            </h1>
            <p className="mt-5 max-w-md text-pretty text-lg text-ink-500">
              Create beautifully. Invite effortlessly. Celebrate together. — Buat undangan digital
              premium dalam hitungan menit, kelola tamu hingga QR check-in dalam satu platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={user ? "/dashboard/invitations/new" : "/register"} className="btn btn-primary !px-7 !py-3.5 !text-base">
                Buat Undangan Sekarang <ArrowRight size={17} />
              </Link>
              <Link href="/templates" className="btn btn-outline !px-7 !py-3.5 !text-base">
                Lihat Template
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-500">
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-sage-500" /> Tanpa kartu kredit</span>
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-sage-500" /> Siap dalam ±20 menit</span>
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-sage-500" /> 1.000+ kombinasi tema</span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto w-full max-w-[340px] animate-fade-in [animation-delay:150ms]">
            <div className="card-subtle rounded-[2.4rem] border-8 border-ink-900 bg-ink-900 p-2">
              <div className="relative overflow-hidden rounded-[1.9rem]">
                <MiniInvite theme={featured[0]?.theme_config ?? (templates[0]?.theme_config ?? {
                  name: "Evergold", palette: { background: "#171310", foreground: "#FBF9F4", primary: "#C9A95E", accent: "#B08D42", soft: "#211B16", muted: "#A89E92" }, font: "serif", layout: "luxe", animation: "subtle",
                })} />
              </div>
            </div>
            <div className="absolute -left-10 -top-5 animate-float-slow rounded-2xl border border-ink-100 bg-white px-4 py-3 card-subtle">
              <p className="text-xs font-bold text-ink-900">100+ RSVP</p>
              <p className="text-[10px] text-ink-500">Datang otomatis</p>
            </div>
            <div className="absolute -right-8 bottom-16 animate-float-slow rounded-2xl border border-ink-100 bg-white px-4 py-3 [animation-delay:1.5s] card-subtle">
              <p className="text-xs font-bold text-ink-900">QR Check-in</p>
              <p className="text-[10px] text-ink-500">Tanpa antre</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ Category chips ----------------------- */}
      <section className="border-y border-ink-100 bg-ivory-100/50 py-5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-2.5 px-4 sm:px-6">
          <span className="mr-1 text-xs font-semibold uppercase tracking-widest text-ink-400">Mulai dari:</span>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/templates?cat=${c.slug}`}
              className="rounded-full border border-ink-200 bg-white px-4 py-1.5 text-sm text-ink-700 transition-colors hover:border-gold-400 hover:text-gold-700"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------ How it works ------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6" id="fitur">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-600">Perjalanan Acara</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Create → Invite → Celebrate
          </h2>
          <p className="mt-4 text-ink-500">
            Satu undangan, satu pengalaman digital — dari pembuatan hingga kenangan setelah acara.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="card-subtle group rounded-2xl border border-ink-100 bg-white p-6 transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-ivory-100 text-gold-600 transition-colors group-hover:bg-gold-500 group-hover:text-white">
                  <s.icon size={20} />
                </span>
                <span className="font-script text-3xl text-ink-200">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink-900">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-4 rounded-2xl border border-ink-100 bg-white p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 text-white">
                <f.icon size={20} />
              </span>
              <div>
                <h4 className="font-bold text-ink-900">{f.title}</h4>
                <p className="mt-1 text-sm text-ink-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------ Templates ---------------------------- */}
      <section className="bg-night-950 py-20 text-white" id="template">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-400">Kurasi Admin</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Template Premium, Siap Pakai
              </h2>
              <p className="mt-3 max-w-xl text-night-800 text-ink-300">
                Kombinasi layout, palet warna, dan tipografi — ribuan variasi, dikurasi rapi.
              </p>
            </div>
            <Link href="/templates" className="btn btn-gold">
              Jelajahi Semua <ArrowRight size={15} />
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((t) => (
              <TemplateCard key={t.id} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- Pricing ----------------------------- */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6" id="harga">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-600">Harga</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
            Mulai Gratis, Naik Kapan Saja
          </h2>
          <p className="mt-4 text-ink-500">Semua paket aktif per bulan, tanpa kontrak.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.slice(0, 3).map((p, i) => (
            <div
              key={p.id}
              className={`card-subtle relative rounded-2xl border bg-white p-7 ${
                p.name === "premium" ? "border-gold-400 ring-4 ring-gold-400/15" : "border-ink-100"
              }`}
            >
              {p.name === "premium" && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold-500 px-3 py-1 text-[11px] font-bold text-white">
                  PALING LARIS
                </span>
              )}
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{p.display_name}</h3>
                {i === 0 && <span className="text-xs text-ink-400">(coba gratis)</span>}
              </div>
              <p className="mt-3 text-3xl font-extrabold text-ink-900">
                {fmtPrice(p.price)}
                <span className="text-sm font-medium text-ink-400">/{p.period}</span>
              </p>
              <ul className="mt-5 space-y-2.5 text-sm text-ink-600">
                {(Object.entries(p.features)
                  .filter(([k]) => typeof p.features[k] === "boolean" && p.features[k] === true)
                  .slice(0, 5) as [string, boolean][]).map(([k]) => (
                  <li key={k} className="flex items-center gap-2">
                    <Check size={15} className="text-sage-500" /> {k.replace(/[-_]/g, " ")}
                  </li>
                ))}
              </ul>
              <Link
                href={user ? "/dashboard/billing" : "/register"}
                className={`btn mt-6 w-full ${p.name === "premium" ? "btn-gold" : p.name === "basic" ? "btn-primary" : "btn-outline"}`}
              >
                {p.price === 0 ? "Mulai Gratis" : `Pilih ${p.display_name}`}
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-ink-400">
          Pro tersedia untuk acara besar — unlimited tamu & white-label.{" "}
          <Link href="/pricing" className="font-semibold text-gold-600 hover:underline">Lihat semua paket →</Link>
        </p>
      </section>

      {/* ----------------------------- Testimonials -------------------------- */}
      <section className="bg-ivory-100/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink-900">
              Mereka Sudah Merayakan
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.id} className="card-subtle rounded-2xl border border-ink-100 bg-white p-6">
                <div className="flex gap-0.5 text-gold-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="mt-4 text-sm leading-relaxed text-ink-700">“{t.content}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-500 text-sm font-bold text-white">
                    {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink-900">{t.name}</p>
                    <p className="text-xs text-ink-500">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------- FAQ ------------------------------- */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6" id="faq">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-600">FAQ</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink-900">Pertanyaan Umum</h2>
        </div>
        <div className="mt-8 space-y-3">
          {faqs.map((f) => (
            <details key={f.id} className="group rounded-2xl border border-ink-100 bg-white px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-ink-900 [&::-webkit-details-marker]:hidden">
                {f.question}
                <span className="text-gold-500 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* --------------------------------- CTA -------------------------------- */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-night-900 to-night-950 px-6 py-16 text-center text-white">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full bg-gold-500/25 blur-3xl" />
            <h2 className="relative text-3xl font-extrabold tracking-tight sm:text-4xl">
              Siap membuat momen tak terlupakan?
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-ink-300">
              Ciptakan undangan digital dalam 20 menit. Gratis tanpa kartu kredit.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn btn-gold !px-8 !py-3.5 !text-base">
                Mulai Gratis <ArrowRight size={17} />
              </Link>
              <Link href="/templates" className="btn !border !border-white/20 !bg-white/5 !px-8 !py-3.5 !text-base text-white hover:!bg-white/10">
                Lihat Template
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------- Footer ------------------------------ */}
      <footer className="border-t border-ink-100 bg-ivory-100/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
              AVELORA — Digital Invitation &amp; Event Platform. Create beautifully. Invite
              effortlessly. Celebrate together.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Music size={15} className="text-gold-500" />
              <span className="text-xs text-ink-400">Musik orisinal berlisensi AVELORA</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-ink-900">Produk</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li><Link href="/templates" className="hover:text-gold-600">Template</Link></li>
              <li><Link href="/pricing" className="hover:text-gold-600">Harga</Link></li>
              <li><Link href="/register" className="hover:text-gold-600">Daftar</Link></li>
              <li><Link href="/login" className="hover:text-gold-600">Masuk</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-ink-900">Demo</p>
            <p className="mt-3 text-xs leading-relaxed text-ink-400">
              Akun demo tersedia:<br />
              demo@avelora.id / demo123<br />
              admin@avelora.id / admin123
            </p>
          </div>
        </div>
        <div className="border-t border-ink-100 py-5 text-center text-xs text-ink-400">
          © {new Date().getFullYear()} AVELORA. All rights reserved.
        </div>
      </footer>
    </main>
  );
}