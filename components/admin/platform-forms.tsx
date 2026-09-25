"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

async function submitAdmin(payload: Record<string, unknown>) {
  const response = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!response.ok) throw new Error("Aksi gagal");
}

export function BroadcastForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData | null>(null);
  function prepare(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setForm(new FormData(event.currentTarget)); setOpen(true); }
  async function submit() { if (!form) return; setBusy(true); try { await submitAdmin({ type: "create_broadcast", name: form.get("title"), body: form.get("body"), target: form.get("target") }); setOpen(false); setForm(null); router.refresh(); } finally { setBusy(false); } }
  return <><form onSubmit={prepare} className="space-y-3"><input name="title" required className="field" placeholder="Judul broadcast" /><select name="target" className="field"><option value="all-users">Semua user</option><option value="free-users">User Free</option><option value="published-users">User dengan undangan tayang</option></select><textarea name="body" required rows={5} className="field" placeholder="Isi pesan broadcast" /><button disabled={busy} className="btn btn-gold">{busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Kirim broadcast</button></form><ConfirmDialog open={open} title="Kirim broadcast" description="Pesan akan dikirim sebagai notifikasi kepada target yang dipilih." busy={busy} onCancel={() => setOpen(false)} onConfirm={() => void submit()} /></>;
}

export function BlogForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); const form = new FormData(event.currentTarget); try { await submitAdmin({ type: "create_blog", name: form.get("title"), slug: form.get("slug"), excerpt: form.get("excerpt"), body: form.get("body"), status: form.get("status") }); event.currentTarget.reset(); router.refresh(); } finally { setBusy(false); } }
  return <form onSubmit={submit} className="space-y-3"><input name="title" required className="field" placeholder="Judul artikel" /><input name="slug" required className="field" placeholder="slug-artikel" /><input name="excerpt" className="field" placeholder="Ringkasan" /><textarea name="body" required rows={8} className="field" placeholder="Isi artikel" /><select name="status" className="field"><option value="draft">Draf</option><option value="published">Published</option></select><button disabled={busy} className="btn btn-gold">{busy ? <Loader2 size={16} className="animate-spin" /> : "Simpan artikel"}</button></form>;
}

export function SettingForm({ settingKey, initialValue }: { settingKey: string; initialValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); await submitAdmin({ type: "update_setting", setting_key: settingKey, setting_value: value }); setBusy(false); router.refresh(); }
  return <form onSubmit={submit} className="flex gap-2"><input value={value} onChange={(event) => setValue(event.target.value)} className="field" /><button disabled={busy} className="btn btn-outline">{busy ? <Loader2 size={15} className="animate-spin" /> : "Simpan"}</button></form>;
}

export function FaqForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); const form = new FormData(event.currentTarget); await submitAdmin({ type: "create_faq", name: form.get("question"), body: form.get("answer") }); setBusy(false); event.currentTarget.reset(); router.refresh(); }
  return <form onSubmit={submit} className="space-y-3"><input name="question" required className="field" placeholder="Pertanyaan FAQ" /><textarea name="answer" required rows={3} className="field" placeholder="Jawaban" /><button disabled={busy} className="btn btn-outline">{busy ? <Loader2 size={15} className="animate-spin" /> : "Tambah FAQ"}</button></form>;
}

export function TestimonialForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); const form = new FormData(event.currentTarget); await submitAdmin({ type: "create_testimonial", name: form.get("name"), role: form.get("role"), body: form.get("content"), rating: Number(form.get("rating")) }); setBusy(false); event.currentTarget.reset(); router.refresh(); }
  return <form onSubmit={submit} className="space-y-3"><input name="name" required className="field" placeholder="Nama" /><input name="role" required className="field" placeholder="Peran" /><textarea name="content" required rows={3} className="field" placeholder="Isi testimoni" /><select name="rating" className="field"><option value="5">5 bintang</option><option value="4">4 bintang</option><option value="3">3 bintang</option></select><button disabled={busy} className="btn btn-outline">{busy ? <Loader2 size={15} className="animate-spin" /> : "Tambah testimoni"}</button></form>;
}
