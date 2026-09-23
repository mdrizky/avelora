import "server-only";
import type {
  AnalyticsEvent,
  DBData,
  Guest,
  Invitation,
  InvitationStatus,
  Profile,
  RsvpStatus,
  Template,
} from "./types";
import { getData, mutate, uid } from "./store";

export { getData };

/* ---------------------------------- utils --------------------------------- */

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

function uniqueSlug(base: string, taken: (s: string) => boolean): string {
  let slug = base || "undangan";
  let i = 2;
  while (taken(slug)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

function guestCode(): string {
  return `AVL-${Math.floor(10000 + Math.random() * 90000)}`;
}

/* ---------------------------------- users --------------------------------- */

export function getUserByEmail(email: string): Profile | undefined {
  return getData().profiles.find((p) => p.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): Profile | undefined {
  return getData().profiles.find((p) => p.id === id);
}

export function createUser(input: {
  email: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  role?: Profile["role"];
}): Profile {
  const existing = getData().profiles.find(
    (p) => p.email.toLowerCase() === input.email.toLowerCase(),
  );
  if (existing) throw new Error("auth/email-exists");
  const profile: Profile = {
    id: `u-${uid()}`,
    email: input.email,
    first_name: input.first_name,
    last_name: input.last_name,
    role: input.role ?? "user",
    password_hash: input.password_hash,
    is_verified: false,
    is_suspended: false,
    created_at: new Date().toISOString(),
  };
  mutate((d) => d.profiles.push(profile));
  return profile;
}

/* ------------------------------ catalog (templates) ----------------------- */

export function listCategories() {
  return getData().event_categories.filter((c) => c.is_active);
}

export function getCategory(id: string) {
  return getData().event_categories.find((c) => c.id === id);
}

export function listTemplates(filter?: { category_id?: string; premium?: boolean; q?: string }) {
  return getData().templates.filter((t) => {
    if (!t.is_active) return false;
    if (filter?.category_id && t.category_id !== filter.category_id) return false;
    if (filter?.premium !== undefined && t.is_premium !== filter.premium) return false;
    if (filter?.q && !t.name.toLowerCase().includes(filter.q.toLowerCase())) return false;
    return true;
  });
}

export function getTemplate(id: string) {
  return getData().templates.find((t) => t.id === id);
}

export function listPlans() {
  return getData().plans.filter((p) => p.is_active);
}

export function getPlan(id: string) {
  return getData().plans.find((p) => p.id === id);
}

export function getMusicTrack(id: string) {
  return getData().music_tracks.find((m) => m.id === id);
}

/* -------------------------------- invitations ----------------------------- */

function listInvitationRows() {
  return getData().invitations;
}

export function listInvitationsByOwner(ownerId: string) {
  return getData()
    .invitations.filter((i) => i.owner_id === ownerId)
    .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
}

export function getInvitationById(id: string) {
  return getData().invitations.find((i) => i.id === id);
}

export function getInvitationBySlug(slug: string) {
  return getData().invitations.find((i) => i.slug === slug.toLowerCase());
}

function slugTaken(slug: string, ownerId: string) {
  return getData().invitations.some((i) => i.slug === slug && i.owner_id === ownerId);
}

export function createInvitation(input: {
  owner_id: string;
  template_id: string;
  category_id: string;
  title: string;
  content_data: Invitation["content_data"];
  theme_config: Invitation["theme_config"];
  timezone?: string;
  status?: InvitationStatus;
  watermark_enabled?: boolean;
}): Invitation {
  const slug = uniqueSlug(slugify(input.title), (s) => slugTaken(s, input.owner_id));
  const now = new Date().toISOString();
  const invitation: Invitation = {
    id: `inv-${uid()}`,
    owner_id: input.owner_id,
    template_id: input.template_id,
    category_id: input.category_id,
    slug,
    title: input.title,
    status: input.status ?? "draft",
    content_data: input.content_data,
    theme_config: input.theme_config,
    timezone: input.timezone ?? "Asia/Jakarta",
    watermark_enabled: input.watermark_enabled ?? true,
    created_at: now,
    updated_at: now,
  };
  mutate((d) => d.invitations.push(invitation));
  return invitation;
}

export function updateInvitation(
  id: string,
  patch: Partial<Omit<Invitation, "id" | "owner_id" | "created_at">>,
) {
  mutate((d) => {
    const inv = d.invitations.find((i) => i.id === id);
    if (!inv) return;
    Object.assign(inv, patch, { updated_at: new Date().toISOString() });
    if (patch.status === "published" && !inv.published_at) {
      inv.published_at = new Date().toISOString();
    }
  });
  return getInvitationById(id);
}

export function deleteInvitation(id: string) {
  mutate((d) => {
    d.invitations = d.invitations.filter((i) => i.id !== id);
    d.event_schedules = d.event_schedules.filter((s) => s.invitation_id !== id);
    d.gallery_images = d.gallery_images.filter((g) => g.invitation_id !== id);
    d.guests = d.guests.filter((g) => g.invitation_id !== id);
    d.guest_messages = d.guest_messages.filter((m) => m.invitation_id !== id);
    d.gift_accounts = d.gift_accounts.filter((g) => g.invitation_id !== id);
    d.analytics_events = d.analytics_events.filter((a) => a.invitation_id !== id);
    d.checkins = d.checkins.filter((c) => c.invitation_id !== id);
    d.seating_tables = d.seating_tables.filter((t) => t.invitation_id !== id);
  });
  void listInvitationRows;
}

/* ------------------------------ schedules/gallery -------------------------- */

export function listSchedules(invitationId: string) {
  return getData().event_schedules
    .filter((s) => s.invitation_id === invitationId)
    .sort((a, b) => a.order_index - b.order_index);
}

export function saveSchedules(invitationId: string, schedules: Omit<import("./types").EventSchedule, "id" | "invitation_id">[]) {
  mutate((d) => {
    d.event_schedules = d.event_schedules.filter((s) => s.invitation_id !== invitationId);
    schedules.forEach((s, i) =>
      d.event_schedules.push({ ...s, id: `sch-${uid()}`, invitation_id: invitationId, order_index: i + 1 }),
    );
  });
}

export function listGallery(invitationId: string) {
  return getData().gallery_images
    .filter((g) => g.invitation_id === invitationId)
    .sort((a, b) => a.order_index - b.order_index);
}

export function saveGallery(invitationId: string, urls: string[]) {
  mutate((d) => {
    d.gallery_images = d.gallery_images.filter((g) => g.invitation_id !== invitationId);
    urls.forEach((url, i) =>
      d.gallery_images.push({
        id: `img-${uid()}`,
        invitation_id: invitationId,
        image_url: url,
        order_index: i + 1,
        uploaded_at: new Date().toISOString(),
      }),
    );
  });
}

export function listGifts(invitationId: string) {
  return getData().gift_accounts.filter((g) => g.invitation_id === invitationId);
}

export function saveGifts(
  invitationId: string,
  gifts: Omit<import("./types").GiftAccount, "id" | "invitation_id">[],
) {
  mutate((d) => {
    d.gift_accounts = d.gift_accounts.filter((g) => g.invitation_id !== invitationId);
    gifts.forEach((g, i) =>
      d.gift_accounts.push({ ...g, id: `gft-${uid()}`, invitation_id: invitationId, order_index: g.order_index ?? i + 1 }),
    );
  });
}

export function listTables(invitationId: string) {
  return getData().seating_tables.filter((t) => t.invitation_id === invitationId);
}

/* ----------------------------------- guests -------------------------------- */

export function listGuests(invitationId: string) {
  return getData()
    .guests.filter((g) => g.invitation_id === invitationId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export function getGuestById(id: string) {
  return getData().guests.find((g) => g.id === id);
}

export function getGuestBySlug(invitationId: string, guestSlug: string) {
  return getData().guests.find(
    (g) => g.invitation_id === invitationId && g.guest_slug === guestSlug.toLowerCase(),
  );
}

export function getGuestByCode(code: string) {
  const c = code.trim().toUpperCase();
  return getData().guests.find((g) => g.code.toUpperCase() === c);
}

function addGuestRow(d: DBData, input: {
  invitation_id: string;
  name: string;
  phone?: string;
  invited_count?: number;
  category?: string;
  table_number?: string;
}): Guest {
  const base = slugify(input.name) || "tamu";
  const existing = d.guests.filter(
    (g) => g.invitation_id === input.invitation_id && g.guest_slug.startsWith(base),
  );
  const guest_slug = existing.length ? `${base}-${existing.length + 1}` : base;
  const guest: Guest = {
    id: `g-${uid()}`,
    invitation_id: input.invitation_id,
    name: input.name,
    phone: input.phone,
    invited_count: input.invited_count ?? 1,
    category: input.category,
    table_number: input.table_number,
    guest_slug,
    code: guestCode(),
    created_at: new Date().toISOString(),
  };
  d.guests.push(guest);
  d.guest_rsvps.push({
    id: `r-${uid()}`,
    guest_id: guest.id,
    status: "pending",
    attending_count: 0,
  });
  return guest;
}

export function addGuest(input: Parameters<typeof addGuestRow>[1]): Guest {
  let created!: Guest;
  mutate((d) => {
    created = addGuestRow(d, input);
  });
  return created;
}

export function bulkAddGuests(invitationId: string, rows: { name: string; phone?: string }[]): number {
  let count = 0;
  mutate((d) => {
    rows.forEach((r) => {
      addGuestRow(d, { invitation_id: invitationId, ...r });
      count++;
    });
  });
  return count;
}

export function deleteGuest(id: string) {
  mutate((d) => {
    d.guests = d.guests.filter((g) => g.id !== id);
    d.guest_rsvps = d.guest_rsvps.filter((r) => r.guest_id !== id);
  });
}

export function getRsvpByGuestId(guestId: string) {
  return getData().guest_rsvps.find((r) => r.guest_id === guestId);
}

export function setRsvp(guestId: string, input: {
  status: RsvpStatus;
  attending_count?: number;
  meal_preference?: string;
  answers?: Record<string, string>;
  special_request?: string;
}) {
  mutate((d) => {
    const row = d.guest_rsvps.find((r) => r.guest_id === guestId);
    if (!row) return;
    Object.assign(row, input, { responded_at: new Date().toISOString() });
  });
}

export function rsvpStats(invitationId: string) {
  const guestIds = new Set(
    getData().guests.filter((g) => g.invitation_id === invitationId).map((g) => g.id),
  );
  const rsvps = getData().guest_rsvps.filter((r) => guestIds.has(r.guest_id));
  const counts: Record<RsvpStatus, number> = {
    pending: 0,
    attending: 0,
    not_attending: 0,
    maybe: 0,
  };
  let attendingTotal = 0;
  for (const r of rsvps) {
    counts[r.status] += 1;
    if (r.status === "attending") attendingTotal += r.attending_count || 1;
  }
  return { counts, attendingTotal, total: rsvps.length, responded: rsvps.length - counts.pending };
}

/* --------------------------------- messages -------------------------------- */

export function listMessages(invitationId: string, status?: "all" | "pending" | "approved") {
  return getData()
    .guest_messages.filter((m) => m.invitation_id === invitationId)
    .filter((m) => !status || status === "all" || m.status === status)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getMessageById(id: string) {
  return getData().guest_messages.find((m) => m.id === id);
}

export function addMessage(input: {
  invitation_id: string;
  guest_id?: string;
  guest_name: string;
  message: string;
  auto_approve: boolean;
}) {
  mutate((d) => {
    d.guest_messages.push({
      id: `msg-${uid()}`,
      invitation_id: input.invitation_id,
      guest_id: input.guest_id,
      guest_name: input.guest_name,
      message: input.message,
      status: input.auto_approve ? "approved" : "pending",
      is_featured: false,
      created_at: new Date().toISOString(),
    });
    d.analytics_events.push({
      id: `anl-${uid()}`,
      invitation_id: input.invitation_id,
      event_type: "guestbook",
      device: "unknown",
      browser: "unknown",
      occurred_at: new Date().toISOString(),
    });
  });
}

export function moderateMessage(id: string, status: "approved" | "rejected") {
  mutate((d) => {
    const m = d.guest_messages.find((x) => x.id === id);
    if (m) m.status = status;
  });
}

export function deleteMessage(id: string) {
  mutate((d) => {
    d.guest_messages = d.guest_messages.filter((m) => m.id !== id);
  });
}

export function toggleFeaturedMessage(id: string) {
  mutate((d) => {
    const m = d.guest_messages.find((x) => x.id === id);
    if (m) m.is_featured = !m.is_featured;
  });
}

/* --------------------------------- analytics ------------------------------- */

export function recordAnalytics(input: {
  invitation_id: string;
  event_type: AnalyticsEvent["event_type"];
  device?: string;
  browser?: string;
  referrer?: string;
  visitor_hash?: string;
}) {
  mutate((d) => {
    d.analytics_events.push({
      id: `anl-${uid()}`,
      invitation_id: input.invitation_id,
      event_type: input.event_type,
      device: input.device,
      browser: input.browser,
      referrer: input.referrer,
      visitor_hash: input.visitor_hash,
      occurred_at: new Date().toISOString(),
    });
  });
}

export function analyticsFor(invitationId: string) {
  const events = getData().analytics_events.filter((e) => e.invitation_id === invitationId);
  const views = events.filter((e) => e.event_type === "view");
  const unique = new Set(views.map((v) => v.visitor_hash ?? v.browser ?? v.id)).size;
  const byDay: Record<string, number> = {};
  for (const v of views) {
    const day = v.occurred_at.slice(0, 10);
    byDay[day] = (byDay[day] ?? 0) + 1;
  }
  const byDevice: Record<string, number> = {};
  const byBrowser: Record<string, number> = {};
  for (const v of views) {
    byDevice[v.device ?? "unknown"] = (byDevice[v.device ?? "unknown"] ?? 0) + 1;
    byBrowser[v.browser ?? "unknown"] = (byBrowser[v.browser ?? "unknown"] ?? 0) + 1;
  }
  return {
    views: views.length,
    unique,
    rsvps: events.filter((e) => e.event_type === "rsvp").length,
    guestbook: events.filter((e) => e.event_type === "guestbook").length,
    byDay: Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)),
    byDevice,
    byBrowser,
    last7: Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return { day: key, count: byDay[key] ?? 0 };
    }),
  };
}

/* ------------------------------ check-ins/tables --------------------------- */

export function checkIn(guestId: string, byUserId: string) {
  mutate((d) => {
    const g = d.guests.find((x) => x.id === guestId);
    if (!g) return;
    const exists = d.checkins.some((c) => c.guest_id === guestId);
    if (exists) return;
    d.checkins.push({
      id: `ck-${uid()}`,
      invitation_id: g.invitation_id,
      guest_id: guestId,
      guest_code: g.code,
      checked_in_at: new Date().toISOString(),
      checked_in_by: byUserId,
    });
  });
}

export function isCheckedIn(guestId: string) {
  return getData().checkins.some((c) => c.guest_id === guestId);
}

export function listCheckins(invitationId: string) {
  return getData().checkins
    .filter((c) => c.invitation_id === invitationId)
    .sort((a, b) => b.checked_in_at.localeCompare(a.checked_in_at));
}

/* ------------------------------ notifications ------------------------------ */

export function listNotifications(userId: string) {
  return getData()
    .notifications.filter((n) => n.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function unreadNotifications(userId: string) {
  return getData().notifications.filter((n) => n.user_id === userId && !n.read).length;
}

export function markNotificationsRead(userId: string, ids?: string[]) {
  mutate((d) => {
    d.notifications.forEach((n) => {
      if (n.user_id !== userId) return;
      if (ids && !ids.includes(n.id)) return;
      n.read = true;
    });
  });
}

export function pushNotification(input: {
  user_id: string;
  type: "rsvp" | "guestbook" | "order" | "system";
  title: string;
  body: string;
  link?: string;
}) {
  mutate((d) => {
    d.notifications.unshift({
      id: `ntf-${uid()}`,
      ...input,
      read: false,
      created_at: new Date().toISOString(),
    });
  });
}

/* --------------------------- profile / billing ----------------------------- */

export function getSubscription(userId: string) {
  return getData().subscriptions.find(
    (s) => s.owner_id === userId && s.status === "active",
  );
}

export function updateProfile(
  userId: string,
  patch: { first_name?: string; last_name?: string; phone?: string; bio?: string },
) {
  mutate((d) => {
    const p = d.profiles.find((x) => x.id === userId);
    if (p) Object.assign(p, patch);
  });
  return getUserById(userId);
}

export function updatePasswordHash(userId: string, password_hash: string) {
  mutate((d) => {
    const p = d.profiles.find((x) => x.id === userId);
    if (p) p.password_hash = password_hash;
  });
}

export function activatePlan(userId: string, planId: string) {
  const plan = getPlan(planId);
  if (!plan) return null;
  const now = new Date();
  const ends = new Date(now);
  ends.setDate(ends.getDate() + 30);
  mutate((d) => {
    d.subscriptions = d.subscriptions.filter((s) => !(s.owner_id === userId && s.status === "active"));
    d.subscriptions.push({
      id: `sub-${uid()}`,
      owner_id: userId,
      plan_id: plan.id,
      status: "active",
      starts_at: now.toISOString(),
      ends_at: ends.toISOString(),
    });
  });
  return getSubscription(userId);
}

/* ------------------------------ guest update ------------------------------- */

export function updateGuest(
  guestId: string,
  patch: Partial<Pick<Guest, "name" | "phone" | "email" | "invited_count" | "category" | "table_number" | "notes">>,
) {
  mutate((d) => {
    const g = d.guests.find((x) => x.id === guestId);
    if (g) Object.assign(g, patch);
  });
  return getGuestById(guestId);
}

/* -------------------------------- admin ------------------------------------ */

export function toggleEntity(
  collection: "templates" | "plans" | "music_tracks" | "event_categories" | "testimonials",
  id: string,
  isActive: boolean,
) {
  mutate((d) => {
    const row = d[collection].find((x) => x.id === id) as
      | { is_active: boolean }
      | undefined;
    if (row) row.is_active = isActive;
  });
  return true;
}

export function setMusicAudio(id: string, audio_url: string) {
  mutate((d) => {
    const m = d.music_tracks.find((x) => x.id === id);
    if (m) m.audio_url = audio_url;
  });
}

export function createTemplate(input: {
  name: string;
  slug: string;
  category_id: string;
  thumbnail_url?: string;
  is_premium?: boolean;
  price?: number;
}): Template {
  const now = new Date().toISOString();
  const template: Template = {
    id: `tpl-${uid()}`,
    name: input.name.trim(),
    slug: `${input.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now().toString(36)}`,
    category_id: input.category_id,
    thumbnail_url: input.thumbnail_url?.trim() || "",
    theme_config: {
      name: input.name.trim(),
      palette: {
        name: "Avelora Gold",
        background: "#fbf8f2",
        foreground: "#201c19",
        primary: "#b6923f",
        accent: "#d6b86a",
        soft: "#f1e8d4",
        muted: "#8c837b",
      },
      font: "serif",
      layout: "classic",
      animation: "subtle",
    },
    is_premium: input.is_premium ?? false,
    price: input.price ?? 0,
    is_active: true,
    created_by: "u-admin",
    created_at: now,
  };
  mutate((d) => d.templates.push(template));
  return template;
}

export function setUserSuspended(userId: string, suspended: boolean) {
  mutate((d) => {
    const user = d.profiles.find((profile) => profile.id === userId);
    if (user && user.role !== "admin") user.is_suspended = suspended;
  });
  return getUserById(userId);
}

export function listAllMessages(status?: "pending" | "approved" | "all") {
  return getData()
    .guest_messages.filter((m) => !status || status === "all" || m.status === status)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function appendAuditLog(action: string, entityType: string, entityId?: string, metadata?: Record<string, unknown>) {
  mutate((d) => {
    d.audit_logs.unshift({
      id: `al-${uid()}`,
      admin_id: "admin",
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
      created_at: new Date().toISOString(),
    });
  });
}