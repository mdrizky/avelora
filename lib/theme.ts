import type { CSSProperties } from "react";
import type { ThemeConfig } from "./db/types";

export const FONT_CLASS: Record<ThemeConfig["font"], string> = {
  serif: "font-serif",
  sans: "font-sans",
  script: "font-script",
};

export const LAYOUT_LABEL: Record<ThemeConfig["layout"], string> = {
  classic: "Klasik",
  editorial: "Editorial",
  luxe: "Luxe",
};

/** Ubah palet tema jadi CSS variable untuk komponen undangan. */
export function paletteStyle(pal: ThemeConfig["palette"]): CSSProperties {
  return {
    ["--inv-bg" as string]: pal.background,
    ["--inv-fg" as string]: pal.foreground,
    ["--inv-primary" as string]: pal.primary,
    ["--inv-accent" as string]: pal.accent,
    ["--inv-soft" as string]: pal.soft,
    ["--inv-muted" as string]: pal.muted,
  };
}

/** Palet cadangan (Evergold) bila data tema tidak lengkap / rusak. */
export const FALLBACK_PALETTE: ThemeConfig["palette"] = {
  name: "Evergold",
  background: "#171310",
  foreground: "#FBF9F4",
  primary: "#C9A95E",
  accent: "#B08D42",
  soft: "#211B16",
  muted: "#A89E92",
};

const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

/**
 * Jaring pengaman: `theme_config` bisa null/kosong/palet tak lengkap
 * (mis. template dibuat admin lewat form yang belum menyimpan palet).
 * Hasilnya selalu `ThemeConfig` yang aman dipakai di server maupun client.
 */
export function safeTheme(theme: Partial<ThemeConfig> | null | undefined): ThemeConfig {
  const src = (theme ?? {}) as Partial<ThemeConfig>;
  const raw = (src.palette ?? {}) as Partial<ThemeConfig["palette"]>;
  const pick = (key: keyof ThemeConfig["palette"], fallback: string) => {
    const v = raw[key];
    return typeof v === "string" && HEX.test(v.trim()) ? v.trim() : fallback;
  };
  const font = src.font;
  const layout = src.layout;
  const animation = src.animation;
  return {
    name: typeof src.name === "string" && src.name ? src.name : "Evergold",
    palette: {
      name: typeof raw.name === "string" && raw.name ? raw.name : FALLBACK_PALETTE.name,
      background: pick("background", FALLBACK_PALETTE.background),
      foreground: pick("foreground", FALLBACK_PALETTE.foreground),
      primary: pick("primary", FALLBACK_PALETTE.primary),
      accent: pick("accent", FALLBACK_PALETTE.accent),
      soft: pick("soft", FALLBACK_PALETTE.soft),
      muted: pick("muted", FALLBACK_PALETTE.muted),
    },
    font: font === "serif" || font === "sans" || font === "script" ? font : "serif",
    layout: layout === "classic" || layout === "editorial" || layout === "luxe" ? layout : "luxe",
    animation: animation === "subtle" || animation === "none" ? animation : "subtle",
  };
}

/** Format Rupiah (id-ID). */
export function fmtIdr(n: number): string {
  return `Rp${n.toLocaleString("id-ID")}`;
}

export function formatDate(iso: string, withTime = false): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  if (!withTime) return date;
  const time = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${date}, pukul ${time}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} menit lalu`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} bulan lalu`;
  return `${Math.floor(months / 12)} tahun lalu`;
}