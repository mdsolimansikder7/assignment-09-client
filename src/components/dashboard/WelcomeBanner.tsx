"use client";

interface WelcomeBannerProps {
  name: string;
  role: string;
}

export function WelcomeBanner({ name, role }: WelcomeBannerProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6">
      <p className="text-sm text-gray-400">Welcome back</p>
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-white">{name}</h1>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold capitalize text-primary">
          {role}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-400">
        Here&rsquo;s what&rsquo;s happening in your {role} dashboard.
      </p>
    </div>
  );
}