import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getData } from "@/lib/db";

export async function GET() {
  const user = await getSessionUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rows = getData().analytics_events;
  const csv = ["id,invitation_id,event_type,device,browser,occurred_at", ...rows.map((row) => [row.id, row.invitation_id, row.event_type, row.device ?? "", row.browser ?? "", row.occurred_at].map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))].join("\n");
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=avelora-analytics.csv" } });
}
