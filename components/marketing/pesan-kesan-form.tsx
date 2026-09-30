"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send, Sparkles, Star, TriangleAlert } from "lucide-react";

/**
 * Form "Pesan & Kesan" — dipakai di dashboard.
 * Alur: user kirim → status `pending` → admin verifikasi di /admin/content
 * → baru tampil di landing page.
 */
export function PesanKesanForm({
  defaultName,
  defaultRole,
  hasPending,
}: {
  defaultName: string;
  defaultRole: string;
  hasPending: boolean;
}) {
  const [name, setName] = useState(defaultName);
  const [role, setRole] = useState(defaultRole);
  const [eventTitle, setEventTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role: role || undefined,
          event_title: eventTitle || undefined,
          content,
          rating,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim. Coba lagi.");
        return;
      }
      setDone(true);
      setContent("");
      setEventTitle("");
    } catch {
      setError("Tidak dapat terhubung ke server. Periksa koneksi kamu.");
    } finally {
      setBusy(false);
    }
  }

  if (done || hasPending) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-sage-300/60 bg-gradient-to-br from-sage-100 to-ivory-50 p-7 text-center">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sage-300/30 blur-2xl" />
        <span className="relative mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage-500 text-white shadow-lg shadow-sage-500/30">
          <CheckCircle2 size={28} />
        </span>
        <h3 className="relative mt-4 text-lg font-extrabold text-ink-900">
          {done ? "Pesanmu sudah masuk antrean!" : "Pesanmu sedang diverifikasi"}
        </h3>
        <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-600">
          {done
            ? "Admin akan meninjau pesanmu. Kalau lolos verifikasi, namamu akan tampil di halaman utama AVELORA dan kamu dapat notifikasi."
            : "Admin sedang meninjau pesan sebelumnya. Sabar ya — begitu disetujui, pesannya langsung tayang di halaman utama."}
        </p>
        <a
          href="/#cerita"
          className="btn btn-outline relative mt-5 !py-2.5"
        >
          Lihat halaman Cerita Tamu
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="tk-name">
            Nama kamu
          </label>
          <input
            id="tk-name"
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={60}
            placeholder="Nama lengkap"
          />
        </div>
        <div>
          <label className="label" htmlFor="tk-role">
            Profesi / peran
          </label>
          <input
            id="tk-role"
            className="field"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            maxLength={60}
            placeholder="Contoh: Pengantin / Event Organizer"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="tk-event">
          Nama acara yang kamu rayakan
        </label>
        <input
          id="tk-event"
          className="field"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          maxLength={80}
          placeholder="Contoh: Pernikahan Daffa & Salsa, 12 Des 2026"
        />
      </div>

      <div>
        <span className="label">Rating pengalaman</span>
        <div
          className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2.5"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} bintang`}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                size={26}
                className={
                  n <= (hover || rating) ? "text-gold-500" : "text-ink-200"
                }
                fill="currentColor"
                strokeWidth={0}
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-semibold text-ink-500">
            {hover || rating}/5
          </span>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="tk-content">
          Ceritakan pengalamannya
        </label>
        <textarea
          id="tk-content"
          className="field resize-y"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          minLength={10}
          maxLength={600}
          placeholder="Ceritakan pengalamanmu memakai AVELORA untuk acara ini."
        />
        <p className="mt-1 text-right text-xs text-ink-400">{content.length}/600</p>
      </div>

      {error && (
        <p
          key={error}
          className="animate-shake flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          <TriangleAlert size={16} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className="btn btn-gold !px-7 !py-3">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {busy ? "Mengirim…" : "Kirim Pesan"}
        </button>
        <p className="inline-flex items-center gap-1.5 text-xs text-ink-400">
          <Sparkles size={13} className="text-gold-500" />
          Ditinjau admin sebelum tayang di halaman utama.
        </p>
      </div>
    </form>
  );
}
