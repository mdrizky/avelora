import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getSessionUser } from "@/lib/auth/session";
import { listPlans } from "@/lib/db";
import { fmtIdr } from "@/lib/theme";

function featureLabel(k: string): string {
  const map: Record<string, string> = {
    invitations: "Jumlah undangan",
    guests: "Batas tamu",
    templates: "Akses template",
    analytics: "Analitik pengunjung",
    watermark: "Watermark AVELORA",
    remove_branding: "Hapus branding AVELORA",
    custom_url: "URL khusus / domain",
    music: "Musik orisinal",
    qr_checkin: "QR check-in",
    seating: "Pengaturan meja",
    white_label: "White label",
  };
  return map[k] ?? k.replace(/[-_]/g, " ");
}

export default async function PricingPage() {
  const [user, plans] = await Promise.all([getSessionUser(), listPlans()]);
  const allKeys = [
    "invitations",
    "guests",
    "watermark",
    "remove_branding",
    "custom_url",
    "music",
    "qr_checkin",
    "seating",
    "analytics",
    "white_label",
  ];

  function fmtFeature(p: (typeof plans)[number], k: string): string {
    const v = p.features[k];
    if (v === false) return "—";
    if (v === true) return "✓";
    if (typeof v === "number") return v.toLocaleString("id-ID");
    if (k === "templates") return v === "all" ? "Semua" : "Gratis";
    if (v === "unlimited") return "Tak terbatas";
    return String(v);
  }

  return (
    <main className="flex min-h-screen flex-col">
      <SiteHeader user={user} />
      <section className="mx-auto w-full max-w-6xl flex-1 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-600">Harga</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink-900">
            Paket yang tumbuh bersama acaramu
          </h1>
          <p className="mt-4 text-ink-500">
            Gratis untuk memulai, naikkan paket kapan saja. Pembayaran gateway menyusul — pada MVP,
            klaim paket lewat tautan aktivasi langsung.
          </p>
        </div>

        <div className="mt-14 overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ivory-100/60 text-left">
                <th className="px-5 py-4 font-bold text-ink-900">Fitur</th>
                {plans.map((p) => (
                  <th key={p.id} className="px-5 py-4 text-center">
                    <span className="text-lg font-extrabold text-ink-900">{p.display_name}</span>
                    <span className="mt-0.5 block text-xs font-medium text-ink-500">
                      {p.price === 0 ? "Gratis" : `${fmtIdr(p.price)}/${p.period}`}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allKeys.map((k, i) => (
                <tr key={k} className={`border-b border-ink-100 ${i % 2 ? "bg-ivory-50/40" : ""}`}>
                  <td className="px-5 py-3.5 font-medium text-ink-700">{featureLabel(k)}</td>
                  {plans.map((p) => (
                    <td key={p.id} className={`px-5 py-3.5 text-center ${fmtFeature(p, k) === "✓" ? "font-bold text-sage-700" : "text-ink-600"}`}>
                      {fmtFeature(p, k)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="px-5 py-5" />
                {plans.map((p) => (
                  <td key={p.id} className="px-5 py-5 text-center">
                    <Link
                      href={user ? "/dashboard/billing" : `/register?next=/dashboard/billing`}
                      className={`btn w-full ${p.price === 0 ? "btn-outline" : "btn-primary"}`}
                    >
                      {p.price === 0 ? "Mulai Gratis" : `Pilih ${p.display_name}`} <ArrowRight size={14} />
                    </Link>
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-12 rounded-2xl bg-night-950 p-8 text-center text-white">
          <h2 className="text-xl font-extrabold">Butuh skala korporat / reseller?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-300">
            Paket Pro mendukung event besar dengan unlimited tamu dan white-label. Program reseller
            tersedia di fase berikutnya — hubungi tim AVELORA.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 text-sm text-gold-400">
            <Check size={15} /> Pro: Rp199.000/bulan
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}