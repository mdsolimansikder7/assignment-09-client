
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value?: string | Date): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function countDays(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return 0;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.ceil((end - start) / oneDay));
}

export function estimateTotal(
  rentalType: "daily" | "weekly" | "monthly",
  rentalPrice: number,
  days: number,
  quantity: number
): number {
  if (days <= 0) return 0;
  let units = days;
  if (rentalType === "weekly") units = Math.ceil(days / 7);
  if (rentalType === "monthly") units = Math.ceil(days / 30);
  return Math.round(units * rentalPrice * quantity * 100) / 100;
}

export function rentalUnit(rentalType: "daily" | "weekly" | "monthly"): string {
  if (rentalType === "weekly") return "week";
  if (rentalType === "monthly") return "month";
  return "day";
}

export function todayInputValue(): string {
  return new Date().toISOString().split("T")[0];
}
