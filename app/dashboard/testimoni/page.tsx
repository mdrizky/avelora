import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, MessageSquareHeart, Sparkles, XCircle } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getUserById, listTestimonialsByUser } from "@/lib/db";
import { PesanKesanForm } from "@/components/marketing/pesan-kesan-form";
import { timeAgo } from "@/lib/theme";

const STATUS_META = {
  pending: {
    label: "Menunggu verifikasi",
    chip: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
    note: "Admin sedang meninjau pesanmu.",
  },
  approved: {
    label: "Tayang di halaman utama",
    chip: "bg-sage-100 text-sage-700 border-sage-300",
    icon: CheckCircle2,
    note: "Pesanmu sudah tampil untuk semua pengunjung.",
  },
  rejected: {
    label: "Belum ditampilkan",
    chip: "bg-ink-100 text-ink-600 border-ink-200",
    icon: XCircle,
    note: "Admin memutuskan pesan ini belum suitable ditampilkan.",
  },
} as const;

export default async function TestimoniPage() {
  const user = await requireUser();
  const profile = getUserById(user.id);
  const mine = listTestimonialsByUser(user.id);
  const hasPending = mine.some((t) => (t.status ?? "approved") === "pending");

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
          Cerita &amp; Kesan
        </p>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-extrabold tracking-tight text-ink-900">
          <MessageSquareHeart size={26} className="text-gold-500" /> Kirim Pesanmu
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
          Ceritakan bagaimana AVELORA membantumu merayakan acara. Pesanmu akan dibaca dan
          diverifikasi admin lebih dulu, lalu tampil di halaman utama AVELORA sebagai cerita
          dari pengguna asli.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="card-subtle rounded-2xl border border-ink-100 bg-white p-6">
          <h2 className="text-lg font-extrabold text-ink-900">Tulis pesan</h2>
          <p className="mt-1 text-sm text-ink-500">
            Isi minimal 10 karakter, maksimal 600 karakter.
          </p>
          <div className="mt-6">
            <PesanKesanForm
              defaultName={`${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim()}
              defaultRole={profile?.role === "admin" ? "Admin" : "Pengguna AVELORA"}
              hasPending={hasPending}
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-gold-300/50 bg-gradient-to-br from-ivory-100 to-white p-5">
            <p className="flex items-center gap-2 text-sm font-extrabold text-ink-900">
              <Sparkles size={15} className="text-gold-500" /> Alur moderasi
            </p>
            <ol className="mt-4 space-y-3 text-sm text-ink-600">
              {[
                "Kamu mengirim pesan dari halaman ini.",
                "Menerima notifikasi sebagai admin untuk meninjaunya.",
                "Admin menyetujui → pesan tayang di halaman utama.",
                "Kamu dapat notifikasi begitu pesannya tayang.",
              ].map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink-900 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
            <Link href="/#cerita" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-gold-600 hover:underline">
              Lihat cerita yang sudah tayang <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-subtle overflow-hidden rounded-2xl border border-ink-100 bg-white">
            <h2 className="border-b border-ink-100 px-5 py-4 text-sm font-extrabold text-ink-900">
              Riwayat pesanmu ({mine.length})
            </h2>
            {mine.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-400">
                Belum ada pesan. Kirim yang pertama!
              </p>
            ) : (
              <ul className="divide-y divide-ink-100">
                {mine.map((t) => {
                  const meta = STATUS_META[(t.status ?? "approved") as keyof typeof STATUS_META];
                  const Icon = meta.icon;
                  return (
                    <li key={t.id} className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${meta.chip}`}
                        >
                          <Icon size={12} /> {meta.label}
                        </span>
                        <span className="text-xs text-ink-400">
                          {t.created_at ? timeAgo(t.created_at) : ""}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink-700">“{t.content}”</p>
                      {t.event_title && (
                        <p className="mt-1 text-xs text-ink-400">Acara: {t.event_title}</p>
                      )}
                      <p className="mt-1.5 text-xs text-ink-400">{meta.note}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
