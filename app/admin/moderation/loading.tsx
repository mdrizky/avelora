import { TableSkeleton } from "@/components/admin/table-skeleton";

export default function ModerationLoading() {
  return <TableSkeleton rows={6} columns={4} />;
}
