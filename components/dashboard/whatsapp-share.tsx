"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Share2,
  X,
} from "lucide-react";

export interface ShareGuest {
  id: string;
  name: string;
  phone: string;
  guest_slug: string;
}

const MAX_WA_TEXT = 4096;

/**
 * Normalisasi nomor telepon Indonesia menjadi format wa.me (tanpa +, tanpa 0).
 * "0812-3456-7890" -> "6281234567890"
 */
export function normalizeWaNumber(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  else if (!digits.startsWith("62")) digits = `62${digits}`;
  return digits;
}

function buildMessage(opts: {
  eventTitle: string;
  url: string;
  guestName?: string;
}): string {
  const { eventTitle, url, guestName } = opts;
  const greet = guestName ? `Halo ${guestName} 🙏` : "Halo 🙏";
  return [
    greet,
    "",
    `Kamu diundang ke *${eventTitle}*.`,
    "",
    "Buka undangan digital kami di sini:",
    url,
    "",
    "Sampai jumpa, dan selamat hari besar!",
  ].join("\n");
}

function clamp(text: string): string {
  return text.length > MAX_WA_TEXT ? text.slice(0, MAX_WA_TEXT) : text;
}

/** Buka WhatsApp (aplikasi bila terpasang, web bila tidak). */
function openWa(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export function WhatsAppShare({
  publicUrl,
  eventTitle,
  guests,
  defaultOpen = false,
}: {
  publicUrl: string;
  eventTitle: string;
  guests: ShareGuest[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [q, setQ] = useState("");
  const [custom, setCustom] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState<string[]>([]);
  const [busyShare, setBusyShare] = useState(false);

  const baseMessage = useMemo(
    () => custom ?? buildMessage({ eventTitle, url: publicUrl }),
    [custom, eventTitle, publicUrl],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return guests;
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(needle) ||
        (g.phone || "").includes(needle.replace(/\D/g, "")),
    );
  }, [guests, q]);

  const withPhone = guests.filter((g) => normalizeWaNumber(g.phone).length >= 9);
  const withoutPhone = guests.length - withPhone.length;

  function openContactPicker() {
    openWa(`https://wa.me/?text=${encodeURIComponent(clamp(baseMessage))}`);
    setSent(guests.map((g) => g.id));
  }

  function openGuestChat(guest: ShareGuest) {
    const number = normalizeWaNumber(guest.phone);
    if (!number) return;
    const url = `${publicUrl}?to=${encodeURIComponent(guest.guest_slug)}`;
    const text = buildMessage({
      eventTitle,
      url,
      guestName: guest.name,
    });
    openWa(`https://wa.me/${number}?text=${encodeURIComponent(clamp(text))}`);
    setSent((s) => (s.includes(guest.id) ? s : [...s, guest.id]));
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(clamp(baseMessage));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard tidak tersedia */
    }
  }

  async function nativeShare() {
    setBusyShare(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: eventTitle,
          text: baseMessage,
          url: publicUrl,
        });
        setSent(guests.map((g) => g.id));
      } else {
        await copyMessage();
      }
    } catch {
      /* pengguna membatalkan */
    } finally {
      setBusyShare(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {/* tombol utama: langsung ke WhatsApp dengan pemilih kontak */}
        <button
          type="button"
          onClick={openContactPicker}
          className="btn group !border-0 !bg-[#25D366] !text-white shadow-[0_14px_30px_-14px_rgba(37,211,102,0.8)] transition-transform hover:-translate-y-0.5 hover:!bg-[#1eb95a]"
        >
          <MessageCircle size={16} className="transition-transform group-hover:scale-110" />
          Bagikan ke WhatsApp
        </button>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="btn btn-outline"
          aria-expanded={open}
        >
          {open ? <X size={15} /> : <Share2 size={15} />}
          {open ? "Tutup" : "Kelola Pesan"}
        </button>
      </div>

      {open && (
        <div className="mt-5 space-y-5 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-[0_24px_60px_-40px_rgba(22,18,14,0.7)]">
          {/* pratinjau pesan */}
          <div className="border-b border-ink-100 bg-gradient-to-br from-[#ECE5DD] to-[#F7F2EC] p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-extrabold text-ink-900">
                <MessageCircle size={15} className="text-[#25D366]" />
                Pratinjau pesan
              </p>
              <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink-500">
                {baseMessage.length} / {MAX_WA_TEXT} karakter
              </span>
            </div>
            <div className="max-w-sm rounded-2xl rounded-tl-sm bg-white p-4 text-[13px] leading-relaxed text-ink-700 shadow-sm">
              <p className="whitespace-pre-wrap">{baseMessage}</p>
            </div>
          </div>

          {/* aksi */}
          <div className="flex flex-wrap gap-2 px-5">
            <button type="button" onClick={openContactPicker} className="btn btn-primary !py-2.5 !text-[13px]">
              <MessageCircle size={14} /> Pilih Kontak di WhatsApp
            </button>
            <button
              type="button"
              onClick={nativeShare}
              disabled={busyShare}
              className="btn btn-outline !py-2.5 !text-[13px]"
            >
              {busyShare ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />}
              Bagikan dari HP
            </button>
            <button type="button" onClick={copyMessage} className="btn btn-outline !py-2.5 !text-[13px]">
              {copied ? <Check size={14} className="text-green-600" /> : <Clipboard size={14} />}
              {copied ? "Tersalin" : "Salin Pesan"}
            </button>
          </div>

          {/* daftar tamu */}
          <div className="px-5 pb-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari nama atau nomor tamu…"
                  className="field pl-9"
                />
              </div>
              <span className="text-xs font-semibold text-ink-400">
                {withPhone.length} punya nomor · {withoutPhone} tanpa nomor
              </span>
            </div>

            {withPhone.length > 0 && (
              <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
                {filtered
                  .filter((g) => normalizeWaNumber(g.phone).length >= 9)
                  .map((g) => {
                    const done = sent.includes(g.id);
                    return (
                      <div
                        key={g.id}
                        className="hover-lift flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-3 py-2.5"
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-[11px] font-extrabold text-white">
                          {g.name.slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-bold text-ink-900">{g.name}</p>
                          <p className="truncate text-[11px] text-ink-400">
                            {g.phone} · {normalizeWaNumber(g.phone)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openGuestChat(g)}
                          className={`btn !px-3 !py-1.5 !text-[12px] ${
                            done
                              ? "btn-outline"
                              : "border-0 !bg-[#25D366] !text-white hover:!bg-[#1eb95a]"
                          }`}
                        >
                          {done ? <Check size={13} /> : <Send size={13} />}
                          {done ? "Dikirim" : "Kirim"}
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}

            {withPhone.length === 0 && (
              <p className="mt-4 rounded-xl border border-dashed border-ink-200 px-4 py-6 text-center text-[13px] text-ink-400">
                Belum ada tamu yang punya nomor WhatsApp. Tambahkan nomor pada halaman Tamu,
                atau pakai tombol Pilih Kontak di WhatsApp.
              </p>
            )}

            {filtered.length === 0 && withPhone.length > 0 && (
              <p className="mt-4 text-center text-[13px] text-ink-400">Tidak ada tamu yang cocok.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
