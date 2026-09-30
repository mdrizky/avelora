"use client";

import { useEffect } from "react";

/**
 * MotionRoot — penggerak animasi global (client, tanpa library).
 *
 * Server Component cukup menulis `data-reveal="up|left|right|zoom"` +
 * `data-reveal-delay={120}` dan elemen itu akan muncul saat masuk viewport.
 * `globals.css` memaksa `opacity:1` saat JS dimatikan (`<noscript>` di root
 * layout) dan saat `prefers-reduced-motion: reduce`.
 */
export function MotionRoot() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = Number(el.dataset.revealDelay ?? 0);
          if (delay > 0) el.style.transitionDelay = `${delay}ms`;
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (el.classList.contains("is-visible")) return;
        if (reduced) {
          el.classList.add("is-visible");
          return;
        }
        observer.observe(el);
      });
    };

    scan();

    // Navigasi App Router mengganti children → pindai ulang (di-debounce).
    let frame = 0;
    const mo = new MutationObserver(() => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      mo.disconnect();
      observer.disconnect();
    };
  }, []);

  return null;
}
