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