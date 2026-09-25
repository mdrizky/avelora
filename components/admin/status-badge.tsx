import type { ReactNode } from "react";

const tones = {
  active: "bg-emerald-50 text-emerald-700",
  suspended: "bg-amber-50 text-amber-700",
  banned: "bg-red-50 text-red-700",
  pending: "bg-ink-100 text-ink-600",
  published: "bg-emerald-50 text-emerald-700",
  draft: "bg-ink-100 text-ink-600",
  premium: "bg-gold-100 text-gold-700",
  free: "bg-sage-100 text-sage-700",
} as const;

export function StatusBadge({ tone, children }: { tone: keyof typeof tones; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}
