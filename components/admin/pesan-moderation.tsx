"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, Trash2, X } from "lucide-react";

/**
 * Aksi moderasi pesan/kesan yang dikirim pengguna.
 * Setujui → tayang di landing page + notifikasi ke pengirim.
 */
export function PesanModeration({
  id,
  status,
  isActive,
}: {
  id: string;
  status: "pending" | "approved" | "rejected";
  isActive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | "delete" | "toggle" | null>(null);
  const [error, setError] = useState("");

  async function run(
    kind: "approve" | "reject" | "delete" | "toggle",
    payload: Record<string, unknown>,
  ) {
    setBusy(kind);
    setError("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Aksi gagal.");
        return;
      }
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setBusy(null);
    }
  }

  const pending = status === "pending";
  const shown = status === "approved" && isActive;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {pending && (
          <>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => run("approve", { type: "moderate_testimonial", id, moderation: "approved" })}
              className="btn btn-gold !px-3.5 !py-2 !text-xs"
            >
              {busy === "approve" ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Setujui &amp; Tayangkan
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => run("reject", { type: "moderate_testimonial", id, moderation: "rejected" })}
              className="btn btn-outline !border-red-200 !px-3.5 !py-2 !text-xs !text-red-600 hover:!bg-red-50"
            >
              {busy === "reject" ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              Tolak
            </button>
          </>
        )}
        {!pending && (
          <button
            type="button"
            disabled={busy !== null}
            onClick={() =>
              run("toggle", {
                type: "toggle",
                collection: "testimonials",
                id,
                is_active: !isActive,
              })
            }
            className="btn btn-outline !px-3.5 !py-2 !text-xs"
          >
            {busy === "toggle" ? <Loader2 size={14} className="animate-spin" /> : null}
            {shown ? "Sembunyikan" : "Tampilkan"}
          </button>
        )}
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => run("delete", { type: "delete_testimonial", id })}
          className="btn btn-outline !border-red-200 !px-3.5 !py-2 !text-xs !text-red-600 hover:!bg-red-50"
        >
          {busy === "delete" ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Hapus
        </button>
      </div>
      {error && (
        <p className="animate-shake rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
