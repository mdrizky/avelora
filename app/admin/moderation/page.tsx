import { MessageSquare } from "lucide-react";
import { ModerationActions } from "@/components/admin/moderation-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { requireAdmin } from "@/lib/auth/session";
import { getData, listAllMessages } from "@/lib/db";

export default async function AdminModerationPage() {
  await requireAdmin();
  const messages = listAllMessages("pending");
  const data = getData();
  return <div className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">Content safety</p><h1 className="mt-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-ink-900"><MessageSquare size={28} className="text-gold-500" /> Moderasi Konten</h1><p className="mt-2 text-sm text-ink-500">Review pesan guestbook sebelum tampil di undangan publik.</p></div><div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-ink-100 px-5 py-4"><span className="font-bold text-ink-800">Antrean review</span><StatusBadge tone="pending">{messages.length} pending</StatusBadge></div>{messages.length ? <div className="divide-y divide-ink-100">{messages.map((message) => { const invitation = data.invitations.find((item) => item.id === message.invitation_id); return <article key={message.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-ink-800">{message.guest_name}</p><p className="mt-1 max-w-2xl text-sm leading-6 text-ink-600">{message.message}</p><p className="mt-2 text-xs text-ink-400">Undangan: {invitation?.title ?? message.invitation_id} · {new Date(message.created_at).toLocaleString("id-ID")}</p></div><ModerationActions id={message.id} /></article>; })}</div> : <div className="p-14 text-center"><MessageSquare size={32} className="mx-auto text-ink-300" /><p className="mt-3 font-bold text-ink-800">Antrean bersih</p><p className="mt-1 text-sm text-ink-400">Tidak ada konten yang menunggu moderasi.</p></div>}</div></div>;
}