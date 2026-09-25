"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ModerationActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function moderate(status: "approved" | "rejected") {
    setBusy(true);
    await fetch(`/api/messages/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setBusy(false);
    router.refresh();
  }
  return <div className="flex gap-2"><button disabled={busy} onClick={() => moderate("approved")} className="btn btn-outline !border-emerald-200 !px-3 !py-1.5 !text-emerald-700">Setujui</button><button disabled={busy} onClick={() => moderate("rejected")} className="btn btn-outline !border-red-200 !px-3 !py-1.5 !text-red-600">Tolak</button></div>;
}