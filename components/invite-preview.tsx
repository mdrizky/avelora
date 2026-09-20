import { MapPin } from "lucide-react";
import type { ThemeConfig } from "@/lib/db/types";
import { FONT_CLASS, paletteStyle } from "@/lib/theme";

/**
 * Pratinjau statis tema undangan (server-safe).
 * Dipakai di galeri template, builder, dan halaman preview.
 */
export function InvitePreview({
  theme,
  title = "Nama Acara",
  subtitle = "Undangan Digital",
  dateLabel = "Sabtu, 12 Des 2026",
  compact = false,
  className = "",
}: {
  theme: ThemeConfig;
  title?: string;
  subtitle?: string;
  dateLabel?: string;
  compact?: boolean;
  className?: string;
}) {
  const pal = theme.palette;
  const body = (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2.5 px-5 text-center"
      style={{ background: pal.background, color: pal.foreground }}
    >
      <span className="text-[10px] uppercase tracking-[0.32em] opacity-70" style={{ color: pal.muted }}>
        {subtitle}
      </span>
      <h3 className={`${FONT_CLASS[theme.font]} leading-tight text-gold-500`} style={{ color: pal.primary }}>
        {title}
      </h3>
      <span className="h-px w-12 opacity-40" style={{ background: pal.accent }} />
      <span
        className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest"
        style={{ color: pal.foreground }}
      >
        <MapPin size={10} /> {dateLabel}
      </span>
      <span
        className="mt-1 rounded-full px-4 py-1.5 text-[10px] font-bold"
        style={{ background: pal.primary, color: "#fff" }}
      >
        Buka Undangan
      </span>
    </div>
  );
  if (compact) {
    return (
      <div className={`aspect-[3/4] w-full overflow-hidden ${className}`} style={paletteStyle(pal)}>
        {body}
      </div>
    );
  }
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl ${className}`}
      style={paletteStyle(pal)}
    >
      <div className="aspect-[3/4]">{body}</div>
    </div>
  );
}