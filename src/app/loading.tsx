import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPage() {
  return (
    <main className="container-page space-y-6 py-16">
      <Skeleton className="h-9 w-64" />
      <Skeleton className="h-4 w-96 max-w-full" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-xl" />
        ))}
      </div>
    </main>
  );
}
