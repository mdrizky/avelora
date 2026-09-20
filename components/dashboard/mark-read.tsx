"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, LoaderCircle } from "lucide-react";

export function MarkAllReadButton({ disabled }: { disabled: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  if (disabled) return null;

  async function onClick() {
    setLoading(true);
    try {
      await fetch("/api/notifications/read", { method: "PATCH" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={onClick} disabled={loading} className="btn btn-outline !py-2 !text-xs">
      {loading ? <LoaderCircle size={14} className="animate-spin" /> : <CheckCheck size={14} />}
      Tandai semua dibaca
    </button>
  );
}