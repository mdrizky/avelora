import { TableSkeleton } from "@/components/admin/table-skeleton";

export default function AdminLoading() {
  return <div className="space-y-6"><div className="h-40 animate-pulse rounded-2xl bg-night-900/80" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-white" />)}</div><TableSkeleton rows={6} columns={6} /></div>;
}
