import { TableSkeleton } from "@/components/admin/table-skeleton";

export default function TemplatesLoading() {
  return <div className="space-y-6"><div className="h-20 w-80 animate-pulse rounded-xl bg-white" /><TableSkeleton rows={6} columns={3} /></div>;
}
