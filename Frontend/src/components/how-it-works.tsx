'use client';

import { motion } from 'framer-motion';
import { Timeline } from './ui/timeline';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] animate-pulse-slower" />
        </div>

        <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our Research Augmented Generation (RAG) system ensures you get accurate, 
              scientifically-backed answers every time
            </p>
          </div>

          <div className="relative bg-background/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg">
            <div className="p-8">
              <Timeline items={[
                {
                  title: "Query Validation",
                  description: "Your question is analyzed to ensure it's scientific in nature and can be answered with research evidence.",
                  icon: "🔍",
                  details: ["Natural language processing", "Scientific context verification", "Query optimization"]
                },
                {
                  title: "Multi-Stage Retrieval",
                  description: "We search multiple scientific databases and sources to find the most relevant research.",
                  icon: "📚",
                  details: [
                    "Scientific database search across millions of papers",
                    "Web search fallback for additional sources",
                    "Smart document reranking for relevance"
                  ]
                },
                {
                  title: "Quality Assurance",
                  description: "Multiple verification steps ensure accuracy and reliability of the answer.",
                  icon: "✓",
                  details: [
                    "Self-corrective RAG with iterative refinement",
                    "Hallucination detection and prevention",
                    "Answer relevance grading"
                  ]
                },
                {
                  title: "Response Generation",
                  description: "Get a clear, well-structured answer with proper academic citations.",
                  icon: "📝",
                  details: [
                    "Clear explanation of findings",
                    "Academic citations included",
                    "Links to source papers"
                  ]
                }
              ]} />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 