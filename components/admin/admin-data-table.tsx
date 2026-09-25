"use client";

import Image from "next/image";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export function TableToolbar({ placeholder, value, onChange, children }: { placeholder: string; value: string; onChange: (value: string) => void; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-ink-100 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
        <input value={value} onChange={(event) => onChange(event.target.value)} className="field !pl-9" placeholder={placeholder} />
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Pagination({ page, pages, onPageChange }: { page: number; pages: number; onPageChange: (page: number) => void }) {
  if (pages <= 1) return null;
  return <div className="flex items-center justify-between border-t border-ink-100 px-5 py-4 text-sm"><span className="text-xs text-ink-400">Halaman {page} dari {pages}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="btn btn-outline !px-3 !py-1.5 disabled:opacity-40">Sebelumnya</button><button disabled={page === pages} onClick={() => onPageChange(page + 1)} className="btn btn-outline !px-3 !py-1.5 disabled:opacity-40">Berikutnya</button></div></div>;
}

export function AdminUsersTable({ rows }: { rows: Array<{ id: string; name: string; email: string; role: string; plan: string; invitations: number; suspended: boolean; joined: string }> }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const filtered = useMemo(() => rows.filter((row) => {
    const matchesQuery = `${row.name} ${row.email}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "all" || (status === "suspended" ? row.suspended : !row.suspended);
    const matchesRole = role === "all" || row.role === role;
    return matchesQuery && matchesStatus && matchesRole;
  }), [query, role, rows, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  return <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm"><TableToolbar placeholder="Cari nama atau email..." value={query} onChange={(value) => { setQuery(value); setPage(1); }}><select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }} className="field !w-auto !py-2"><option value="all">Semua peran</option><option value="user">User</option><option value="admin">Admin</option></select><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="field !w-auto !py-2"><option value="all">Semua status</option><option value="active">Aktif</option><option value="suspended">Nonaktif</option></select></TableToolbar><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left"><thead className="bg-[#fbfaf7] text-xs uppercase tracking-wider text-ink-400"><tr><th className="px-5 py-3">Pengguna</th><th className="px-4 py-3">Peran</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Undangan</th><th className="px-4 py-3">Status</th><th className="px-5 py-3">Terdaftar</th></tr></thead><tbody className="divide-y divide-ink-100">{visible.map((row) => <tr key={row.id} className="hover:bg-[#fcfbf8]"><td className="px-5 py-4"><p className="font-bold text-ink-800">{row.name}</p><p className="text-xs text-ink-400">{row.email}</p></td><td className="px-4 py-4"><span className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-bold text-ink-600">{row.role}</span></td><td className="px-4 py-4 text-sm text-ink-600">{row.plan}</td><td className="px-4 py-4 text-sm font-semibold">{row.invitations}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${row.suspended ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{row.suspended ? "Nonaktif" : "Aktif"}</span></td><td className="px-5 py-4 text-sm text-ink-500">{row.joined}</td></tr>)}</tbody></table>{visible.length === 0 && <div className="p-12 text-center text-sm text-ink-400">Tidak ada pengguna yang cocok dengan filter.</div>}</div><Pagination page={Math.min(page, pages)} pages={pages} onPageChange={setPage} /></div>;
}

export function AdminTemplateGrid({ rows }: { rows: Array<{ id: string; name: string; category: string; premium: boolean; price: number; active: boolean; thumbnail: string }> }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const visible = rows.filter((row) => row.name.toLowerCase().includes(query.toLowerCase()) && (filter === "all" || (filter === "premium" ? row.premium : !row.premium)));
  return <div><TableToolbar placeholder="Cari template..." value={query} onChange={setQuery}><select value={filter} onChange={(event) => setFilter(event.target.value)} className="field !w-auto !py-2"><option value="all">Semua tipe</option><option value="free">Gratis</option><option value="premium">Premium</option></select></TableToolbar><div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">{visible.map((row) => <article key={row.id} className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm"><div className="relative flex h-36 items-center justify-center bg-[#f8f5ee]">{row.thumbnail ? <Image src={row.thumbnail} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" /> : <span className="text-4xl font-serif text-gold-400">A</span>}</div><div className="p-4"><div className="flex items-start justify-between gap-2"><div><h3 className="font-bold text-ink-900">{row.name}</h3><p className="mt-1 text-xs text-ink-400">{row.category}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${row.premium ? "bg-gold-100 text-gold-700" : "bg-sage-100 text-sage-700"}`}>{row.premium ? "Premium" : "Gratis"}</span></div><div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3 text-xs"><span className="text-ink-500">{row.premium ? `Rp ${row.price.toLocaleString("id-ID")}` : "Tanpa biaya"}</span><span className={row.active ? "text-emerald-600" : "text-ink-400"}>{row.active ? "Aktif" : "Nonaktif"}</span></div></div></article>)}{visible.length === 0 && <div className="col-span-full p-12 text-center text-sm text-ink-400">Tidak ada template yang cocok.</div>}</div></div>;
}
