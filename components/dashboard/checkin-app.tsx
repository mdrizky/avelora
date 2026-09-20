"use client";

import { useState } from "react";
import { CheckCircle2, QrCode as QrIcon, Search, Sparkles } from "lucide-react";
import { QrCode } from "./qr-code";

interface GuestLite {
  id: string;
  name: string;
  code: string;
  guest_slug: string;
  table_number: string;
  checked_in: boolean;
}
interface CheckinLite {
  id: string;
  guest_name: string;
  guest_code: string;
  checked_in_at: string;
}

export function CheckinApp({
  invitationId,
  slug,
  premium,
  guests,
  checkins,
}: {
  invitationId: string;
  slug: string;
  premium: boolean;
  guests: GuestLite[];
  checkins: CheckinLite[];
}) {
  const [q, setQ] = useState("");
  const [localChecked, setLocalChecked] = useState<Set<string>>(
    () => new Set(guests.filter((g) => g.checked_in).map((g) => g.id)),
  );
  const [localCheckins, setLocalCheckins] = useState(checkins);
  const [selected, setSelected] = useState<GuestLite | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const results = guests.filter((g) => {
    const n = q.toLowerCase();
    return !n || g.name.toLowerCase().includes(n) || g.code.toLowerCase().includes(n);
  });

  async function doCheckin(g: GuestLite) {
    if (localChecked.has(g.id)) return;
    setBusyId(g.id);
    const r = await fetch(`/api/invitations/${invitationId}/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guest_id: g.id }),
    });
    setBusyId(null);
    if (!r.ok) {
      setMsg("Gagal check-in (tamu tidak ditemukan / sudah masuk).");
      return;
    }
    setLocalChecked((s) => new Set(s).add(g.id));
    setLocalCheckins((cs) => [
      { id: `ck-${Date.now()}`, guest_name: g.name, guest_code: g.code, checked_in_at: new Date().toISOString() },
      ...cs,
    ]);
    setMsg(`${g.name} telah check-in.`);
  }

  const qrValue = selected ? `${window.location.origin}/${slug}?to=${selected.guest_slug}` : "";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="rounded-2xl border border-ink-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-gold-500" />
            <h2 className="text-sm font-bold text-ink-800">Scan / Cari Tamu</h2>
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ketik nama atau kode tamu (AVL-xxxxx)…"
            className="field mt-3"
          />
          {q && (
            <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto">
              {results.map((g) => (
                <button
                  key={g.id}
                  onClick={() => doCheckin(g)}
                  disabled={localChecked.has(g.id) || busyId === g.id}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${
                    localChecked.has(g.id)
                      ? "border-green-200 bg-green-50"
                      : "border-ink-200 bg-white hover:border-gold-400"
                  }`}
                >
                  <CheckCircle2 size={17} className={localChecked.has(g.id) ? "text-green-500" : "text-ink-300"} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-800">{g.name}</p>
                    <p className="text-[11px] text-ink-400">
                      {g.code} {g.table_number ? `• ${g.table_number}` : ""}
                    </p>
                  </div>
                  {!localChecked.has(g.id) && (
                    <span className="rounded bg-gold-500 px-2 py-0.5 text-[11px] font-bold text-white">
                      Check-in
                    </span>
                  )}
                </button>
              ))}
              {results.length === 0 && <p className="p-3 text-center text-xs text-ink-400">Tidak ditemukan.</p>}
            </div>
          )}
          {msg && <p className="mt-2 text-xs text-ink-500">{msg}</p>}
        </div>

        <div className="rounded-2xl border border-ink-200 bg-white p-5">
          <h2 className="text-sm font-bold text-ink-800">Sudah Masuk ({localCheckins.length})</h2>
          <div className="mt-3 space-y-1.5">
            {localCheckins.slice(0, 12).map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl bg-ink-50 px-3 py-2 text-sm">
                <CheckCircle2 size={15} className="text-green-500" />
                <span className="font-semibold text-ink-700">{c.guest_name}</span>
                <span className="font-mono text-[11px] text-ink-400">{c.guest_code}</span>
                <span className="ml-auto text-[11px] text-ink-400">
                  {new Date(c.checked_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
            {localCheckins.length === 0 && <p className="text-sm text-ink-400">Belum ada tamu yang check-in.</p>}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-ink-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <QrIcon size={16} className="text-gold-500" />
            <h2 className="text-sm font-bold text-ink-800">QR Tamu</h2>
            {!premium && (
              <span className="ml-auto flex items-center gap-1 rounded-full bg-gold-100 px-2 py-0.5 text-[10px] font-bold text-gold-700">
                <Sparkles size={11} /> Fitur Premium
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-400">
            Pilih tamu di daftar untuk melihat QR undangan personalnya.
          </p>
          <select
            value={selected?.id ?? ""}
            onChange={(e) => setSelected(guests.find((g) => g.id === e.target.value) ?? null)}
            className="field mt-3"
          >
            <option value="">— Pilih tamu —</option>
            {guests.map((g) => (
              <option key={g.id} value={g.id}>{g.name} ({g.code})</option>
            ))}
          </select>
          <div className="mt-4 flex justify-center">
            {selected && qrValue ? (
              <div className="rounded-xl border border-ink-200 bg-white p-3 text-center">
                <QrCode value={qrValue} />
                <p className="mt-2 text-xs font-semibold text-ink-700">{selected.name}</p>
                <p className="text-[11px] text-ink-400">{selected.code}</p>
              </div>
            ) : (
              <p className="py-8 text-xs text-ink-400">Pilih tamu untuk menampilkan QR.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}