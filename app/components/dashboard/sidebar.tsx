"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, FileText, Calendar, Settings, Shield, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isAdmin: boolean;
}

export function DashboardSidebar({ isAdmin }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userNavItems = [
    { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/dashboard/invitations", label: "Undangan Saya", icon: FileText },
    { href: "/dashboard/guests", label: "Tamu", icon: Users },
    { href: "/dashboard/rsvp", label: "RSVP", icon: Calendar },
    { href: "/dashboard/billing", label: "Billing & Paket", icon: Shield },
    { href: "/dashboard/profile", label: "Profil", icon: Settings },
  ];

  const adminNavItems = [
    { href: "/admin", label: "Dashboard Admin", icon: Shield },
    { href: "/admin/users", label: "Kelola Pengguna", icon: Users },
    { href: "/admin/invitations", label: "Semua Undangan", icon: FileText },
    { href: "/admin/templates", label: "Template", icon: FileText },
    { href: "/admin/music", label: "Musik", icon: Calendar },
    { href: "/admin/orders", label: "Pesanan", icon: Shield },
    { href: "/admin/settings", label: "Pengaturan", icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64 lg:w-64"
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!isCollapsed && (
            <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">A</span>
              </div>
              <span className="font-bold text-lg">AVELORA</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}

          {!isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground opacity-50 cursor-not-allowed"
              )}
            >
              <Shield className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>Panel Admin</span>}
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-border">
          {!isCollapsed && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">User</p>
                <p className="text-xs text-muted-foreground truncate">user@example.com</p>
              </div>
            </div>
          )}
          <Link
            href="/api/auth/logout"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Keluar</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}

interface DashboardMobileNavProps {
  isAdmin: boolean;
}

export function DashboardMobileNav({ isAdmin }: DashboardMobileNavProps) {
  const pathname = usePathname();

  const navItems = isAdmin
    ? [
        { href: "/admin", label: "Dashboard Admin", icon: Shield },
        { href: "/admin/users", label: "Kelola Pengguna", icon: Users },
        { href: "/admin/invitations", label: "Semua Undangan", icon: FileText },
        { href: "/admin/templates", label: "Template", icon: FileText },
        { href: "/admin/music", label: "Musik", icon: Calendar },
        { href: "/admin/orders", label: "Pesanan", icon: Shield },
        { href: "/admin/settings", label: "Pengaturan", icon: Settings },
      ]
    : [
        { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
        { href: "/dashboard/invitations", label: "Undangan Saya", icon: FileText },
        { href: "/dashboard/guests", label: "Tamu", icon: Users },
        { href: "/dashboard/rsvp", label: "RSVP", icon: Calendar },
        { href: "/dashboard/billing", label: "Billing & Paket", icon: Shield },
        { href: "/dashboard/profile", label: "Profil", icon: Settings },
      ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}