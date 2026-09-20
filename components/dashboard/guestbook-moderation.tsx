"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Star, Trash2, XCircle } from "lucide-react";

interface MessageRow {
  id: string;
  guest_name: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  is_featured: boolean;
  created_at: string;
}

export function GuestbookModeration({ initialMessages }: { initialMessages: MessageRow[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [tab, setTab] = useState<"all" | "pending" | "approved">("pending");

  const filtered = messages.filter((m) => tab === "all" || m.status === tab);
  const pendingCount = messages.filter((m) => m.status === "pending").length;

  async function moderate(id: string, status: "approved" | "rejected") {
    await fetch(`/api/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, status } : m)));
    router.refresh();
  }

  async function toggleFeatured(id: string) {
    await fetch(`/api/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: true }),
    });
  }

  async function remove(id: string) {
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    setMessages((ms) => ms.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {(["pending", "approved", "all"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
              tab === t ? "bg-ink-900 text-white" : "bg-white text-ink-500 border border-ink-200"
            }`}
          >
            {t === "pending" ? `Menunggu (${pendingCount})` : t === "approved" ? "Disetujui" : "Semua"}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-ink-200 bg-white p-8 text-center text-sm text-ink-400">
          Belum ada pesan.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((m) => (
          <div key={m.id} className="rounded-2xl border border-ink-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-ink-800">{m.guest_name}</p>
              {m.is_featured && <Star size={13} className="text-gold-500" />}
              <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                m.status === "approved" ? "bg-green-100 text-green-700" : m.status === "rejected" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-700"
              }`}>
                {m.status}
              </span>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm text-ink-600">{m.message}</p>
            <p className="mt-2 text-[11px] text-ink-400">{new Date(m.created_at).toLocaleString("id-ID")}</p>
            <div className="mt-3 flex items-center gap-1.5">
              {m.status !== "approved" && (
                <button onClick={() => moderate(m.id, "approved")} className="btn btn-outline !py-1.5 !text-xs !text-green-700">
                  <CheckCircle2 size={13} /> Setujui
                </button>
              )}
              {m.status !== "rejected" && (
                <button onClick={() => moderate(m.id, "rejected")} className="btn btn-outline !py-1.5 !text-xs !text-red-600">
                  <XCircle size={13} /> Tolak
                </button>
              )}
              <button
                onClick={() => toggleFeatured(m.id)}
                className="btn btn-outline !py-1.5 !text-xs"
                title="Sematkan"
              >
                <Star size={13} /> Pin
              </button>
              <button onClick={() => remove(m.id)} className="ml-auto btn btn-ghost !px-2 !py-1 text-red-400" title="Hapus">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}