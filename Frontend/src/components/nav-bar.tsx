// src/components/nav-bar.tsx
"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { Sparkles, History } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { dark } from "@clerk/themes";

export function NavBar() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();
  const isAskPage = pathname === "/ask";
  const isHistoryPage = pathname === "/history";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleProtectedAction = (route: string) => {
    if (!isSignedIn) {
      router.push('/sign-up');
      return;
    }
    router.push(route);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/icon.png"
                alt="ScienceProves.me Logo"
                width={32}
                height={32}
                className="text-primary"
              />
              <span className="text-lg sm:text-xl font-bold hidden sm:inline">
                ScienceProves.me
              </span>
              <span className="text-lg font-bold sm:hidden">SP.me</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            <SignedOut>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => router.push('/sign-in')}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="px-3 sm:px-4"
                onClick={() => router.push('/sign-up')}
              >
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
              </Button>
            </SignedOut>
            <SignedIn>
              {!isAskPage && (
                <Button
                  variant="default"
                  size="sm"
                  className="bg-primary/90 hover:bg-primary flex items-center gap-1 sm:gap-2 px-3 sm:px-4"
                  onClick={() => handleProtectedAction("/ask")}
                >
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Ask</span>
                </Button>
              )}
              {!isHistoryPage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4"
                  onClick={() => handleProtectedAction("/history")}
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">History</span>
                </Button>
              )}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  baseTheme: theme === "dark" ? dark : undefined,
                  elements: {
                    card: "dark:bg-[#0A0A0B] bg-white",
                    headerTitle: "dark:text-white/90 text-gray-900",
                    headerSubtitle: "dark:text-white/60 text-gray-500",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}
