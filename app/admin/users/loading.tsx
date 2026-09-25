import { TableSkeleton } from "@/components/admin/table-skeleton";

export default function UsersLoading() {
  return <div className="space-y-6"><div className="h-20 w-72 animate-pulse rounded-xl bg-white" /><TableSkeleton rows={8} columns={6} /></div>;
}
