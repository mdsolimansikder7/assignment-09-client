"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";

export function ToasterProvider() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: "0.75rem",
          background: isDark ? "#111827" : "#ffffff",
          color: isDark ? "#f3f4f6" : "#0f172a",
          border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e2e8f0",
          fontSize: "0.875rem",
        },
        success: {
          iconTheme: {
            primary: "#F97316",
            secondary: isDark ? "#111827" : "#ffffff",
          },
        },
      }}
    />
  );
}
