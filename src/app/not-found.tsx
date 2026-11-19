import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="font-heading text-6xl font-bold text-primary">404</p>
        <h1 className="mt-2 font-heading text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button
          className="mt-6 bg-primary text-primary-foreground hover:bg-primary-hover"
          nativeButton={false}
          render={<Link href="/" />}
        >
          Back to Home
        </Button>
      </div>
    </main>
  );
}
