"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Crown,
  LoaderCircle,
  Search,
} from "lucide-react";
import { InvitePreview } from "@/components/invite-preview";
import type { EventCategory, Template } from "@/lib/db/types";

export function Builder({
  categories,
  templates,
  premiumAllowed,
  planLabel,
}: {
  categories: EventCategory[];
  templates: Template[];
  premiumAllowed: boolean;
  planLabel: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const initialTemplate = params.get("template");

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string | null>(initialTemplate);
  const [title, setTitle] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chosenCategory = categories.find((c) => c.id === (categoryId ?? templates[0]?.category_id));
  const filtered = useMemo(
    () =>
      templates.filter(
        (t) => (!categoryId || t.category_id === categoryId) && t.name.toLowerCase().includes(q.toLowerCase()),
      ),
    [templates, categoryId, q],
  );
  const chosen = templates.find((t) => t.id === templateId);

  async function create() {
    if (!templateId || title.trim().length < 3) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ template_id: templateId, title: title.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal membuat undangan");
      router.push(`/dashboard/invitations/${data.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      setLoading(false);
    }
  }

  const chooseCategory = (id: string) => {
    setCategoryId(id);
    setTemplateId(null);
  };

  const categoryLabel = (id: string | undefined) =>
    categories.find((c) => c.id === id)?.name ?? "";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Link href="/dashboard/invitations" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft size={15} /> Kembali
      </Link>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-600">Pilih</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900">Buat Undangan Baru</h1>
      </div>

      {/* Step indicator */}
      <div className="mx-auto flex max-w-md items-center justify-between text-xs font-semibold">
        {["Jenis Acara", "Template", "Finalisasi"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${
                (templateId ? i + 1 : i) >= 1 && i === 1 ? "bg-gold-500 text-white" : "bg-ink-100 text-ink-500"
              }`}
            >
              {i + 1}
            </span>
            {s}
            {i < 2 && <span className="h-px w-6 bg-ink-200" />}
          </div>
        ))}
      </div>

      {error && (
        <p className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
          {error}
        </p>
      )}

      {!categoryId && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => chooseCategory(c.id)}
              className="card-subtle group rounded-2xl border border-ink-100 bg-white p-6 text-left transition-transform hover:-translate-y-1"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 text-xl text-white">
                {c.icon === "heart" ? "♥" : c.icon === "baby" ? "🍼" : c.icon === "cake" ? "🎂" : c.icon === "graduation-cap" ? "🎓" : c.icon === "briefcase" ? "💼" : c.icon === "rings" ? "💍" : c.icon === "star" ? "⭐" : "✨"}
              </span>
              <h3 className="mt-4 text-lg font-bold text-ink-900 group-hover:text-gold-600">{c.name}</h3>
              <p className="mt-1 text-sm text-ink-500">{c.tagline}</p>
            </button>
          ))}
        </div>
      )}

      {categoryId && !templateId && (
        <div className="space-y-6">
          <button onClick={() => setCategoryId(null)} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
            <ArrowLeft size={15} /> Ganti jenis acara
          </button>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-ink-900">
              Template untuk{" "}
              <span className="text-gold-600">{chosenCategory?.name}</span>
            </h2>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari template…" className="field !w-52 !py-2 !pl-9" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {filtered.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplateId(t.id)}
                className="card-subtle group overflow-hidden rounded-2xl border border-ink-100 bg-white text-left transition-transform hover:-translate-y-1"
                disabled={t.is_premium && !premiumAllowed}
              >
                <div className="relative">
                  <InvitePreview theme={t.theme_config} title={t.name} subtitle={chosenCategory?.name ?? "Undangan"} compact />
                  {t.is_premium && (
                    <span className="absolute right-3 top-3 rounded-full bg-gold-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                      <Crown size={10} className="mr-1 inline" />PREMIUM
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-bold text-ink-900">{t.name}</p>
                  {t.is_premium && !premiumAllowed ? (
                    <p className="mt-1 rounded-lg bg-ivory-100 p-2 text-xs text-ink-600">
                      Perlu paket berbayar.{" "}
                      <Link href="/dashboard/billing" className="font-bold text-gold-600 hover:underline">Upgrade</Link>
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-ink-500">Pilih template ini</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {templateId && (
        <div className="space-y-6">
          <button onClick={() => setTemplateId(null)} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
            <ArrowLeft size={15} /> Ganti template
          </button>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="mx-auto w-full max-w-sm">
              {chosen && (
                <InvitePreview
                  theme={chosen.theme_config}
                  title={title || chosen.name}
                  subtitle={categoryLabel(chosen.category_id)}
                  compact
                />
              )}
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-ink-900">Nama undangan</h2>
              <div>
                <label className="label">Judul (contoh: Ahmad &amp; Sarah, Aqiqah Rayyan)</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul undangan"
                  className="field"
                />
              </div>
              {chosen && (
                <p className="rounded-xl bg-ivory-100 p-4 text-sm text-ink-600">
                  Template <span className="font-bold text-ink-900">{chosen.name}</span> untuk acara{" "}
                  <span className="font-bold">{categoryLabel(chosen.category_id)}</span>. Slot paket Anda:{" "}
                  <span className="font-bold text-gold-600">{planLabel}</span>.
                </p>
              )}
              <div className="flex items-center gap-3">
                <button onClick={create} disabled={loading || title.trim().length < 3} className="btn btn-gold !px-7">
                  {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}
                  Buat &amp; Buat Undangan
                </button>
                <span className="text-xs text-ink-400">Judul minimal 3 karakter (sisa dipersonalisasi di editor)</span>
              </div>
              {!premiumAllowed && chosen?.is_premium && (
                <p className="rounded-xl border border-gold-300 bg-gold-100/40 p-4 text-sm text-ink-600">
                  <Crown size={14} className="mr-1 inline text-gold-600" />
                  Template premium butuh paket Basic+.{" "}
                  <Link href="/dashboard/billing" className="font-bold text-gold-600 hover:underline">Lihat harga</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}