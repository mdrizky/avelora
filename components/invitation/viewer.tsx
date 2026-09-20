"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  ChevronDown,
  Copy,
  Gift,
  Heart,
  MapPin,
  MessageSquareHeart,
  Music,
  PartyPopper,
  ScrollText,
  Send,
  Users,
} from "lucide-react";
import { FONT_CLASS } from "@/lib/theme";

type Props = ViewerProps;

import type { ViewerProps } from "./viewer-props";

const SAMPLE_IMG = (u: string) =>
  u ||
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=75";

function formatInvDate(iso: string, time?: string) {
  const d = new Date(iso.includes("T") ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const date = d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return time ? `${date} • ${time}` : date;
}

function targetDiff(target: string) {
  const t = new Date(target).getTime();
  const now = Date.now();
  const diff = Math.max(0, t - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Countdown({ target }: { target: string }) {
  const [left, setLeft] = useState(() => targetDiff(target));
  useEffect(() => {
    const t = setInterval(() => setLeft(targetDiff(target)), 1000);
    if (new Date(target).getTime() <= Date.now()) clearInterval(t);
    return () => clearInterval(t);
  }, [target]);

  const boxes = [
    { label: "Hari", value: left.days },
    { label: "Jam", value: left.hours },
    { label: "Menit", value: left.minutes },
    { label: "Detik", value: left.seconds },
  ];

  if (!left.days && !left.hours && !left.minutes && !left.seconds) {
    return null;
  }
  return (
    <div className="grid w-full max-w-md grid-cols-4 gap-3" style={{ color: "var(--inv-fg)" }}>
      {boxes.map((b) => (
        <div key={b.label} className="rounded-2xl border py-3 text-center" style={{ borderColor: "var(--inv-soft)" }}>
          <p className="text-2xl font-extrabold tabular-nums sm:text-3xl">{String(b.value).padStart(2, "0")}</p>
          <p className="mt-1 text-[10px] uppercase tracking-widest" style={{ color: "var(--inv-muted)" }}>
            {b.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  }
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors"
      style={{ background: "var(--inv-soft)", color: "var(--inv-primary)" }}
    >
      {copied ? <PartyPopper size={12} /> : <Copy size={12} />}
      {copied ? "Tersalin!" : "Salin"}
    </button>
  );
}

function RsvpForm({ invitationId, guestSlug }: { invitationId: string; guestSlug?: string }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"attending" | "not_attending" | "maybe" | "">("");
  const [count, setCount] = useState(1);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name.trim() || !status) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          invitation_id: invitationId,
          guest_slug: guestSlug,
          name: name.trim(),
          status,
          attending_count: status === "attending" ? count : 0,
          special_request: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div
        className="mx-auto w-full max-w-md rounded-3xl p-8 text-center"
        style={{ background: "var(--inv-bg)", border: "1px solid var(--inv-soft)" }}
      >
        <Heart size={36} className="mx-auto" style={{ color: "var(--inv-primary)" }} />
        <p className="mt-4 text-lg font-bold" style={{ color: "var(--inv-fg)" }}>
          Terima kasih!
        </p>
        <p className="mt-1 text-sm" style={{ color: "var(--inv-muted)" }}>
          Konfirmasi Anda sudah kami terima. Sampai jumpa di acara kami.
        </p>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-md rounded-3xl p-6 sm:p-8"
      style={{ background: "var(--inv-bg)", border: "1px solid var(--inv-soft)" }}
    >
      <p className="mb-5 text-center text-sm font-semibold" style={{ color: "var(--inv-fg)" }}>
        Isi form di bawah untuk mengonfirmasi kehadiran Anda
      </p>
      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama Anda"
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
          style={{ borderColor: "var(--inv-soft)", background: "#fff", color: "#1f1a15" }}
        />
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { k: "attending", label: "Hadir", icon: "✓" },
              { k: "maybe", label: "Ragu", icon: "?" },
              { k: "not_attending", label: "Berhalangan", icon: "✕" },
            ] as const
          ).map((o) => (
            <button
              key={o.k}
              type="button"
              onClick={() => setStatus(o.k)}
              className="rounded-xl border py-2.5 text-sm font-semibold transition-all"
              style={{
                borderColor: status === o.k ? "var(--inv-primary)" : "var(--inv-soft)",
                background: status === o.k ? "var(--inv-primary)" : "#fff",
                color: status === o.k ? "#fff" : "var(--inv-fg)",
              }}
            >
              {o.label}
            </button>
          ))}
        </div>
        {status === "attending" && (
          <div className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ borderColor: "var(--inv-soft)" }}>
            <span className="text-sm" style={{ color: "var(--inv-fg)" }}>Jumlah orang</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCount((c) => Math.max(1, c - 1))}
                className="grid h-8 w-8 place-items-center rounded-full border"
                style={{ borderColor: "var(--inv-soft)" }}
              >
                −
              </button>
              <span className="w-6 text-center font-bold">{count}</span>
              <button
                onClick={() => setCount((c) => Math.min(10, c + 1))}
                className="grid h-8 w-8 place-items-center rounded-full border"
                style={{ borderColor: "var(--inv-soft)" }}
              >
                +
              </button>
            </div>
          </div>
        )}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ucapan / kebutuhan khusus (opsional)"
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
          style={{ borderColor: "var(--inv-soft)", background: "#fff", color: "#1f1a15" }}
          rows={2}
        />
        {error && <p className="text-center text-xs text-red-500">{error}</p>}
        <button
          type="button"
          onClick={submit}
          disabled={busy || !name.trim() || !status}
          className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-opacity disabled:opacity-50"
          style={{ background: "var(--inv-primary)" }}
        >
          {busy ? "Mengirim…" : "Kirim Konfirmasi"}
        </button>
      </div>
    </div>
  );
}

