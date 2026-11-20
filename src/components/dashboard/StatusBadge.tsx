const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400",
  confirmed: "bg-green-500/15 text-green-400",
  active: "bg-green-500/15 text-green-400",
  approved: "bg-green-500/15 text-green-400",
  completed: "bg-green-500/15 text-green-400",
  cancelled: "bg-red-500/15 text-red-400",
  rejected: "bg-red-500/15 text-red-400",
  paid: "bg-green-500/15 text-green-400",
  unpaid: "bg-amber-500/15 text-amber-400",
};

export function StatusBadge({ status }: { status: string }) {
  const className = STATUS_STYLES[status] ?? "bg-muted text-muted-foreground";
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${className}`}
    >
      {status}
    </span>
  );
}
