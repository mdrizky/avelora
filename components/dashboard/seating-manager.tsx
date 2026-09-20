"use client";

import { useMemo, useState } from "react";
import { Users } from "lucide-react";

export function SeatingManager({
  tables,
  guests,
}: {
  tables: { table_name: string; capacity: number }[];
  guests: { id: string; name: string; table_number: string }[];
}) {
  const [rows, setRows] = useState(guests);
  const unassigned = rows.filter((g) => !g.table_number);

  const grouped = useMemo(
    () =>
      tables.map((t) => ({
        ...t,
        list: rows.filter((g) => g.table_number === t.table_name),
      })),
    [tables, rows],
  );

  async function assign(id: string, table_number: string) {
    await fetch(`/api/guests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table_number }),
    });
    setRows((rs) => rs.map((g) => (g.id === id ? { ...g, table_number } : g)));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h2 className="text-sm font-bold text-ink-800">Denah Meja</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {grouped.map((t) => (
            <div key={t.table_name} className="rounded-2xl border border-ink-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm font-bold text-ink-800">
                  <Users size={14} className="text-gold-500" /> {t.table_name}
                </p>
                <span className="text-[11px] font-semibold text-ink-400">{t.list.length} / {t.capacity}</span>
              </div>
              <ul className="mt-2 space-y-1 text-xs text-ink-600">
                {t.list.slice(0, 6).map((g) => (
                  <li key={g.id}>{g.name}</li>
                ))}
                {t.list.length > 6 && <li className="text-ink-400">+{t.list.length - 6} lainnya</li>}
                {t.list.length === 0 && <li className="text-ink-400">Kosong</li>}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-ink-200 bg-white p-4">
        <h2 className="flex items-center gap-2 text-sm font-bold text-ink-800">
          <Users size={15} className="text-gold-500" /> Atur Meja Tamu
        </h2>
        <p className="mt-1 text-xs text-ink-400">Pilih meja untuk setiap tamu.</p>
        <div className="mt-3 max-h-[28rem] space-y-1.5 overflow-y-auto">
          {rows.map((g) => (
            <div key={g.id} className="flex items-center gap-2 rounded-xl bg-ink-50 px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate font-semibold text-ink-700">{g.name}</span>
              <select
                value={g.table_number}
                onChange={(e) => assign(g.id, e.target.value)}
                className="rounded-lg border border-ink-200 bg-white px-1.5 py-1 text-xs"
              >
                <option value="">—</option>
                {tables.map((t) => (
                  <option key={t.table_name} value={t.table_name}>{t.table_name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-400">
          {unassigned.length} tamu belum mendapat meja.
        </p>
      </div>
    </div>
  );
}