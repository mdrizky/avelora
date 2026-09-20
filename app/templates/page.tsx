import Link from "next/link";
import { ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { InvitePreview } from "@/components/invite-preview";
import { getSessionUser } from "@/lib/auth/session";
import { listCategories, listTemplates } from "@/lib/db";
import { fmtIdr } from "@/lib/theme";

interface Props {
  searchParams: Promise<{ cat?: string; q?: string; harga?: string }>;
}

export default async function TemplatesPage({ searchParams }: Props) {
  const [params, user, categories] = await Promise.all([
    searchParams,
    getSessionUser(),
    listCategories(),
  ]);
  const cat = categories.find((c) => c.slug === params.cat);
  const filter = {
    category_id: cat?.id,
    premium: params.harga === "premium" ? true : params.harga === "free" ? false : undefined,
    q: params.q,
  };
  const templates = listTemplates(filter);

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader user={user} />
      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-600">Galeri Template</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl">
              {cat ? cat.name : "Semua Template"}
            </h1>
            <p className="mt-2 text-ink-500">
              {templates.length} template {cat ? `untuk ${cat.name.toLowerCase()}` : "untuk semua acara"} — dikurasi oleh tim AVELORA.
            </p>
          </div>
          <form method="get" className="flex w-full max-w-xs items-center gap-2">
            <div className="relative flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                name="q"
                defaultValue={params.q ?? ""}
                placeholder="Cari template…"
                className="field !pl-9"
              />
            </div>
            <button type="submit" className="btn btn-primary !px-4 !py-2.5">Cari</button>
          </form>
        </div>

        {/* Filter chips */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">
            <SlidersHorizontal size={13} /> Filter:
          </span>
          <Link
            href={params.cat || params.harga || params.q ? `/templates?${new URLSearchParams(params.cat ? { cat: params.cat } : {})}` : "/templates"}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${!cat && !params.harga ? "border-gold-500 bg-gold-500 text-white" : "border-ink-200 bg-white text-ink-700 hover:border-gold-400"}`}
          >
            Semua
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/templates?cat=${c.slug}`}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${cat?.id === c.id ? "border-gold-500 bg-gold-500 text-white" : "border-ink-200 bg-white text-ink-700 hover:border-gold-400"}`}
            >
              {c.name}
            </Link>
          ))}
          <span className="mx-1 h-5 w-px bg-ink-200" />
          <Link
            href={`/templates?${new URLSearchParams({ ...(params.cat ? { cat: params.cat } : {}), harga: "free" })}`}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${params.harga === "free" ? "border-gold-500 bg-gold-500 text-white" : "border-ink-200 bg-white text-ink-700 hover:border-gold-400"}`}
          >
            Gratis
          </Link>
          <Link
            href={`/templates?${new URLSearchParams({ ...(params.cat ? { cat: params.cat } : {}), harga: "premium" })}`}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${params.harga === "premium" ? "border-gold-500 bg-gold-500 text-white" : "border-ink-200 bg-white text-ink-700 hover:border-gold-400"}`}
          >
            Premium
          </Link>
        </div>

        {/* Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {templates.map((t) => {
            const c = categories.find((x) => x.id === t.category_id);
            return (
              <Link
                key={t.id}
                href={`/templates/${t.slug}`}
                className="card-subtle group overflow-hidden rounded-2xl border border-ink-100 bg-white transition-transform hover:-translate-y-1"
              >
                <div className="relative">
                  <InvitePreview theme={t.theme_config} title={t.name} subtitle={c?.name ?? "Undangan"} />
                  {t.is_premium && (
                    <span className="absolute right-3 top-3 rounded-full bg-gold-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                      PREMIUM
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-ink-900">{t.name}</p>
                    <p className="text-xs text-ink-500">
                      {t.is_premium ? fmtIdr(t.price) + "/acara" : "Gratis"}
                    </p>
                  </div>
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-ink-200 text-ink-500 transition-colors group-hover:border-gold-500 group-hover:bg-gold-500 group-hover:text-white">
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {templates.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
            <p className="font-bold text-ink-900">Tidak ada template yang cocok</p>
            <p className="mt-2 text-sm text-ink-500">Coba filter lain atau kata kunci berbeda.</p>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}