import { TableSkeleton } from "@/components/admin/table-skeleton";

export default function OrdersLoading() {
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-white" />)}</div><TableSkeleton rows={8} columns={7} /></div>;
}
