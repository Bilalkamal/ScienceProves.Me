'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import FastMarquee from 'react-fast-marquee';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface Question {
  text: string;
  icon: string;
  category?: 'health' | 'nature' | 'science' | 'food' | 'psychology' | 'space' | 'technology';
}

const questions: Question[][] = [
  [
    { text: "Why do mint leaves cool our mouths?", icon: "🌿", category: 'nature' },
    { text: "Can local birds recognize human faces?", icon: "🦜", category: 'science' },
    { text: "Why do phone screens affect our sleep?", icon: "📱", category: 'technology' },
    { text: "How do astronauts' bones change in space?", icon: "🦴", category: 'space' },
    { text: "Why does running give us endorphins?", icon: "🏃", category: 'health' },
    { text: "How do bees navigate using polarized light?", icon: "🐝", category: 'nature' },
    { text: "Can quantum computers predict weather?", icon: "💻", category: 'technology' },
    // Duplicates for seamless loop
    { text: "Why do mint leaves cool our mouths?", icon: "🌿", category: 'nature' },
    { text: "Can local birds recognize human faces?", icon: "🦜", category: 'science' },
    { text: "Why do phone screens affect our sleep?", icon: "📱", category: 'technology' },
  ],
  [
    { text: "How does umami enhance other flavors?", icon: "🍜", category: 'food' },
    { text: "Why do MRIs respond to water molecules?", icon: "🔬", category: 'technology' },
    { text: "How does childhood stress affect DNA?", icon: "🧬", category: 'psychology' },
    { text: "Can dark matter influence Earth's orbit?", icon: "🌍", category: 'space' },
    { text: "Why do cats purr at specific frequencies?", icon: "😺", category: 'science' },
    { text: "How does salt preserve our food?", icon: "🧂", category: 'food' },
    { text: "Why do mosquitoes prefer some people?", icon: "🦟", category: 'nature' },
    // Duplicates for seamless loop
    { text: "How does umami enhance other flavors?", icon: "🍜", category: 'food' },
    { text: "Why do MRIs respond to water molecules?", icon: "🔬", category: 'technology' },
    { text: "How does childhood stress affect DNA?", icon: "🧬", category: 'psychology' },
  ],
  [
    { text: "How do batteries degrade over time?", icon: "🔋", category: 'technology' },
    { text: "Why do memories strengthen in sleep?", icon: "💭", category: 'psychology' },
    { text: "How do gut bacteria affect mood?", icon: "🦠", category: 'health' },
    { text: "Can solar flares disrupt GPS?", icon: "☀️", category: 'space' },
    { text: "Why do soap bubbles show rainbow colors?", icon: "🫧", category: 'science' },
    { text: "How does trauma change brain structure?", icon: "🧠", category: 'psychology' },
    { text: "Why do wounds heal faster in the mouth?", icon: "🦷", category: 'science' },
    // Duplicates for seamless loop
    { text: "How do batteries degrade over time?", icon: "🔋", category: 'technology' },
    { text: "Why do memories strengthen in sleep?", icon: "💭", category: 'psychology' },
    { text: "How do gut bacteria affect mood?", icon: "🦠", category: 'health' },
  ]
];

const categoryColors = {
  health: 'from-emerald-400/20 to-teal-500/20 dark:from-emerald-400/40 dark:to-teal-500/40',
  nature: 'from-lime-400/20 to-green-500/20 dark:from-lime-400/40 dark:to-green-500/40',
  science: 'from-violet-400/20 to-purple-500/20 dark:from-violet-400/40 dark:to-purple-500/40',
  food: 'from-orange-400/20 to-red-500/20 dark:from-orange-400/40 dark:to-red-500/40',
  psychology: 'from-pink-400/20 to-rose-500/20 dark:from-pink-400/40 dark:to-rose-500/40',
  space: 'from-indigo-400/20 to-blue-500/20 dark:from-indigo-400/40 dark:to-blue-500/40',
  technology: 'from-cyan-400/20 to-yellow-500/20 dark:from-cyan-400/40 dark:to-yellow-500/40',
};

export function ExampleQuestions() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  // Handle stored question after sign-in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const pendingQuestion = localStorage.getItem('pendingQuestion');
      if (pendingQuestion) {
        localStorage.removeItem('pendingQuestion');
        router.push('/ask');
        // Use a small delay to ensure the ask page is loaded
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('submitStoredQuestion', {
              detail: { question: pendingQuestion }
            })
          );
        }, 100);
      }
    }
  }, [isLoaded, isSignedIn, router]);

  const handleQuestionClick = (question: string) => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      localStorage.setItem('pendingQuestion', question);
      router.push('/sign-up');
      return;
    }

    // Store the question before navigation
    localStorage.setItem('pendingQuestion', question);
    router.push('/ask');
  };

  return (
    <section className="py-16 overflow-hidden bg-gradient-to-b from-background via-background to-background relative">
      {/* Smooth Section Transition */}
      <div className="absolute inset-x-0 -top-32 h-64 bg-gradient-to-b from-transparent via-background to-background" />
      
      <div className="container mx-auto px-4 mb-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground dark:text-white">
            Try These Burning Questions
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Click any question to get instant scientific answers. Warning: May cause 
            excessive &ldquo;mind blown&rdquo; moments! 🤯
          </p>
        </motion.div>
      </div>

      <div className="space-y-8 relative">
        {questions.map((row, idx) => (
          <FastMarquee
            key={idx}
            direction={idx % 2 ? 'right' : 'left'}
            gradient={false}
            speed={20}
            className="py-2"
          >
            <div className="flex gap-4 px-4">
              {row.map((q, qIdx) => (
                <motion.button
                  key={qIdx}
                  onClick={() => handleQuestionClick(q.text)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "group relative px-6 py-3 rounded-full whitespace-nowrap",
                    "bg-gradient-to-r",
                    categoryColors[q.category || 'science'],
                    "hover:shadow-lg transition-all duration-300",
                    "border border-border/5 dark:border-white/5",
                    "backdrop-blur-sm"
                  )}
                >
                  <span className="text-lg mr-2">{q.icon}</span>
                  <span className="text-sm font-medium text-foreground/90 dark:text-white/90">
                    {q.text}
                  </span>
                </motion.button>
              ))}
            </div>
          </FastMarquee>
        ))}
      </div>
    </section>
  );
} 