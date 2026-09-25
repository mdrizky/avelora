import { Music2 } from "lucide-react";
import { MusicRow } from "@/components/admin/music-row";
import { requireAdmin } from "@/lib/auth/session";
import { getData } from "@/lib/db";

export default async function AdminMusicPage() {
  await requireAdmin();
  const tracks = getData().music_tracks;
  return <div className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">Audio library</p><h1 className="mt-2 flex items-center gap-2 text-3xl font-extrabold tracking-tight text-ink-900"><Music2 size={28} className="text-gold-500" /> Musik</h1><p className="mt-2 text-sm text-ink-500">Kelola URL audio dan lisensi musik yang tersedia di undangan.</p></div><div className="space-y-3">{tracks.map((track) => <MusicRow key={track.id} id={track.id} title={track.title} artist={track.artist} audioUrl={track.audio_url} />)}</div></div>;
}