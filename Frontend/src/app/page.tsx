// page.tsx
'use client';

import { NavBar } from '@/components/nav-bar';
import { HeroSection } from '@/components/hero-section';
import { FeaturesSection } from '@/components/features-section';
import { ExampleQuestions } from '@/components/example-questions';
import { HowItWorks } from '@/components/how-it-works';
import { WhoCanThisHelp } from '@/components/who-can-this-help';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();


  return (
    <main className="min-h-screen">
      <NavBar />
      <HeroSection />
      <HowItWorks />
      <WhoCanThisHelp />
      <ExampleQuestions />
      <Footer />
    </main>
  );
}
