import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

const tabs = [
  { href: "", label: "Ringkasan" },
  { href: "guests", label: "Tamu" },
  { href: "guestbook", label: "Buku Tamu" },
  { href: "checkin", label: "Check-in" },
  { href: "seating", label: "Seating" },
  { href: "analytics", label: "Analitik" },
];

export function InvitationDetailHeader({
  id,
  slug,
  title,
  status,
  active,
}: {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published" | "expired" | "memory";
  active: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/dashboard/invitations" className="btn btn-ghost !px-2.5" aria-label="Kembali ke daftar">
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${status === "published" ? "bg-green-100 text-green-700" : status === "memory" ? "bg-purple-100 text-purple-700" : "bg-ink-100 text-ink-500"}`}>
              {status === "published" ? "Teres" : status === "memory" ? "Memory" : "Draf"}
            </span>
            <h1 className="truncate text-lg font-extrabold text-ink-900">{title}</h1>
          </div>
          <p className="text-xs text-ink-400">/{slug}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Link href={`/dashboard/invitations/${id}/edit`} className="btn btn-primary !py-2 !text-sm">
            Edit
          </Link>
          {status === "published" && (
            <a href={`/${slug}`} target="_blank" className="btn btn-outline !py-2 !text-sm">
              <ExternalLink size={14} /> Lihat
            </a>
          )}
        </div>
      </div>
      <nav className="flex flex-wrap gap-1.5 border-b border-ink-200 pb-2">
        {tabs.map((t) => {
          const isActive = active === t.href;
          return (
            <Link
              key={t.href}
              href={`/dashboard/invitations/${id}${t.href ? `/${t.href}` : ""}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
                isActive ? "bg-ink-900 text-white" : "text-ink-500 hover:bg-ink-100 hover:text-ink-900"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}