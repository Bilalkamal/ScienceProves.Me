"use client";

import { SignUp } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { getClerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  const { theme } = useTheme();
  const appearance = getClerkAppearance(theme);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-accent/20">
      <div className="w-full max-w-md">
        <SignUp
          appearance={appearance}
          routing="hash"
          afterSignUpUrl="/ask"
          signInUrl="/sign-in"
          redirectUrl="/ask"
        />
      </div>
    </div>
  );
} 