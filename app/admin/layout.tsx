import Link from "next/link";
import { Activity, BarChart3, FileText, LayoutDashboard, LogOut, Megaphone, Music2, Settings, ShieldCheck, TicketPercent, Users, CreditCard, MessageSquare, LineChart, ScrollText } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-[#f6f3ee] text-ink-900 lg:flex">
      <aside className="flex w-full shrink-0 flex-col bg-night-950 px-4 py-5 text-white lg:sticky lg:top-0 lg:h-screen lg:w-64">
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-500 font-black text-white">A</span>
            <span className="text-lg font-extrabold tracking-tight">AVE<span className="text-gold-400">LORA</span></span>
          </Link>
          <span className="rounded-full border border-gold-400/30 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-gold-300">Admin</span>
        </div>
        <nav className="mt-6 grid grid-cols-2 gap-1.5 lg:block lg:space-y-1.5">
          {[
            ["/admin", "Ringkasan", LayoutDashboard],
            ["/admin/users", "Pengguna", Users],
            ["/admin/templates", "Katalog", BarChart3],
            ["/admin/music", "Musik", Music2],
            ["/admin/orders", "Order", CreditCard],
            ["/admin/coupons", "Kupon", TicketPercent],
            ["/admin/moderation", "Moderasi", MessageSquare],
            ["/admin/broadcast", "Broadcast", Megaphone],
            ["/admin/content", "Konten", FileText],
            ["/admin/reports", "Reports", LineChart],
            ["/admin/audit-logs", "Audit Log", ScrollText],
            ["/admin/settings", "Pengaturan", Settings],
            ["/admin#invitations", "Undangan", FileText],
            ["/admin#activity", "Aktivitas", Activity],
          ].map(([href, label, Icon]) => (
            <a key={href as string} href={href as string} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/10 hover:text-white">
              <Icon size={17} /> {label as string}
            </a>
          ))}
        </nav>
        <div className="mt-auto hidden space-y-1.5 border-t border-white/10 pt-5 lg:block">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white"><ShieldCheck size={17} /> Lihat situs</Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white"><Settings size={17} /> Pengaturan</Link>
          <form action="/api/auth/logout" method="get">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white"><LogOut size={17} /> Keluar</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-ink-100 bg-[#f6f3ee]/90 px-5 backdrop-blur sm:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">Avelora control center</p>
            <h1 className="mt-1 text-lg font-extrabold text-ink-900">Panel Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block"><strong className="block text-sm text-ink-900">Administrator</strong><span className="text-xs text-ink-500">Kontrol penuh platform</span></span>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-500 text-sm font-bold text-white">AD</span>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">
          {children}
        </div>
      </div>
    </main>
  );
}