"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function ToggleRow({
  collection,
  id,
  label,
  sub,
  initialActive,
}: {
  collection: "templates" | "plans" | "music_tracks" | "event_categories" | "testimonials";
  id: string;
  label: string;
  sub?: string;
  initialActive: boolean;
}) {
  const [active, setActive] = useState(initialActive);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "toggle", collection, id, is_active: !active }),
    });
    setBusy(false);
    if (r.ok) setActive((a) => !a);
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white px-3 py-2">
      <button
        onClick={toggle}
        disabled={busy}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${active ? "bg-green-500" : "bg-ink-200"}`}
        title={active ? "Nonaktifkan" : "Aktifkan"}
      >
        {busy && <Loader2 size={12} className="absolute left-1 top-1.5 animate-spin text-white" />}
        {!busy && <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${active ? "left-[22px]" : "left-0.5"}`} />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-800">{label}</p>
        {sub && <p className="truncate text-[11px] text-ink-400">{sub}</p>}
      </div>
      <span className={`text-[10px] font-bold uppercase ${active ? "text-green-600" : "text-red-400"}`}>
        {active ? "aktif" : "nonaktif"}
      </span>
    </div>
  );
}