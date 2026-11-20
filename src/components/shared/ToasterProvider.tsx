"use client";

import { Toaster } from "react-hot-toast";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          borderRadius: "0.75rem",
          background: "#0F172A",
          color: "#FFFFFF",
          fontSize: "0.875rem",
        },
        success: { iconTheme: { primary: "#F97316", secondary: "#FFFFFF" } },
      }}
    />
  );
}
