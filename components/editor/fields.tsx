"use client";

import { GripVertical, Plus, Trash2 } from "lucide-react";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="label">{children}</p>;
}

export function Input({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      {label && <SectionLabel>{label}</SectionLabel>}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="field" />
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

export function Textarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div>
      {label && <SectionLabel>{label}</SectionLabel>}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="field resize-none" />
    </div>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm"
    >
      <span className="font-medium text-ink-700">{label}</span>
      <span className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-gold-500" : "bg-ink-200"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      {label && <SectionLabel>{label}</SectionLabel>}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="field">
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

const SAMPLE_PHOTOS = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=75",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=75",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=75",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=75",
  "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=75",
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=75",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=75",
  "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?auto=format&fit=crop&w=800&q=75",
];

export function ImageInput({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      {label && <SectionLabel>{label}</SectionLabel>}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="URL gambar (atau pilih contoh di bawah)" className="field" />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {SAMPLE_PHOTOS.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(url)}
            className={`h-10 w-10 overflow-hidden rounded-lg border-2 ${value === url ? "border-gold-500" : "border-transparent"}`}
            title="Gunakan foto ini"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* List editors                                                       */
/* ------------------------------------------------------------------ */

export function StoryEditor({
  items,
  onChange,
}: {
  items: { id: string; title: string; date: string; description: string; photo?: string }[];
  onChange: (v: { id: string; title: string; date: string; description: string; photo?: string }[]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel>Cerita / Timeline</SectionLabel>
        <button
          type="button"
          onClick={() =>
            onChange([...items, { id: `st-${Date.now()}`, title: "", date: "", description: "" }])
          }
          className="btn btn-outline !py-1.5 !text-xs"
        >
          <Plus size={12} /> Tambah
        </button>
      </div>
      {items.length === 0 && <p className="text-xs text-ink-400">Belum ada cerita.</p>}
      {items.map((item, idx) => (
        <div key={item.id} className="rounded-xl border border-ink-200 bg-white p-3 space-y-2">
          <div className="flex items-center gap-2 text-ink-300">
            <GripVertical size={14} />
            <span className="text-xs font-semibold text-ink-500">Cerita #{idx + 1}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
          <Input value={item.title} onChange={(v) => onChange(items.map((x) => (x.id === item.id ? { ...x, title: v } : x)))} placeholder="Judul (contoh: Pertama Bertemu)" />
          <Input value={item.date} onChange={(v) => onChange(items.map((x) => (x.id === item.id ? { ...x, date: v } : x)))} placeholder="Tanggal (contoh: Januari 2019)" />
          <Textarea value={item.description} onChange={(v) => onChange(items.map((x) => (x.id === item.id ? { ...x, description: v } : x)))} rows={2} />
          <ImageInput value={item.photo ?? ""} onChange={(v) => onChange(items.map((x) => (x.id === item.id ? { ...x, photo: v } : x)))} />
        </div>
      ))}
    </div>
  );
}

export function GenericListEditor<T extends { id: string }>({
  label,
  items,
  onChange,
  makeNew,
  render,
}: {
  label: string;
  items: T[];
  onChange: (v: T[]) => void;
  makeNew: () => T;
  render: (item: T, update: (patch: Partial<T>) => void, remove: () => void, idx: number) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <SectionLabel>{label}</SectionLabel>
        <button
          type="button"
          onClick={() => onChange([...items, makeNew()])}
          className="btn btn-outline !py-1.5 !text-xs"
        >
          <Plus size={12} /> Tambah
        </button>
      </div>
      {items.length === 0 && <p className="text-xs text-ink-400">Belum ada data.</p>}
      {items.map((item, idx) => (
        <div key={item.id} className="rounded-xl border border-ink-200 bg-white p-3 space-y-2">
          <div className="flex items-center gap-2 text-ink-300">
            <GripVertical size={14} />
            <span className="text-xs font-semibold text-ink-500">{label} #{idx + 1}</span>
            <button
              type="button"
              onClick={() => onChange(items.filter((x, i) => i !== idx))}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {render(
            item,
            (patch) => onChange(items.map((x) => (x.id === item.id ? { ...x, ...patch } : x))),
            () => onChange(items.filter((x, i) => i !== idx)),
            idx,
          )}
        </div>
      ))}
    </div>
  );
}