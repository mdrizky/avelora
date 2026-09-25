"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ReportChart({ data }: { data: Array<{ label: string; views: number; rsvps: number }> }) {
  return <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid stroke="#ece7de" strokeDasharray="3 3" /><XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8b8176" }} /><YAxis tick={{ fontSize: 11, fill: "#8b8176" }} allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="views" name="Views" stroke="#b08d42" strokeWidth={3} dot={false} /><Line type="monotone" dataKey="rsvps" name="RSVP" stroke="#7d9680" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div>;
}
