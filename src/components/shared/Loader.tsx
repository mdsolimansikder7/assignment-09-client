import { Loader2Icon } from "lucide-react";

export function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-muted-foreground">
      <Loader2Icon className="size-8 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
