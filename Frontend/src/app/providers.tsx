// src/app/providers.tsx
"use client";

import { ThemeProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: "auto",
        elements: {
          card: "dark:bg-[#0A0A0B] bg-white",
          headerTitle: "dark:text-white/90 text-gray-900",
          headerSubtitle: "dark:text-white/60 text-gray-500",
          socialButtonsBlockButton:
            "dark:bg-white/10 bg-gray-50 dark:hover:bg-white/20 hover:bg-gray-100 dark:border-white/10 border-gray-200 transition-colors",
          formFieldLabel: "dark:text-white/60 text-gray-600",
          formFieldInput:
            "dark:bg-white/10 bg-gray-50 dark:border-white/10 border-gray-200 dark:text-white/90 text-gray-900 dark:placeholder-white/40 placeholder-gray-500",
          footer: "dark:text-white/60 text-gray-500",
          formButtonPrimary: "bg-blue-600 hover:bg-blue-700 transition-colors",
        },
        variables: {
          dark: {
            colorBackground: "#0A0A0B",
            colorInputBackground: "rgba(255, 255, 255, 0.1)",
            colorInputText: "rgba(255, 255, 255, 0.9)",
            colorTextSecondary: "rgba(255, 255, 255, 0.6)",
            colorText: "rgba(255, 255, 255, 0.9)",
            colorPrimary: "#2563eb",
          },
          light: {
            colorBackground: "#ffffff",
            colorInputBackground: "#f9fafb",
            colorInputText: "#111827",
            colorTextSecondary: "#6b7280",
            colorText: "#111827",
            colorPrimary: "#2563eb",
          },
          borderRadius: "0.75rem",
        },
      }}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster />
      </ThemeProvider>
    </ClerkProvider>
  );
}
