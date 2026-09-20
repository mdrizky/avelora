import Link from "next/link";
import { Plus } from "lucide-react";
import { InvitationCard } from "@/components/dashboard/invitation-card";
import { requireUser } from "@/lib/auth/session";
import { listInvitationsByOwner } from "@/lib/db";

export default async function InvitationsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [user, params] = await Promise.all([requireUser(), searchParams]);
  const all = listInvitationsByOwner(user.id);
  const invitations = params.status
    ? all.filter((i) => i.status === params.status)
    : all;

  const tabs = [
    { key: "", label: "Semua" },
    { key: "published", label: "Tayang" },
    { key: "draft", label: "Draf" },
    { key: "expired", label: "Berakhir" },
    { key: "memory", label: "Kenangan" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Undangan</h1>
          <p className="mt-1 text-sm text-ink-500">{invitations.length} undangan</p>
        </div>
        <Link href="/dashboard/invitations/new" className="btn btn-gold">
          <Plus size={16} /> Undangan Baru
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/dashboard/invitations?status=${t.key}` : "/dashboard/invitations"}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              (params.status ?? "") === t.key
                ? "border-gold-500 bg-gold-500 text-white"
                : "border-ink-200 bg-white text-ink-700 hover:border-gold-400"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {invitations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center text-sm text-ink-500">
          Tidak ada undangan di sini.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {invitations.map((inv) => (
            <InvitationCard key={inv.id} inv={inv} />
          ))}
        </div>
      )}
    </div>
  );
}