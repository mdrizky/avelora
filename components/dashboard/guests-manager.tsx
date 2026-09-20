"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clipboard, Loader2, Plus, Search, Trash2, Users } from "lucide-react";

interface GuestRow {
  id: string;
  name: string;
  phone: string;
  guest_slug: string;
  code: string;
  category: string;
  table_number: string;
  rsvp: string;
  checked_in: boolean;
}

export function GuestsManager({
  invitationId,
  slug,
  initialGuests,
  tableNames,
}: {
  invitationId: string;
  slug: string;
  initialGuests: GuestRow[];
  tableNames: string[];
}) {
  const router = useRouter();
  const [guests, setGuests] = useState(initialGuests);
  const [bulk, setBulk] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = guests.filter((g) => {
    const needle = q.toLowerCase();
    return (
      !needle ||
      g.name.toLowerCase().includes(needle) ||
      g.code.toLowerCase().includes(needle)
    );
  });

  async function addBulk() {
    const lines = bulk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const names = lines.map((l) => {
      const [name, phone = ""] = l.split(";").map((x) => x.trim());
      return { name, phone };
    });
    if (!names.length) return;
    setBusy(true);
    setMessage(null);
    const r = await fetch(`/api/invitations/${invitationId}/guests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names }),
    });
    const data = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) {
      setMessage(`Gagal menambah tamu: ${data.error ?? "unknown"}`);
      return;
    }
    setBulk("");
    setMessage(`Berhasil menambah ${data.created} tamu.`);
    router.refresh();
  }

  async function removeGuest(id: string) {
    if (!confirm("Hapus tamu ini?")) return;
    await fetch(`/api/guests/${id}`, { method: "DELETE" });
    setGuests((gs) => gs.filter((g) => g.id !== id));
    setMessage("Tamu dihapus.");
    router.refresh();
  }

  async function setTable(id: string, table_number: string) {
    await fetch(`/api/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_number }),
    });
    setGuests((gs) => gs.map((g) => (g.id === id ? { ...g, table_number } : g)));
    setMessage("Meja diperbarui.");
  }

  async function copyLink(g: GuestRow) {
    try {
      await navigator.clipboard.writeText(`${location.origin}/${slug}?to=${g.guest_slug}`);
      setCopied(g.id);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-ink-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gold-500" />
          <h2 className="text-sm font-bold text-ink-800">Tambah Tamu Massal</h2>
        </div>
        <p className="mt-1 text-xs text-ink-400">
          Satu nama per baris. Format: <code className="rounded bg-ink-100 px-1 py-0.5">Nama; 08xxxx</code> (opsional telepon).
        </p>
        <textarea
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          rows={5}
          placeholder={"Budi Santoso; 081234567890\nAndi Wijaya"}
          className="field mt-3 resize-none"
        />
        <button onClick={addBulk} disabled={busy} className="btn btn-primary mt-3">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Tambah {bulk.split("\n").filter((l) => l.trim()).length || ""} Tamu
        </button>
        {message && <p className="mt-2 text-xs text-ink-500">{message}</p>}
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari nama / kode tamu…"
              className="field pl-9"
            />
          </div>
          <span className="text-xs font-semibold text-ink-400">
            {filtered.length} / {guests.length} tamu
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-[11px] uppercase tracking-wide text-ink-400">
                <th className="py-2 pr-3 font-semibold">Nama</th>
                <th className="py-2 pr-3 font-semibold">Kode</th>
                <th className="py-2 pr-3 font-semibold">RSVP</th>
                <th className="py-2 pr-3 font-semibold">Meja</th>
                <th className="py-2 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="border-b border-ink-50 last:border-0">
                  <td className="py-2.5 pr-3">
                    <p className="font-semibold text-ink-800">{g.name}</p>
                    <p className="text-[11px] text-ink-400">{g.phone || "—"}</p>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-xs">{g.code}</span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <RsvpBadge status={g.rsvp} />
                  </td>
                  <td className="py-2.5 pr-3">
                    <select
                      value={g.table_number}
                      onChange={(e) => setTable(g.id, e.target.value)}
                      className="rounded-lg border border-ink-200 px-2 py-1 text-xs"
                    >
                      <option value="">—</option>
                      {tableNames.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => copyLink(g)} className="btn btn-ghost !px-2 !py-1" title="Salin tautan personal">
                        {copied === g.id ? <span className="text-xs text-green-600">✓</span> : <Clipboard size={14} />}
                      </button>
                      <button onClick={() => removeGuest(g.id)} className="btn btn-ghost !px-2 !py-1 text-red-400 hover:text-red-600" title="Hapus">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-ink-400">
                    Tidak ada tamu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RsvpBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    attending: "bg-green-100 text-green-700",
    not_attending: "bg-red-100 text-red-600",
    maybe: "bg-amber-100 text-amber-700",
    pending: "bg-ink-100 text-ink-500",
  };
  const labels: Record<string, string> = {
    attending: "Hadir",
    not_attending: "Tidak",
    maybe: "Mungkin",
    pending: "Belum",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${map[status] ?? map.pending}`}>
      {labels[status] ?? "Belum"}
    </span>
  );
}