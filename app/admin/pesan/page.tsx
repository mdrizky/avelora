import Link from "next/link";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  Inbox,
  MessageSquareHeart,
  Star,
  XCircle,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { countPendingTestimonials, getUserById, listTestimonialsForModeration } from "@/lib/db";
import { PesanModeration } from "@/components/admin/pesan-moderation";
import { timeAgo } from "@/lib/theme";

const FILTERS = [
  { key: "semua", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "approved", label: "Tayang" },
  { key: "rejected", label: "Ditolak" },
] as const;

const CHIP = {
  pending: {
    label: "Menunggu verifikasi",
    cls: "border-amber-200 bg-amber-100 text-amber-800",
    Icon: Clock,
  },
  approved: {
    label: "Disetujui",
    cls: "border-sage-300 bg-sage-100 text-sage-700",
    Icon: CheckCircle2,
  },
  rejected: {
    label: "Ditolak",
    cls: "border-ink-200 bg-ink-100 text-ink-600",
    Icon: XCircle,
  },
} as const;

export default async function AdminPesanPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  await requireAdmin();
  const { filter } = await searchParams;
  const all = listTestimonialsForModeration();
  const pendingCount = countPendingTestimonials();
  const active = FILTERS.some((f) => f.key === filter) ? filter : "semua";
  const rows =
    active === "semua" ? all : all.filter((t) => (t.status ?? "approved") === active);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
          Moderasi konten pengguna
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-extrabold tracking-tight text-ink-900">
          <MessageSquareHeart size={28} className="text-gold-500" /> Pesan &amp; Kesan
          {pendingCount > 0 && (
            <span className="animate-pulse-soft rounded-full bg-amber-400 px-3 py-1 text-xs font-extrabold text-amber-950">
              {pendingCount} menunggu
            </span>
          )}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
          Pengguna mengirim pesan dari dashboard. Pesan berstatus <strong>menunggu</strong> tidak
          tampil di halaman utama sampai kamu menyetujuinya. Setelah disetujui, pengirim langsung
          mendapat notifikasi dan pesannya tayang di bagian <em>Cerita Tamu</em> di landing page.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const count =
            f.key === "semua"
              ? all.length
              : all.filter((t) => (t.status ?? "approved") === f.key).length;
          const isActive = active === f.key;
          return (
            <Link
              key={f.key}
              href={f.key === "semua" ? "/admin/pesan" : `/admin/pesan?filter=${f.key}`}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-gold-500 bg-gold-500 text-white"
                  : "border-ink-200 bg-white text-ink-700 hover:border-gold-400"
              }`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 text-[11px] font-extrabold ${
                  isActive ? "bg-white/25" : "bg-ivory-100 text-ink-500"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-14 text-center">
          <Inbox size={36} className="mx-auto text-ink-300" />
          <p className="mt-4 font-extrabold text-ink-900">Tidak ada pesan di filter ini</p>
          <p className="mt-1 text-sm text-ink-500">
            Bagikan tautan <code className="rounded bg-ivory-100 px-1.5 py-0.5">/dashboard/testimoni</code>{" "}
            ke pengguna agar mereka bisa mengirim cerita mereka.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rows.map((t, i) => {
            const status = (t.status ?? "approved") as keyof typeof CHIP;
            const meta = CHIP[status];
            const owner = t.user_id ? getUserById(t.user_id) : undefined;
            return (
              <article
                key={t.id}
                data-reveal
                data-reveal-delay={Math.min(i, 6) * 60}
                className="card-subtle rounded-2xl border border-ink-100 bg-white p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold ${meta.cls}`}
                      >
                        <meta.Icon size={12} /> {meta.label}
                      </span>
                      {status === "approved" && !t.is_active && (
                        <span className="rounded-full border border-ink-200 bg-ivory-100 px-2.5 py-0.5 text-[11px] font-bold text-ink-500">
                          Disembunyikan dari landing page
                        </span>
                      )}
                      <span className="inline-flex items-center gap-0.5 text-gold-500">
                        {Array.from({ length: t.rating }).map((_, n) => (
                          <Star key={n} size={12} fill="currentColor" strokeWidth={0} />
                        ))}
                      </span>
                      {t.created_at && (
                        <span className="text-xs text-ink-400">{timeAgo(t.created_at)}</span>
                      )}
                    </div>

                    <blockquote className="mt-3 text-[15px] leading-relaxed text-ink-800">
                      “{t.content}”
                    </blockquote>

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-ink-500">
                      <span className="font-bold text-ink-900">{t.name}</span>
                      {t.role && <span>— {t.role}</span>}
                      {t.event_title && (
                        <span className="rounded-full bg-ivory-100 px-2.5 py-0.5 text-ink-600">
                          {t.event_title}
                        </span>
                      )}
                      {owner && (
                        <a
                          href={`/admin/users?q=${encodeURIComponent(owner.email)}`}
                          className="inline-flex items-center gap-1 font-semibold text-gold-600 hover:underline"
                        >
                          <BadgeCheck size={13} /> {owner.email}
                          <ExternalLink size={11} />
                        </a>
                      )}
                      {t.user_id && !owner && (
                        <span className="text-ink-400">Pengguna sudah tidak ada</span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 lg:w-64">
                    <PesanModeration
                      id={t.id}
                      status={status}
                      isActive={t.is_active}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
