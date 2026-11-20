const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  confirmed: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  active: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  approved: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  completed: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  unpaid: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
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
