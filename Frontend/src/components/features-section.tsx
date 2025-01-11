'use client';

import { motion } from 'framer-motion';
import { Brain, Database, Link, Shield } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Analysis',
    description: 'Advanced RAG technology processes millions of papers to find relevant scientific evidence.',
  },
  {
    icon: Database,
    title: 'Vast Research Database',
    description: 'Access to over 100 million peer-reviewed papers across all scientific disciplines.',
  },
  {
    icon: Link,
    title: 'Precise Citations',
    description: 'Every answer includes direct citations and links to original research papers.',
  },
  {
    icon: Shield,
    title: 'Verified Sources',
    description: 'Only peer-reviewed and academically recognized sources are used.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-accent/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Science at Your Fingertips
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We use AI to dig through millions of research papers and find the exact scientific evidence you need. No more endless Googling!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}