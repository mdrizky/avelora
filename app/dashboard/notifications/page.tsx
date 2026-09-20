import { requireUser } from "@/lib/auth/session";
import { listNotifications } from "@/lib/db";
import { timeAgo } from "@/lib/theme";
import { MarkAllReadButton } from "@/components/dashboard/mark-read";

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = listNotifications(user.id);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Notifikasi</h1>
          <p className="mt-1 text-sm text-ink-500">
            {unread > 0 ? `${unread} belum dibaca` : "Semua sudah dibaca"}
          </p>
        </div>
        <MarkAllReadButton disabled={unread === 0} />
      </div>
      <div className="card-subtle overflow-hidden rounded-2xl border border-ink-100 bg-white">
        {notifications.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-500">Belum ada notifikasi.</p>
        ) : (
          <ul className="divide-y divide-ink-100">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start gap-3 px-5 py-4">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-ink-200" : "bg-gold-500"}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-ink-900">{n.title}</p>
                  <p className="text-sm text-ink-500">{n.body}</p>
                  <p className="mt-0.5 text-xs text-ink-300">{timeAgo(n.created_at)}</p>
                </div>
                {n.link && (
                  <a href={n.link} className="text-sm font-semibold text-gold-600 hover:underline">
                    Buka →
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}