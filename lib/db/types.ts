/**
 * AVELORA — Data model types.
 *
 * Skema ini memetakan 1:1 ke ERD di PRD.md §11 (tabel Supabase PostgreSQL).
 * Saat adaptor Supabase dipasang, tipe di file ini tetap dipakai — hanya
 * implementasi repository (`lib/db/store.ts`) yang diganti.
 */

export type Role = "user" | "admin";
export type InvitationStatus = "draft" | "published" | "expired" | "memory";
export type RsvpStatus = "pending" | "attending" | "not_attending" | "maybe";
export type MessageStatus = "pending" | "approved" | "rejected";
export type PlanTier = "free" | "basic" | "premium" | "pro";
export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded";
export type DiscountType = "percent" | "amount";
export type UserAccountStatus = "active" | "suspended" | "banned";

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  role: Role;
  password_hash: string;
  is_verified: boolean;
  created_at: string;
  last_login_at?: string;
  is_suspended: boolean;
  is_banned?: boolean;
  warning_count?: number;
  session_version?: number;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  tagline: string;
  is_active: boolean;
}

export interface ThemeConfig {
  name: string;
  /** Warna-warna utama undangan (CSS var-friendly). */
  palette: {
    name?: string;
    background: string;
    foreground: string;
    primary: string;
    accent: string;
    soft: string;
    muted: string;
  };
  font: "serif" | "sans" | "script";
  layout: "classic" | "editorial" | "luxe";
  animation: "subtle" | "none";
}

