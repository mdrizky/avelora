import type { InvitationContent, ThemeConfig } from "@/lib/db/types";

export interface ViewerProps {
  invitation: {
    id: string;
    slug: string;
    title: string;
    event_date: string | null;
    timezone: string;
    city: string;
    status: string;
    content_data: InvitationContent;
    theme_config: ThemeConfig;
  };
  schedules: {
    id: string;
    label: string;
    event_date: string;
    start_time: string;
    end_time?: string;
    location_name: string;
    address: string;
    maps_url: string;
    order_index: number;
  }[];
  gallery: { id: string; url: string; order: number }[];
  gifts: {
    id: string;
    type: "bank" | "qris" | "ewallet";
    bank_name?: string;
    account_number?: string;
    account_name?: string;
    provider?: string;
    phone?: string;
    order_index: number;
  }[];
  messages: { id: string; guest_name: string; message: string; is_featured: boolean; created_at: string }[];
  guestName: string;
  guestSlug: string;
  guestId: string | null;
  musicTrack: { id: string; title: string; artist: string; audio_url: string } | null;
  invitationId: string;
}