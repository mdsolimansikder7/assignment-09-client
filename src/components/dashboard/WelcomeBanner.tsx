"use client";

interface WelcomeBannerProps {
  name: string;
  role: string;
}

export function WelcomeBanner({ name, role }: WelcomeBannerProps) {
  return (
    <div className="rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 to-white p-6 dark:border-transparent dark:from-primary/15 dark:via-primary/5 dark:to-transparent">
      <p className="text-sm text-muted-foreground">Welcome back</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-foreground">{name}</h1>
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold capitalize text-orange-700 dark:bg-primary/10 dark:text-primary">
          {role}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Here&rsquo;s what&rsquo;s happening in your {role} dashboard.
      </p>
    </div>
  );
}