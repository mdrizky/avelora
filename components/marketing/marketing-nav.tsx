"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";

const LINKS = [
  { href: "#template", label: "Template" },
  { href: "#alur", label: "Cara Kerja" },
  { href: "#fitur", label: "Fitur" },
  { href: "#harga", label: "Harga" },
  { href: "#cerita", label: "Cerita Tamu" },
  { href: "#faq", label: "FAQ" },
];

/**
 * Header marketing: efek "menempel + menyusut" saat di-scroll,
 * garis progres baca, dan menu mobile yang bisa ditutup.
 */
export function MarketingNav({
  isLoggedIn,
  avatarInitials,
}: {
  isLoggedIn: boolean;
  avatarInitials?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(100, (y / h) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-ink-100/70 bg-ivory-50/80 shadow-[0_10px_30px_-24px_rgba(22,18,14,0.5)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="AVELORA" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative rounded-full px-3.5 py-2 text-[13px] font-medium text-ink-700 transition-colors hover:bg-ink-900/5 hover:text-ink-900"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="group flex items-center gap-2.5 rounded-full border border-ink-200 bg-white/70 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-ink-900 transition-all hover:border-gold-400 hover:shadow-[0_10px_24px_-14px_rgba(176,141,66,0.8)]"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-[11px] font-bold text-white">
                {avatarInitials ?? "A"}
              </span>
              Dashboard
              <ArrowRight size={14} className="text-gold-600 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost !px-5 !py-2.5">
                Masuk
              </Link>
              <Link href="/register" className="btn btn-gold shine !px-5 !py-2.5">
                Mulai Gratis <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          className="grid h-10 w-10 place-items-center rounded-xl border border-ink-200 bg-white/70 lg:hidden"
        >
          <Menu size={19} />
        </button>
      </div>

      {/* garis progres baca halaman */}
      <div
        className={`h-[2px] origin-left bg-gradient-to-r from-gold-400 via-gold-300 to-gold-600 transition-opacity duration-300 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
        style={{ transform: `scaleX(${progress / 100})` }}
      />

      {/* menu mobile */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink-950/50 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute right-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-ivory-50 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-[68px] items-center justify-between border-b border-ink-100 px-5">
            <Logo />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup menu"
              className="grid h-10 w-10 place-items-center rounded-xl border border-ink-200"
            >
              <X size={19} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-5">
            {LINKS.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-ink-100 py-3.5 text-base font-semibold text-ink-800 transition-colors hover:text-gold-600"
                style={{ transitionDelay: `${i * 20}ms` }}
              >
                {l.label}
                <ArrowRight size={16} className="text-ink-300" />
              </a>
            ))}
            <div className="mt-6 grid gap-2.5">
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn btn-gold w-full !py-3">
                  Buka Dashboard <ArrowRight size={15} />
                </Link>
              ) : (
                <>
                  <Link href="/register" className="btn btn-gold w-full !py-3">
                    Mulai Gratis <ArrowRight size={15} />
                  </Link>
                  <Link href="/login" className="btn btn-outline w-full !py-3">
                    Masuk
                  </Link>
                </>
              )}
              <Link href="/templates" className="btn btn-ghost w-full !py-3">
                Jelajahi Template
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
