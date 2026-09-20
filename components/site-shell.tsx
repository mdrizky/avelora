import Link from "next/link";
import { ArrowRight, Menu, Music } from "lucide-react";
import { Logo } from "./logo";
import type { Profile } from "@/lib/db/types";

export async function SiteHeader({ user }: { user?: Profile | null }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-ivory-50/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-700 md:flex">
          <Link href="/#fitur" className="hover:text-ink-900">Fitur</Link>
          <Link href="/templates" className="hover:text-ink-900">Template</Link>
          <Link href="/pricing" className="hover:text-ink-900">Harga</Link>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link href="/dashboard" className="btn btn-gold !px-5 !py-2.5">
              Buka Dashboard <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost !px-5 !py-2.5">Masuk</Link>
              <Link href="/register" className="btn btn-primary !px-5 !py-2.5">Mulai Gratis</Link>
            </>
          )}
        </div>
        <details className="md:hidden">
          <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-lg border border-ink-200">
            <Menu size={20} />
          </summary>
          <div className="absolute right-4 top-16 w-56 rounded-2xl border border-ink-100 bg-white p-3 card-subtle">
            <Link href="/#fitur" className="block rounded-lg px-3 py-2 text-sm hover:bg-ivory-100">Fitur</Link>
            <Link href="/templates" className="block rounded-lg px-3 py-2 text-sm hover:bg-ivory-100">Template</Link>
            <Link href="/pricing" className="block rounded-lg px-3 py-2 text-sm hover:bg-ivory-100">Harga</Link>
            <div className="my-2 h-px bg-ink-100" />
            {user ? (
              <Link href="/dashboard" className="btn btn-gold w-full">Buka Dashboard</Link>
            ) : (
              <div className="grid gap-2">
                <Link href="/login" className="btn btn-outline w-full">Masuk</Link>
                <Link href="/register" className="btn btn-primary w-full">Mulai Gratis</Link>
              </div>
            )}
          </div>
        </details>
      </div>
    </header>
  );
}

export async function SiteFooter() {
  return (
    <footer className="border-t border-ink-100 bg-ivory-100/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
            AVELORA — Digital Invitation &amp; Event Platform.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Music size={14} className="text-gold-500" />
            <span className="text-xs text-ink-400">Musik orisinal berlisensi AVELORA</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold">Produk</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-500">
            <li><Link href="/templates" className="hover:text-gold-600">Template</Link></li>
            <li><Link href="/pricing" className="hover:text-gold-600">Harga</Link></li>
            <li><Link href="/register" className="hover:text-gold-600">Daftar</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-bold">Akun Demo</p>
          <p className="mt-3 text-xs leading-relaxed text-ink-400">
            demo@avelora.id / demo123<br />admin@avelora.id / admin123
          </p>
        </div>
      </div>
      <div className="border-t border-ink-100 py-5 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} AVELORA. All rights reserved.
      </div>
    </footer>
  );
}