import Link from "next/link";
import { CreditCard, Settings2, User } from "lucide-react";
import { requireUser } from "@/lib/auth/session";

export default async function SettingsPage() {
  await requireUser();
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-xl font-extrabold text-ink-900">Pengaturan</h1>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/dashboard/profile" className="rounded-2xl border border-ink-200 bg-white p-5 transition hover:border-gold-400">
          <User size={18} className="text-gold-500" />
          <p className="mt-2 text-sm font-bold text-ink-800">Profil</p>
          <p className="mt-0.5 text-xs text-ink-400">Nama, telepon, dan kata sandi.</p>
        </Link>
        <Link href="/dashboard/billing" className="rounded-2xl border border-ink-200 bg-white p-5 transition hover:border-gold-400">
          <CreditCard size={18} className="text-gold-500" />
          <p className="mt-2 text-sm font-bold text-ink-800">Billing &amp; Paket</p>
          <p className="mt-0.5 text-xs text-ink-400">Upgrade ke Premium untuk fitur penuh.</p>
        </Link>
        <Link href="/dashboard" className="rounded-2xl border border-ink-200 bg-white p-5 transition hover:border-gold-400">
          <Settings2 size={18} className="text-gold-500" />
          <p className="mt-2 text-sm font-bold text-ink-800">Ringkasan</p>
          <p className="mt-0.5 text-xs text-ink-400">Statistik dan undangan terbaru.</p>
        </Link>
      </div>
    </div>
  );
}