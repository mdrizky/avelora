"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";

export function MusicRow({
  id,
  title,
  artist,
  audioUrl,
}: {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
}) {
  const [url, setUrl] = useState(audioUrl);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function save() {
    setBusy(true);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "music", collection: "music_tracks", id, audio_url: url }),
    });
    setBusy(false);
    setDone(r.ok);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2">
      <div className="w-36 shrink-0">
        <p className="truncate text-sm font-semibold text-ink-800">{title}</p>
        <p className="truncate text-[11px] text-ink-400">{artist}</p>
      </div>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/audio.mp3 (lisensi AVELORA Studio)" className="field flex-1" />
      <button onClick={save} disabled={busy} className="btn btn-outline !px-3 !py-1.5">
        {busy ? <Loader2 size={13} className="animate-spin" /> : done ? <Check size={13} /> : "Simpan"}
      </button>
    </div>
  );
}