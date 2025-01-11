// src/components/hero-section.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "./ui/button";
import { ResearchAnswer } from "./research-answer";
import { useRouter } from "next/navigation";
import AnimatedLogoCloud from "./animated-logo-cloud";
import { ChevronDown, Sparkles } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function HeroSection() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  const { isLoaded, isSignedIn } = useUser();

  const handleProvePointClick = () => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push('/sign-up');
      return;
    }
    router.push("/ask");
  };

  const scrollToHowItWorks = () => {
    const section = document.getElementById("how-it-works");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/20 dark:from-background dark:via-background dark:to-primary/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.05)_0%,rgba(255,255,255,0)_100%)]" />
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]">
        <div className="absolute inset-0 bg-grid-white/[0.02] dark:bg-grid-white/[0.05]" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-accent/5 dark:to-primary/5" />
      </div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-4 top-20 w-72 h-72 bg-accent/10 dark:bg-primary/10 rounded-full blur-3xl animate-drift" />
        <div className="absolute -right-4 bottom-20 w-72 h-72 bg-primary/10 dark:bg-accent/10 rounded-full blur-3xl animate-drift-slow" />
      </div>

      <div className="container mx-auto px-4 pt-16 sm:pt-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 sm:space-y-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Win Arguments with{" "}
              <span className="text-primary relative inline-block">
                Real Science
                <span className="absolute bottom-0 left-0 w-full h-1 bg-primary/20 rounded-full" />
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed tracking-wide">
              Ever been in a debate and wished you had solid scientific evidence
              to back you up? This tool helps you find real research papers to
              support your points - no more <strong>"trust me bro"</strong>{" "}
              moments!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                size="lg"
                className="text-base sm:text-lg font-medium relative overflow-hidden group w-full sm:w-auto bg-primary/90 hover:bg-primary flex items-center gap-2"
                onClick={handleProvePointClick}
              >
                <span className="relative z-10">Prove Your Point Now</span>
                <Sparkles className="h-4 w-4" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base sm:text-lg font-medium relative overflow-hidden group w-full sm:w-auto"
                onClick={scrollToHowItWorks}
              >
                <span className="relative z-10">See How It Works</span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/10 to-accent/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative group hidden sm:block"
          >
            {/* Enhanced gradient border effect */}
            <div className="absolute -inset-[2px] bg-gradient-to-r from-accent/40 via-primary/40 to-accent/40 dark:from-primary/40 dark:via-accent/40 dark:to-primary/40 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500" />
            <div className="absolute -inset-[2px] bg-gradient-to-r from-accent via-primary to-accent dark:from-primary dark:via-accent dark:to-primary rounded-2xl opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
            {/* Ambient light effect */}
            <div className="absolute -inset-[40px] bg-gradient-to-br from-accent/10 via-transparent to-primary/10 dark:from-primary/10 dark:to-accent/10 rounded-[30px] blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />

            <div className="relative bg-background/80 dark:bg-background/80 backdrop-blur-xl rounded-xl">
              <ResearchAnswer />
            </div>

            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-accent/5 to-transparent dark:via-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-xl" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          className="mt-12 sm:mt-16"
        >
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 tracking-tight">
              Powered by Leading Research Sources
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground tracking-wide">
              Access cutting-edge research from top academic institutions and
              repositories
            </p>
          </div>
          <AnimatedLogoCloud />
        </motion.div>
      </div>

      {/* Scroll-down indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
}