function GuestbookForm({ invitationId, guestSlug, autoApprove }: { invitationId: string; guestSlug?: string; autoApprove: boolean }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!name.trim() || message.trim().length < 2) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          invitation_id: invitationId,
          guest_slug: guestSlug,
          guest_name: name.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim pesan");
      setDone(autoApprove ? (data.message ?? "Ucapan terkirim") : "Ucapan terkirim dan menunggu moderasi");
      setName("");
      setMessage("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p
        className="mx-auto w-full max-w-md rounded-2xl p-5 text-center text-sm font-semibold"
        style={{ background: "var(--inv-soft)", color: "var(--inv-primary)" }}
      >
        {done}
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl p-6" style={{ background: "var(--inv-bg)", border: "1px solid var(--inv-soft)" }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nama Anda"
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
        style={{ borderColor: "var(--inv-soft)", background: "#fff", color: "#1f1a15" }}
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tuliskan doa dan ucapan terbaik Anda…"
        rows={3}
        className="mt-3 w-full rounded-xl border px-4 py-3 text-sm outline-none"
        style={{ borderColor: "var(--inv-soft)", background: "#fff", color: "#1f1a15" }}
      />
      {error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={busy || !name.trim() || message.trim().length < 2}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-opacity disabled:opacity-50"
        style={{ background: "var(--inv-primary)" }}
      >
        <Send size={14} /> {busy ? "Mengirim…" : "Kirim Ucapan"}
      </button>
    </div>
  );
}

