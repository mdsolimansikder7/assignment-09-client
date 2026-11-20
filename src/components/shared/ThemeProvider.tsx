"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Dark/Light theme provider — the choice is saved in localStorage by next-themes.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="gearloop-theme"
    >
      {children}
    </NextThemesProvider>
  );
}
