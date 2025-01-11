'use client';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NavBar } from '@/components/nav-bar';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ResearchResponse } from '@/components/research-response';
import { MOCK_RESPONSE, ResearchResponse as ResearchResponseType } from '@/types/research';
import { Search, ArrowLeft } from 'lucide-react';
import { useResearchQuery } from '@/hooks/use-research-query';
import { ValidationMessage } from '@/components/validation-message';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { MultiStepLoader } from '@/components/ui/multi-step-loader';
import { getLoaderStateIndex } from '@/lib/loader-utils';

const SAMPLE_QUESTIONS = [
  "Does meditation reduce stress and anxiety?",
  "Can regular sleep improve immune system function?",
  "Do video games affect cognitive development in children?",
  "How does exercise impact mental health?",
  "What role does gut bacteria play in immunity?",
  "Can mindfulness improve work productivity?",
  "Why do we feel tired after eating carbohydrates?",
  "How does sunlight exposure affect vitamin D production?",
  "Can music influence our cognitive performance?",
  "Why do we get brain freeze when eating cold foods?",
  "How does caffeine affect our alertness and focus?",
  "Why do we feel more hungry in cold weather?",
  "Can indoor plants improve air quality?",
  "How does screen time affect our eye health?",
  "Why do we get muscle cramps during exercise?",
  "Can certain foods help reduce inflammation?"
];

// Define loading states
const LOADING_STATES = [
  { text: "Processing your question..." },
  { text: "Validating your question..." },
  { text: "Searching scientific databases..." },
  { text: "Analyzing research papers..." },
  { text: "Preparing comprehensive answer..." },
  { text: "Verifying answer accuracy..." },
  { text: "Finalizing answer..." }
] as const;


export default function AskPage() {
  const [question, setQuestion] = useState('');
  const searchInputRef = useRef<HTMLTextAreaElement>(null);
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { submitQuestion, state, reset } = useResearchQuery();

  // 1. Auth check effect
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  // 3. Pending question handler effect
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const pendingQuestion = localStorage.getItem('pendingQuestion');
      if (pendingQuestion) {
        setQuestion(pendingQuestion);
        handleSubmit(pendingQuestion);
        localStorage.removeItem('pendingQuestion');
      }
    }
  }, [isLoaded, isSignedIn]);

  // 4. Loading state effect
  useEffect(() => {
    if (state.isLoading) {
      setQuestion('');
    }
  }, [state.isLoading]);

  // 5. Answer received effect
  useEffect(() => {
    if (!state.isLoading && state.answer) {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) {
        input.style.opacity = '1';
        input.style.visibility = 'visible';
      }
      
      const timeout = setTimeout(() => {
        setQuestion('');
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [state.isLoading, state.answer]);

  // Guard clause for authentication
  if (!isLoaded || !isSignedIn) {
    return null;
  }

  // Event handlers
  const handleSubmit = async (searchQuery: string) => {
    if (!searchQuery.trim() || !user) return;
    
    try {
      reset();
      await submitQuestion(searchQuery, user.id);
    } catch (error) {
      console.error('Error submitting question:', error);
      setQuestion('');
    }
  };

  const handleSampleClick = (sample: string) => {
    setQuestion(sample);
    handleSubmit(sample);
  };

  const handleNewQuestion = () => {
    setQuestion('');
    reset();
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 800, 800);
      }
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim() || !user) return;
    handleSubmit(searchQuery);
  };

  return (
    <main className="min-h-screen bg-background/50 overflow-x-hidden">
      <NavBar />
      
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Primary gradient orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-pulse-slower" />
          <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] animate-pulse-slower" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.015] [background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAAElBMVEUAAAAAAAAAAAAAAAAAAAAAAADgKxmiAAAABnRSTlMCCgkGBAUE+AUxAAAARklEQVQ4y2NgAAX//v0rYGBg+P//f8FvKJCBEAB5GkrAwPD//3+gHFgELgfS+P8/WARZDt0AJDmwKYQcuFxAIzm4Z8AGAAAWzDcEY6kFiAAAAABJRU5ErkJggg==)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <div className={cn(
          "container mx-auto px-4 transition-all duration-300 ease-out",
          (!state.answer && !state.isLoading) 
            ? "min-h-[calc(100vh-4rem)] flex items-center justify-center"
            : "min-h-screen"
        )}>
          <div className={cn(
            "max-w-3xl w-full mx-auto space-y-8 transition-all duration-300",
            (state.isLoading || state.answer) 
              ? "pt-24"
              : "transform translate-y-16"
          )}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold">Ask Your Question</h1>
              <p className="text-muted-foreground">
                Enter your question and we&apos;ll find scientific evidence to support or challenge it.
              </p>
            </motion.div>

            <motion.div 
              layout
              className="relative"
              initial={false}
              animate={{
                scale: state.isLoading ? 0.98 : 1,
                opacity: state.isLoading ? 0.8 : 1,
              }}
              transition={{ 
                duration: 0.2,
                ease: "easeInOut"
              }}
            >
              <div className="relative group">
                {/* Enhanced gradient border effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-accent/40 via-primary/40 to-accent/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                
                <PlaceholdersAndVanishInput
                  placeholders={SAMPLE_QUESTIONS}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (question.trim()) {
                      handleSubmit(question);
                    }
                  }}
                  isLoading={state.isLoading}
                />
              </div>
            </motion.div>

            {/* Replace status and loading states with MultiStepLoader */}
            <AnimatePresence mode="wait">
              {state.isLoading ? (
                <MultiStepLoader 
                  loadingStates={LOADING_STATES as any}
                  loading={state.isLoading}
                  currentState={state.currentLoaderState}
                  loop={false}
                />
              ) : state.answer ? (
                <motion.div
                  key="answer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ 
                    duration: 0.5,
                    delay: 0.2 // Small delay to ensure smooth transition from loader
                  }}
                  className="pb-32"
                >
                  <ResearchResponse data={state.answer} />
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {state.error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <ValidationMessage message={state.error} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
} 