export function Viewer(props: Props) {
  const {
    invitation,
    schedules,
    gallery,
    gifts,
    messages,
    guestName,
    guestSlug,
    musicTrack,
    invitationId,
  } = props;
  const content = invitation.content_data;
  const pal = invitation.theme_config.palette;
  const font = invitation.theme_config.font;
  const themeStyle = {
    ["--inv-bg" as string]: pal.background,
    ["--inv-fg" as string]: pal.foreground,
    ["--inv-primary" as string]: pal.primary,
    ["--inv-accent" as string]: pal.accent,
    ["--inv-soft" as string]: pal.soft,
    ["--inv-muted" as string]: pal.muted,
  } as React.CSSProperties;

  const [opened, setOpened] = useState(false);
  const [musicOn, setMusicOn] = useState(false);

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ invitation_id: invitationId }),
    }).catch(() => {});
  }, [invitationId]);

  const cover = content.cover;
  const couple = content.couple;
  const child = content.child;
  const graduate = content.graduate;
  const birthday = content.birthday;
  const event = content.event;
  const story = content.story;
  const rsvpCfg = content.rsvp;
  const giftCfg = content.gift;
  const guestbookCfg = content.guestbook;
  const inviteDate = invitation.event_date ? `${invitation.event_date}T12:00:00` : null;

  const romanceClause = couple
    ? `${couple.groomName} & ${couple.brideName}`
    : child
      ? child.childName
      : birthday
        ? birthday.birthdayName
        : graduate
          ? graduate.graduateName
          : event
            ? event.name
            : cover.title;

  return (
    <div
      className={`${FONT_CLASS[font]} min-h-screen`}
      style={themeStyle}
    >
      {/* Cover splash */}
      {!opened && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center" style={{ background: pal.background, color: pal.foreground }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{ background: `radial-gradient(circle at 50% 30%, ${pal.primary}, transparent 60%)` }} />
          {cover.cover_image && (
            <div className="relative mb-6 h-40 w-40 overflow-hidden rounded-full border-4 sm:h-48 sm:w-48" style={{ borderColor: pal.soft }}>
              <Image src={SAMPLE_IMG(cover.cover_image)} alt="cover" fill className="object-cover" sizes="200px" priority />
            </div>
          )}
          <p className="text-xs uppercase tracking-[0.4em]" style={{ color: pal.muted }}>{cover.subtitle}</p>
          <h1 className={`${FONT_CLASS[font]} mt-3 text-5xl leading-tight sm:text-6xl`} style={{ color: pal.primary }}>
            {romanceClause}
          </h1>
          {guestName && (
            <p className="mt-6 text-sm" style={{ color: pal.foreground }}>
              Kepada <span className="text-base font-bold">{guestName}</span>
            </p>
          )}
          {invitation.event_date && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest" style={{ color: pal.muted }}>
              <CalendarDays size={13} /> {inviteDate ? formatInvDate(inviteDate) : invitation.event_date}
            </p>
          )}
          <button
            onClick={() => {
              setOpened(true);
              if (musicTrack?.audio_url) setMusicOn(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-transform hover:scale-105"
            style={{ background: pal.primary }}
          >
            <ScrollText size={16} /> Buka Undangan
          </button>
          <p className="absolute bottom-6 animate-bounce" style={{ color: pal.muted }}>
            <ChevronDown size={20} />
          </p>
        </div>
      )}

      {/* Floating music */}
      {musicTrack && opened && (
        <button
          onClick={() => setMusicOn((v) => !v)}
          className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full text-white shadow-lg transition-transform hover:scale-110"
          style={{ background: pal.primary }}
          title={musicTrack.title}
        >
          <Music size={18} className={musicOn ? "animate-pulse" : ""} />
        </button>
      )}
      {musicTrack?.audio_url && musicOn && (
        <audio src={musicTrack.audio_url} autoPlay loop className="hidden" />
      )}

      {/* Header ribbon */}
      <header className="sticky top-0 z-30 border-b py-3 backdrop-blur" style={{ background: `${pal.background}cc`, borderColor: pal.soft }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: pal.primary }}>
            Avelora
          </p>
          <p className="text-xs" style={{ color: pal.muted }}>{cover.subtitle}</p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:pt-12">
        {/* Greeting */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color: pal.muted }}>
            {couple?.greeting ?? "Assalamu'alaikum warahmatullahi wabarakatuh"}
          </p>
          <h2 className={`${FONT_CLASS[font]} mt-4 text-4xl sm:text-5xl`} style={{ color: pal.primary }}>
            {romanceClause}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed" style={{ color: pal.foreground }}>
            {cover.opening_text ??
              "Tanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir di momen bahagia kami. Merupakan suatu kehormatan dan kebahagiaan apabila Anda berkenan hadir."}
          </p>
          {guestName && (
            <p className="mx-auto mt-6 max-w-md rounded-full px-4 py-2 text-sm" style={{ background: pal.soft, color: pal.primary }}>
              Untuk <span className="font-bold">{guestName}</span> — kami sangat menantikan Anda.
            </p>
          )}
        </div>

        {/* Couple */}
        {couple && (
          <section className="mt-16 text-center">
            <SectionLabel>Mempelai</SectionLabel>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                { name: couple.groomName, full: couple.groomFullName, parents: couple.groomParents, photo: couple.groomPhoto, m: "Pria" },
                { name: couple.brideName, full: couple.brideFullName, parents: couple.brideParents, photo: couple.bridePhoto, m: "Wanita" },
              ].map((p) => (
                <div key={p.m}>
                  <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full border-4" style={{ borderColor: pal.soft }}>
                    <Image src={SAMPLE_IMG(p.photo ?? (p.m === "Pria" ? "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=75" : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=75"))} alt={p.name} fill className="object-cover" sizes="160px" />
                  </div>
                  <p className="mt-4 text-[11px] uppercase tracking-widest" style={{ color: pal.muted }}>
                    {p.m === "Pria" ? "Mempelai Pria" : "Mempelai Wanita"}
                  </p>
                  <h3 className={`${FONT_CLASS[font]} mt-1 text-2xl`} style={{ color: pal.primary }}>{p.name}</h3>
                  {p.full && <p className="mt-0.5 text-sm font-semibold" style={{ color: pal.foreground }}>{p.full}</p>}
                  <p className="mt-2 text-xs" style={{ color: pal.muted }}>{p.parents}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Child / birthday / graduate / event intro */}
        {child && (
          <section className="mt-16 text-center">
            <SectionLabel>Ananda</SectionLabel>
            <div className="relative mx-auto mt-6 h-44 w-44 overflow-hidden rounded-full border-4" style={{ borderColor: pal.soft }}>
              <Image src={SAMPLE_IMG(child.photo ?? "")} alt={child.childName} fill className="object-cover" sizes="180px" />
            </div>
            <h3 className={`${FONT_CLASS[font]} mt-4 text-3xl`} style={{ color: pal.primary }}>{child.childName}</h3>
            <p className="mt-2 text-sm" style={{ color: pal.muted }}>{child.childParents}</p>
            {child.age && (
              <p className="mt-1 text-sm font-semibold" style={{ color: pal.foreground }}>{child.age}</p>
            )}
          </section>
        )}

        {birthday && (
          <section className="mt-16 text-center">
            <SectionLabel>Birthday</SectionLabel>
            <div className="relative mx-auto mt-6 h-44 w-44 overflow-hidden rounded-full border-4" style={{ borderColor: pal.soft }}>
              <Image src={SAMPLE_IMG(birthday.photo ?? "")} alt={birthday.birthdayName} fill className="object-cover" sizes="180px" />
            </div>
            <h3 className={`${FONT_CLASS[font]} mt-4 text-3xl`} style={{ color: pal.primary }}>{birthday.birthdayName}</h3>
            {birthday.age && (
              <p className="mt-2 text-sm font-semibold" style={{ color: pal.foreground }}>Berusia {birthday.age} tahun</p>
            )}
          </section>
        )}

        {graduate && (
          <section className="mt-16 text-center">
            <SectionLabel>Wisuda</SectionLabel>
            <div className="relative mx-auto mt-6 h-44 w-44 overflow-hidden rounded-full border-4" style={{ borderColor: pal.soft }}>
              <Image src={SAMPLE_IMG(graduate.photo ?? "")} alt={graduate.graduateName} fill className="object-cover" sizes="180px" />
            </div>
            <h3 className={`${FONT_CLASS[font]} mt-4 text-3xl`} style={{ color: pal.primary }}>{graduate.graduateName}</h3>
            {graduate.degree && <p className="mt-2 text-sm font-semibold" style={{ color: pal.foreground }}>{graduate.degree}</p>}
            {graduate.school && <p className="mt-1 text-sm" style={{ color: pal.muted }}>{graduate.school}</p>}
          </section>
        )}

        {event && (
          <section className="mt-16 text-center">
            <SectionLabel>Acara</SectionLabel>
            <h3 className={`${FONT_CLASS[font]} mt-4 text-3xl`} style={{ color: pal.primary }}>{event.name}</h3>
            {event.description && (
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed" style={{ color: pal.foreground }}>
                {event.description}
              </p>
            )}
          </section>
        )}

        {/* Countdown */}
        {inviteDate && (
          <section className="mt-16 text-center">
            <SectionLabel>Menuju Hari H</SectionLabel>
            <div className="mt-6 flex justify-center">
              <Countdown target={inviteDate} />
            </div>
          </section>
        )}

        {/* Story */}
        {story && story.items.length > 0 && (
          <section className="mt-16">
            <div className="text-center">
              <SectionLabel>Cerita Kami</SectionLabel>
              <h3 className={`${FONT_CLASS[font]} mt-2 text-3xl`} style={{ color: pal.primary }}>{story.title}</h3>
            </div>
            <div className="relative mt-10 space-y-10 pl-6">
              <span className="absolute left-[7px] top-2 h-[calc(100%-16px)] w-px" style={{ background: pal.soft }} />
              {story.items.map((item, i) => (
                <div key={item.id || i} className="relative">
                  <span className="absolute -left-6 top-2 grid h-3.5 w-3.5 place-items-center rounded-full border-2" style={{ borderColor: pal.primary, background: pal.background }} />
                  <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
                    {item.photo ? (
                      <div className="relative h-24 overflow-hidden rounded-xl sm:h-full">
                        <Image src={SAMPLE_IMG(item.photo)} alt={item.title} fill className="object-cover" sizes="160px" />
                      </div>
                    ) : null}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: pal.primary }}>{item.date}</p>
                      <h4 className="mt-1 font-bold" style={{ color: pal.foreground }}>{item.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed" style={{ color: pal.muted }}>{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Schedule */}
        {schedules.length > 0 && (
          <section className="mt-16">
            <div className="text-center">
              <SectionLabel>Rundown &amp; Lokasi</SectionLabel>
              <h3 className={`${FONT_CLASS[font]} mt-2 text-3xl`} style={{ color: pal.primary }}>Waktu Acara</h3>
            </div>
            <div className="mt-8 space-y-4">
              {schedules.map((s) => (
                <div key={s.id} className="rounded-3xl p-5" style={{ background: pal.background, border: `1px solid ${pal.soft}` }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: pal.primary }}>{s.label}</p>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-sm" style={{ color: pal.foreground }}>
                        <CalendarDays size={14} /> {formatInvDate(s.event_date, s.start_time)}
                      </p>
                      <p className="mt-1 text-sm" style={{ color: pal.foreground }}>{s.location_name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs" style={{ color: pal.muted }}>
                        <MapPin size={12} /> {s.address}
                      </p>
                    </div>
                  </div>
                  {s.maps_url && (
                    <a
                      href={s.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold text-white transition-transform hover:scale-105"
                      style={{ background: pal.primary }}
                    >
                      <MapPin size={13} /> Buka Peta
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section className="mt-16">
            <div className="text-center">
              <SectionLabel>Galeri</SectionLabel>
              <h3 className={`${FONT_CLASS[font]} mt-2 text-3xl`} style={{ color: pal.primary }}>Foto Kami</h3>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {gallery.map((g) => (
                <div key={g.id} className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image src={SAMPLE_IMG(g.url)} alt="gallery" fill className="object-cover transition-transform hover:scale-105" sizes="240px" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* RSVP */}
        <section className="mt-16">
          <div className="text-center">
            <SectionLabel><CalendarDays size={13} /> Konfirmasi</SectionLabel>
            <h3 className={`${FONT_CLASS[font]} mt-2 text-3xl`} style={{ color: pal.primary }}>
              {rsvpCfg?.header ?? "Apakah Anda berkenan hadir?"}
            </h3>
          </div>
          <div className="mt-7">
            <RsvpForm invitationId={invitationId} guestSlug={guestSlug} />
          </div>
        </section>

        {/* Gift */}
        {gifts.length > 0 && (
          <section className="mt-16">
            <div className="text-center">
              <SectionLabel><Gift size={13} /> {giftCfg?.header ?? "Tanda Perhatian"}</SectionLabel>
              <h3 className={`${FONT_CLASS[font]} mt-2 text-3xl`} style={{ color: pal.primary }}>Amplop Digital</h3>
              <p className="mx-auto mt-3 max-w-md text-sm" style={{ color: pal.muted }}>
                {giftCfg?.message}
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {gifts.map((g) => (
                <div key={g.id} className="flex items-center justify-between gap-3 rounded-2xl p-4" style={{ background: pal.background, border: `1px solid ${pal.soft}` }}>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: pal.primary }}>
                      {g.type === "bank" ? g.bank_name : g.type === "ewallet" ? g.provider : "QRIS"}
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold" style={{ color: pal.foreground }}>
                      {g.account_number ?? g.phone ?? "QRIS"}
                    </p>
                    {g.account_name && <p className="text-xs" style={{ color: pal.muted }}>{g.account_name}</p>}
                  </div>
                  <CopyButton text={g.account_number ?? g.phone ?? ""} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Guestbook */}
        <section className="mt-16">
          <div className="text-center">
            <SectionLabel><MessageSquareHeart size={13} /> {guestbookCfg?.header ?? "Buku Tamu"}</SectionLabel>
            <h3 className={`${FONT_CLASS[font]} mt-2 text-3xl`} style={{ color: pal.primary }}>Ucapan &amp; Doa</h3>
          </div>
          <div className="mt-7 grid gap-3">
            {messages.map((m) => (
              <div key={m.id} className="rounded-2xl px-5 py-4" style={{ background: pal.background, border: `1px solid ${pal.soft}` }}>
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white" style={{ background: pal.primary }}>
                    {m.guest_name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <p className="text-sm font-bold" style={{ color: pal.foreground }}>{m.guest_name}</p>
                  {m.is_featured && <Heart size={12} fill="currentColor" style={{ color: pal.primary }} />}
                </div>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: pal.muted }}>{m.message}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="py-6 text-center text-sm" style={{ color: pal.muted }}>Belum ada ucapan. Jadilah yang pertama!</p>
            )}
          </div>
          <div className="mt-6">
            <GuestbookForm invitationId={invitationId} guestSlug={guestSlug} autoApprove={guestbookCfg?.auto_approve ?? false} />
          </div>
        </section>

        {/* Closing */}
        <section className="mt-16 text-center">
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color: pal.muted }}>Terima Kasih</p>
          <h3 className={`${FONT_CLASS[font]} mt-3 text-4xl`} style={{ color: pal.primary }}>{romanceClause}</h3>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed" style={{ color: pal.foreground }}>
            Doa restu dan kehadiran Anda adalah hadiah terindah bagi kami.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-xs" style={{ color: pal.muted }}>
            <Users size={12} /> {invitation.city || "Pekanbaru"} • {invitation.timezone}
          </div>
        </section>
      </div>

      <footer className="border-t py-6 text-center" style={{ borderColor: pal.soft }}>
        <p className="text-xs" style={{ color: pal.muted }}>
          Dibuat dengan <span className="font-bold" style={{ color: pal.primary }}>❤ AVELORA</span>
        </p>
      </footer>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.35em]" style={{ color: "var(--inv-primary)" }}>
      {children}
    </p>
  );
}