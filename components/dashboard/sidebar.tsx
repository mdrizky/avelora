"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  Home,
  Inbox,
  LayoutGrid,
  LogOut,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";
import { Logo } from "@/components/logo";

const userNav = [
  { href: "/dashboard", label: "Ringkasan", icon: Home },
  { href: "/dashboard/invitations", label: "Undangan", icon: LayoutGrid },
  { href: "/dashboard/notifications", label: "Notifikasi", icon: Inbox },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/profile", label: "Profil", icon: User },
];

const adminNav = [
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export function DashboardSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const item = (href: string, label: string, Icon: typeof Home) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        key={href}
        href={href}
        className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
          active
            ? "bg-gold-500 text-white"
            : "text-ink-600 hover:bg-ivory-100 hover:text-ink-900"
        }`}
      >
        <Icon size={17} />
        {label}
      </Link>
    );
  };

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-100 bg-white lg:flex">
      <div className="flex h-16 items-center border-b border-ink-100 px-6">
        <Logo />
      </div>
      <nav className="flex-1 space-y-1.5 px-3 py-5">
        {userNav.map((n) => item(n.href, n.label, n.icon))}
        {isAdmin && adminNav.map((n) => item(n.href, n.label, n.icon))}
      </nav>
      <div className="border-t border-ink-100 p-3">
        <form action="/api/auth/logout" method="get">
          <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ivory-100 hover:text-ink-900">
            <LogOut size={17} /> Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}

export function DashboardMobileNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = [...userNav, ...(isAdmin ? adminNav : []), { href: "/dashboard/settings", label: "Lainnya", icon: Settings }];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-ink-100 bg-white/95 py-2 backdrop-blur lg:hidden">
      {items.slice(0, 5).map((n) => {
        const active = pathname === n.href || pathname.startsWith(n.href + "/");
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px] font-medium ${
              active ? "text-gold-600" : "text-ink-500"
            }`}
          >
            <n.icon size={18} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}