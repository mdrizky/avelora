"use client";

import { FormEvent, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

async function adminRequest(body: Record<string, unknown>) {
  const response = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? "Aksi admin gagal");
}

export function AdminTemplateForm({ categories }: { categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  async function uploadThumbnail(file: File) {
    const body = new FormData();
    body.set("file", file);
    body.set("bucket", "assets");
    setUploading(true);
    try {
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Upload gagal");
      setThumbnailUrl(data.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      await adminRequest({
        type: "create_template",
        name: form.get("name"),
        slug: form.get("slug"),
        category_id: form.get("category_id"),
        thumbnail_url: thumbnailUrl || form.get("thumbnail_url"),
        is_premium: form.get("is_premium") === "on",
        price: Number(form.get("price") || 0),
      });
      event.currentTarget.reset();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Aksi admin gagal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-xl border border-dashed border-gold-300 bg-gold-50/40 p-4 md:grid-cols-2">
      <input name="name" required placeholder="Nama template" className="field" />
      <input name="slug" required placeholder="Slug, contoh: floral-love" className="field" />
      <select name="category_id" required className="field">
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </select>
      <input name="thumbnail_url" type="url" placeholder="URL thumbnail (opsional)" className="field" />
      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadThumbnail(file); }} className="field" />
      <input name="price" type="number" min="0" placeholder="Harga premium" className="field" />
      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input name="is_premium" type="checkbox" className="h-4 w-4 accent-gold-500" /> Template premium
      </label>
      {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
      <button disabled={busy} className="btn btn-gold md:col-span-2 md:justify-self-start">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Tambah Template
      </button>
    </form>
  );
}

export function AdminActionButton({ type, id, active, label }: { type: "suspend_user" | "delete_invitation"; id: string; active?: boolean; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  async function run() {
    setBusy(true);
    try {
      await adminRequest({ type, id, is_active: active });
      router.refresh();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <><button onClick={() => setOpen(true)} disabled={busy} className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${type === "delete_invitation" ? "bg-red-500 text-white hover:bg-red-600" : "border border-ink-200 text-ink-600 hover:border-gold-400"}`}>
      {busy ? <Loader2 size={12} className="animate-spin" /> : type === "delete_invitation" ? <Trash2 size={12} /> : null}
      {label}
    </button><ConfirmDialog open={open} title={type === "delete_invitation" ? "Hapus undangan" : label} description={type === "delete_invitation" ? "Data undangan dan data terkait akan dihapus." : "Perubahan ini akan dicatat di audit log."} busy={busy} onCancel={() => setOpen(false)} onConfirm={run} /></>
  );
}