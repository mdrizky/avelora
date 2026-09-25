"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

export function OrderAction({ id, status, label }: { id: string; status: "paid" | "refunded"; label: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  async function run() {
    setBusy(true);
    await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "update_order", id, order_status: status }) });
    setBusy(false);
    setOpen(false);
    router.refresh();
  }
  return <><button disabled={busy} onClick={() => setOpen(true)} className="btn btn-outline !px-3 !py-1.5 !text-xs">{busy ? "..." : label}</button><ConfirmDialog open={open} title={`${label} order`} description={`Tindakan ${label.toLowerCase()} akan dicatat di audit log.`} busy={busy} onCancel={() => setOpen(false)} onConfirm={run} /></>;
}