export interface Template {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  thumbnail_url: string;
  preview_url?: string;
  theme_config: ThemeConfig;
  is_premium: boolean;
  price: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

/** Field dinamis sesuai kategori (mirip `content_data` jsonb di ERD). */
export interface InvitationContent {
  cover: {
    title: string;
    subtitle: string;
    cover_image?: string;
    opening_text?: string;
    show_verses: boolean;
  };
  hero?: {
    photo?: string;
    caption?: string;
  };
  couple?: {
    groomName: string;
    groomFullName?: string;
    groomParents?: string;
    groomPhoto?: string;
    brideName: string;
    brideFullName?: string;
    brideParents?: string;
    bridePhoto?: string;
    greeting?: string;
  };
  child?: {
    childName: string;
    childParents: string;
    age?: string;
    photo?: string;
  };
  graduate?: {
    graduateName: string;
    graduateParents?: string;
    degree?: string;
    school?: string;
    photo?: string;
  };
  birthday?: {
    birthdayName: string;
    age?: string;
    photo?: string;
  };
  event?: {
    name: string;
    description?: string;
    speakers?: { name: string; topic: string }[];
  };
  story?: {
    title: string;
    items: {
      id: string;
      title: string;
      date: string;
      description: string;
      photo?: string;
    }[];
  };
  rsvp?: {
    header: string;
    require_phone: boolean;
    questions: {
      id: string;
      label: string;
      type: "meal" | "yes_no" | "text";
      choices?: string[];
      required: boolean;
    }[];
  };
  gift?: {
    header: string;
    message: string;
  };
  guestbook?: {
    header: string;
    message: string;
    auto_approve: boolean;
  };
  music?: {
    track_id?: string;
    autoplay: boolean;
  };
  [key: string]: unknown;
}

export interface Invitation {
  id: string;
  owner_id: string;
  template_id: string;
  category_id: string;
  slug: string;
  title: string;
  status: InvitationStatus;
  content_data: InvitationContent;
  theme_config: ThemeConfig;
  music_track_id?: string;
  timezone: string;
  event_date?: string;
  city?: string;
  custom_url_enabled?: boolean;
  watermark_enabled?: boolean;
  remove_branding?: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EventSchedule {
  id: string;
  invitation_id: string;
  label: string;
  event_date: string;
  start_time: string;
  end_time?: string;
  location_name: string;
  address: string;
  maps_url: string;
  map_embed_url?: string;
  order_index: number;
}

export interface GalleryImage {
  id: string;
  invitation_id: string;
  image_url: string;
  order_index: number;
  uploaded_at: string;
}

export interface Guest {
  id: string;
  invitation_id: string;
  name: string;
  phone?: string;
  email?: string;
  guest_slug: string;
  invited_count: number;
  category?: string;
  table_number?: string;
  notes?: string;
  code: string;
  created_at: string;
}

export interface GuestRsvp {
  id: string;
  guest_id: string;
  status: RsvpStatus;
  attending_count: number;
  meal_preference?: string;
  answers?: Record<string, string>;
  special_request?: string;
  responded_at?: string;
}

export interface GuestMessage {
  id: string;
  invitation_id: string;
  guest_id?: string;
  guest_name: string;
  message: string;
  status: MessageStatus;
  is_featured: boolean;
  created_at: string;
}

export interface GiftAccount {
  id: string;
  invitation_id: string;
  type: "bank" | "qris" | "ewallet";
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  provider?: string; // QRIS / OVO / GoPay / DANA / ShopeePay
  phone?: string;
  qris_image_url?: string;
  order_index: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  category: string;
  audio_url: string;
  duration?: string;
  license_note: string;
  is_active: boolean;
  uploaded_by?: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  invitation_id: string;
  event_type: "view" | "rsvp" | "guestbook";
  device?: string;
  browser?: string;
  referrer?: string;
  visitor_hash?: string;
  occurred_at: string;
}

export interface Checkin {
  id: string;
  invitation_id: string;
  guest_id: string;
  guest_code: string;
  checked_in_at: string;
  checked_in_by: string;
}

export interface SeatingTable {
  id: string;
  invitation_id: string;
  table_name: string;
  capacity: number;
}

export interface Plan {
  id: string;
  name: PlanTier;
  display_name: string;
  price: number;
  period: string;
  features: Record<string, boolean | number | string>;
  is_active: boolean;
}

export interface Subscription {
  id: string;
  owner_id: string;
  plan_id: string;
  status: "active" | "expired";
  starts_at: string;
  ends_at: string;
}

export interface Order {
  id: string;
  owner_id: string;
  invitation_id?: string;
  plan_id: string;
  coupon_id?: string;
  amount: number;
  status: OrderStatus;
  payment_method?: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  quota: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  device?: string;
  ip_address?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Broadcast {
  id: string;
  admin_id: string;
  title: string;
  body: string;
  target: string;
  recipient_count: number;
  sent_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: "draft" | "published";
  author_id: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentReport {
  id: string;
  reporter_id?: string;
  entity_type: string;
  entity_id: string;
  reason: string;
  status: "pending" | "reviewed" | "dismissed";
  created_at: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  updated_by?: string;
  updated_at: string;
}

export interface PaymentGatewayConfig {
  id: string;
  provider: "midtrans" | "xendit";
  mode: "sandbox" | "live";
  public_key?: string;
  secret_key?: string;
  is_active: boolean;
  updated_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: "rsvp" | "guestbook" | "order" | "system";
  title: string;
  body: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  content: string;
  rating: number;
  is_active: boolean;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  is_active: boolean;
}

export interface PasswordResetToken {
  token: string;
  email: string;
  expires_at: string;
}

export interface VerifyToken {
  token: string;
  email: string;
  expires_at: string;
}

export interface DBData {
  version: number;
  profiles: Profile[];
  event_categories: EventCategory[];
  templates: Template[];
  invitations: Invitation[];
  event_schedules: EventSchedule[];
  gallery_images: GalleryImage[];
  guests: Guest[];
  guest_rsvps: GuestRsvp[];
  guest_messages: GuestMessage[];
  gift_accounts: GiftAccount[];
  music_tracks: MusicTrack[];
  analytics_events: AnalyticsEvent[];
  checkins: Checkin[];
  seating_tables: SeatingTable[];
  plans: Plan[];
  subscriptions: Subscription[];
  orders: Order[];
  coupons: Coupon[];
  notifications: AppNotification[];
  audit_logs: AuditLog[];
  testimonials: Testimonial[];
  faqs: Faq[];
  password_resets: PasswordResetToken[];
  verify_tokens: VerifyToken[];
  user_activities: UserActivity[];
  broadcasts: Broadcast[];
  blog_posts: BlogPost[];
  content_reports: ContentReport[];
  system_settings: SystemSetting[];
  payment_gateways: PaymentGatewayConfig[];
}