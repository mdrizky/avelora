import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import {
  deleteInvitation,
  getInvitationById,
  saveGifts,
  saveSchedules,
  saveGallery,
  updateInvitation,
} from "@/lib/db";
import type { InvitationContent, ThemeConfig } from "@/lib/db/types";

const patchSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  event_date: z.string().max(40).optional(),
  timezone: z.string().max(40).optional(),
  city: z.string().max(60).optional(),
  status: z.enum(["draft", "published"]).optional(),
  music_track_id: z.string().nullable().optional(),
  content_data: z.record(z.string(), z.unknown()).optional(),
  theme_config: z.record(z.string(), z.unknown()).optional(),
  schedules: z
    .array(
      z.object({
        label: z.string(),
        event_date: z.string(),
        start_time: z.string(),
        end_time: z.string().optional(),
        location_name: z.string(),
        address: z.string(),
        maps_url: z.string(),
        order_index: z.number().optional(),
      }),
    )
    .optional(),
  gallery: z.array(z.string()).optional(),
  gifts: z
    .array(
      z.object({
        type: z.enum(["bank", "qris", "ewallet"]),
        bank_name: z.string().optional(),
        account_number: z.string().optional(),
        account_name: z.string().optional(),
        provider: z.string().optional(),
        phone: z.string().optional(),
        order_index: z.number().optional(),
      }),
    )
    .optional(),
});

function owned(id: string, userId: string): boolean {
  const inv = getInvitationById(id);
  return inv?.owner_id === userId;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  if (!owned(id, user.id) && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let input;
  try {
    input = patchSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (input.title) patch.title = input.title;
  if (input.event_date !== undefined) patch.event_date = input.event_date;
  if (input.timezone) patch.timezone = input.timezone;
  if (input.city !== undefined) patch.city = input.city;
  if (input.status) patch.status = input.status;
  if (input.music_track_id !== undefined) patch.music_track_id = input.music_track_id;
  if (input.content_data) patch.content_data = input.content_data as unknown as InvitationContent;
  if (input.theme_config) {
    const base = getInvitationById(id)?.theme_config;
    const incoming = input.theme_config as Record<string, unknown> & { palette?: unknown };
    patch.theme_config = {
      ...(base ?? {}),
      ...incoming,
      palette: incoming.palette ?? base?.palette,
    } as ThemeConfig;
  }
  if (input.schedules) saveSchedules(id, input.schedules as Parameters<typeof saveSchedules>[1]);
  if (input.gallery) saveGallery(id, input.gallery);
  if (input.gifts) saveGifts(id, input.gifts as Parameters<typeof saveGifts>[1]);

  const saved = updateInvitation(id, patch as Parameters<typeof updateInvitation>[1]);
  return NextResponse.json({ ok: true, invitation: saved });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  if (!owned(id, user.id) && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  deleteInvitation(id);
  return NextResponse.json({ ok: true });
}