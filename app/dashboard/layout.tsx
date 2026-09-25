import Link from "next/link";
import { Bell } from "lucide-react";
import { DashboardMobileNav, DashboardSidebar } from "@/components/dashboard/sidebar";
import { getImpersonator, requireUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { unreadNotifications } from "@/lib/db";
import { Logo } from "@/components/logo";
import { LogOut } from "lucide-react";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin");
  const unread = unreadNotifications(user.id);
  const impersonator = await getImpersonator();

  return (
    <div className="flex min-h-screen bg-ivory-50">
      {impersonator && <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-3 bg-amber-400 px-4 py-2 text-xs font-bold text-amber-950">Anda login sebagai {user.first_name} {user.last_name} (Admin Mode) <Link href="/api/auth/stop-impersonation" className="rounded-full bg-amber-950 px-3 py-1 text-white">Kembali ke Admin</Link></div>}
      <DashboardSidebar isAdmin={false} />
      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-ivory-50/90 px-4 backdrop-blur sm:px-6">
          <div className="lg:hidden">
            <Link href="/dashboard"><Logo /></Link>
          </div>
          <p className="hidden text-sm text-ink-500 lg:block">
            Halo, <span className="font-bold text-ink-900">{user.first_name}</span> 👋
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/notifications"
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-ink-200 bg-white text-ink-600 transition-colors hover:border-gold-400 hover:text-gold-600"
              aria-label="Notifikasi"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-sm font-bold text-white"
            >
              {user.first_name[0]}
              {user.last_name?.[0] ?? ""}
            </Link>
            <form action="/api/auth/logout" method="get" className="hidden lg:block">
              <button type="submit" className="grid h-10 w-10 place-items-center rounded-xl border border-ink-200 bg-white text-ink-500 transition-colors hover:text-wine-700" title="Keluar">
                <LogOut size={17} />
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      </div>
      <DashboardMobileNav isAdmin={false} />
    </div>
  );
}