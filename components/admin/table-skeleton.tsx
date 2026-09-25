export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return <div className="animate-pulse divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">{Array.from({ length: rows }, (_, row) => <div key={row} className="flex gap-4 p-4">{Array.from({ length: columns }, (_, column) => <span key={column} className={`h-4 rounded bg-ink-100 ${column === 0 ? "w-1/3" : "w-1/6"}`} />)}</div>)}</div>;
}
