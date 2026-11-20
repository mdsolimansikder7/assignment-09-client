import {
  BanknoteIcon,
  BoxesIcon,
  CalendarCheckIcon,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  Icon: typeof BanknoteIcon;
}

export function StatCard({ label, value, Icon }: StatCardProps) {
  return (
    <div className="flex h-full items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function ListedStat({ value }: { value: number }) {
  return <StatCard label="Listed Equipment" value={value} Icon={BoxesIcon} />;
}

export function CompletedStat({ value }: { value: number }) {
  return <StatCard label="Completed Rentals" value={value} Icon={CalendarCheckIcon} />;
}

export function EarningsStat({ value }: { value: string | number }) {
  return <StatCard label="Total Earnings" value={value} Icon={BanknoteIcon} />;
}
