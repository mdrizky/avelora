"use client";

import { FormEvent, ReactNode, useState } from "react";
import { Loader2, X } from "lucide-react";

export function ConfirmDialog({ open, title, description, reasonRequired = false, passwordRequired = false, busy = false, onCancel, onConfirm, children }: { open: boolean; title: string; description: string; reasonRequired?: boolean; passwordRequired?: boolean; busy?: boolean; onCancel: () => void; onConfirm: (reason: string, password?: string) => void; children?: ReactNode }) {
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  if (!open) return null;
  function submit(event: FormEvent) { event.preventDefault(); if (reasonRequired && !reason.trim()) return; if (passwordRequired && password.length < 8) return; onConfirm(reason.trim(), passwordRequired ? password : undefined); }
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-ink-950/60 p-4" role="dialog" aria-modal="true"><form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-extrabold text-ink-900">{title}</h2><p className="mt-1 text-sm leading-6 text-ink-500">{description}</p></div><button type="button" onClick={onCancel} className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-ink-100"><X size={17} /></button></div>{children}<div className="mt-5 space-y-3">{reasonRequired || !passwordRequired ? <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="field" placeholder={reasonRequired ? "Alasan wajib diisi" : "Alasan (opsional)"} required={reasonRequired} /> : null}{passwordRequired ? <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={8} className="field" placeholder="Password baru (minimal 8 karakter)" required /> : null}</div><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={onCancel} className="btn btn-outline">Batal</button><button disabled={busy} className="btn btn-gold">{busy ? <Loader2 size={16} className="animate-spin" /> : "Konfirmasi"}</button></div></form></div>;
}
