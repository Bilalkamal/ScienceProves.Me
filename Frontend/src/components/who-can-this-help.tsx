'use client';

import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { cn } from '@/lib/utils';

const scenarios = [
  {
    title: "The Family Dinner Debater",
    description: "For when your uncle starts sharing conspiracy theories about vaccines at Thanksgiving dinner, and you need peer-reviewed papers, not Facebook posts.",
    icon: "🦃"
  },
  {
    title: "The Sibling Rivalry Settler",
    description: "Finally prove to your sister that chocolate milk doesn't come from brown cows. Back your arguments with actual dairy science!",
    icon: "👫"
  },
  {
    title: "The Group Chat Scholar",
    description: "Be the friend who drops scientific truth bombs in the group chat when everyone's sharing questionable health advice.",
    icon: "💬"
  },
  {
    title: "The Social Media Myth-Buster",
    description: "Transform from 'Well, actually...' guy to 'According to this peer-reviewed study...' expert in your comment sections.",
    icon: "🔍"
  }
];

export function WhoCanThisHelp() {
  return (
    <section className="pt-12 pb-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-black/[0.01] bg-[size:20px_20px] dark:bg-grid-white/[0.01]" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -left-20 top-20 w-72 h-72 bg-accent/20 dark:bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
            x: [0, -50, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -right-20 bottom-20 w-72 h-72 bg-primary/20 dark:bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="container mx-auto px-4 relative z-20"
      >
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4 text-foreground dark:text-white"
          >
            Who Can This Help?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto dark:text-muted-foreground/90"
          >
            Because sometimes you need more than just &ldquo;Trust me bro&rdquo; in your arguments
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              viewport={{ once: true }}
            >
              <Card className={cn(
                "group relative h-full overflow-hidden",
                "bg-gradient-to-br from-background via-card to-background/80 dark:from-card/20 dark:via-card/10 dark:to-background/80",
                "hover:shadow-2xl hover:shadow-accent/20 dark:hover:shadow-primary/10",
                "transition-all duration-500 ease-out",
                "border border-border/50 dark:border-primary/20"
              )}>
                {/* Hover Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-accent/0 opacity-0 group-hover:opacity-10 dark:from-primary/0 dark:via-primary/0 dark:to-primary/0 dark:group-hover:opacity-20 transition-opacity duration-500" />
                
                {/* Card Content */}
                <div className="relative p-6 space-y-4">
                  {/* Icon with Animation */}
                  <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20 dark:from-primary/30 dark:to-accent/30 flex items-center justify-center"
                  >
                    <span className="text-2xl transform group-hover:scale-110 transition-transform duration-300">
                      {scenario.icon}
                    </span>
                  </motion.div>

                  {/* Title with Gradient on Hover */}
                  <h3 className="font-semibold text-xl text-foreground dark:text-primary-foreground group-hover:text-primary dark:group-hover:text-primary-foreground transition-colors duration-300">
                    {scenario.title}
                  </h3>

                  {/* Description with Improved Typography */}
                  <p className="text-muted-foreground dark:text-muted-foreground/80 text-sm leading-relaxed">
                    {scenario.description}
                  </p>

                  {/* Subtle Border Animation */}
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/50 to-transparent dark:via-primary-foreground/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
} 