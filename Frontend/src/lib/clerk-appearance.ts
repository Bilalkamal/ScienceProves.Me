import { dark } from "@clerk/themes";
import type { Appearance } from "@clerk/types";

export const getClerkAppearance = (theme: string | undefined): Appearance => ({
  baseTheme: theme === "dark" ? dark : undefined,
  elements: {
    card: "dark:bg-[#0D1826] bg-[#4992BF] shadow-xl",
    headerTitle: "dark:text-white text-[#0D1826] font-bold",
    headerSubtitle: "dark:text-white/70 text-[#0D1826]/70",
    socialButtonsBlockButton:
      "dark:bg-[#2E608C]/20 bg-white dark:hover:bg-[#2E608C]/30 hover:bg-gray-50 dark:border-white/10 border-gray-200 dark:text-white text-[#0D1826] transition-colors",
    formFieldLabel: "dark:text-white/90 text-[#0D1826]/90",
    formFieldInput:
      "dark:bg-[#2E608C]/20 bg-white dark:border-white/10 border-gray-200 dark:text-white text-[#0D1826] dark:placeholder-white/40 placeholder-[#0D1826]/40",
    formButtonPrimary: 
      "bg-[#4992BF] hover:bg-[#4992BF]/90 dark:bg-[#2E608C] dark:hover:bg-[#2E608C]/90 text-white transition-colors",
    footer: "dark:text-white/70 text-[#0D1826]/70",
    card__background: "dark:bg-[#0D1826] bg-[#4992BF]",
    dividerLine: "dark:bg-white/20 bg-[#0D1826]/20",
    dividerText: "dark:text-white/70 text-[#0D1826]/70",
  },
  variables: {
    colorPrimary: theme === "dark" ? "#2E608C" : "#4992BF",
    colorTextOnPrimaryBackground: "#FFFFFF",
    colorBackground: theme === "dark" ? "#0D1826" : "#F2F2F2",
    colorText: theme === "dark" ? "#FFFFFF" : "#0D1826",
    colorTextSecondary: theme === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(13, 24, 38, 0.7)",
  },
}); 