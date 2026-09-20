import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Crown, Palette, Sparkles } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { InvitePreview } from "@/components/invite-preview";
import { getSessionUser } from "@/lib/auth/session";
import { getTemplate, listCategories } from "@/lib/db";
import { fmtIdr, LAYOUT_LABEL } from "@/lib/theme";
import { FONT_CLASS } from "@/lib/theme";

function fontLabel(font: string) {
  return font === "serif" ? "Serif Elegan" : font === "script" ? "Script Tangan" : "Sans Modern";
}

export default async function TemplateDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [user, tpl, categories] = await Promise.all([getSessionUser(), Promise.resolve(getTemplate(slug)), listCategories()]);
  if (!tpl) notFound();
  const cat = categories.find((c) => c.id === tpl.category_id);
  const startHref = user
    ? `/dashboard/invitations/new?template=${tpl.id}`
    : `/register?next=${encodeURIComponent(`/dashboard/invitations/new?template=${tpl.id}`)}`;

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader user={user} />
      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <Link href="/templates" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
          <ArrowLeft size={15} /> Kembali ke galeri
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="mx-auto max-w-sm">
              <InvitePreview theme={tpl.theme_config} title={tpl.name} subtitle={cat?.name ?? "Undangan"} compact />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              {tpl.is_premium && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-3 py-1 text-xs font-bold text-white">
                  <Crown size={12} /> PREMIUM
                </span>
              )}
              <span className="rounded-full bg-ivory-100 px-3 py-1 text-xs font-semibold text-ink-600">{cat?.name}</span>
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink-900">{tpl.name}</h1>
            <p className="mt-3 text-lg text-ink-500">{cat?.tagline}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-ink-100 bg-white p-4">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-400"><Palette size={14} /> Palet</span>
                <div className="mt-3 flex gap-1.5">
                  {["background", "foreground", "primary", "accent", "soft"].map((k) => (
                    <span
                      key={k}
                      className="h-8 w-8 rounded-full border border-ink-100"
                      style={{ background: tpl.theme_config.palette[k as keyof typeof tpl.theme_config.palette] }}
                      title={k}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm text-ink-500">{tpl.theme_config.palette.name}</p>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-white p-4">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-400"><Sparkles size={14} /> Tipografi & Layout</span>
                <p className="mt-3 text-sm font-semibold text-ink-900">
                  {fontLabel(tpl.theme_config.font)} <span className={`ml-1 ${FONT_CLASS[tpl.theme_config.font]}`}>{tpl.name}</span>
                </p>
                <p className="mt-1 text-sm text-ink-500">Layout {LAYOUT_LABEL[tpl.theme_config.layout]}</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-night-950 p-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-ink-300">Harga paket ini</p>
                  <p className="text-2xl font-extrabold">{tpl.is_premium ? fmtIdr(tpl.price) : "Gratis"}</p>
                </div>
                <Link href={startHref} className="btn btn-gold !px-7 !py-3">
                  Pakai Template Ini <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <ul className="mt-8 space-y-2.5 text-sm text-ink-600">
              {[
                "Live preview saat menyunting",
                "Konten sesuai jenis acara",
                "Nama tamu muncul otomatis",
                "Kompatibel WhatsApp, Instagram, Telegram",
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-sage-100 text-sage-700"><Check size={12} /></span>
                  {f}
                </li>
              ))}
            </ul>
            {!user && (
              <p className="mt-8 rounded-xl border border-ink-100 bg-ivory-100/60 p-4 text-sm text-ink-600">
                Sudah punya akun? <Link href={`/login?next=${encodeURIComponent(`/dashboard/invitations/new?template=${tpl.id}`)}`} className="font-bold text-gold-600 hover:underline">Masuk</Link> untuk langsung memakai template ini.
              </p>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}