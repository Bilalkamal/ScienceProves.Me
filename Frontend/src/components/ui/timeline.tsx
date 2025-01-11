"use client";
import { motion } from 'framer-motion';

interface TimelineItem {
  title: string;
  description: string;
  icon: string;
  details: string[];
}

interface TimelineProps {
  items: TimelineItem[];
}

export function Timeline({ items }: TimelineProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.2 }}
          className="group relative flex gap-x-6 pb-12 last:pb-0"
        >
          {/* Connecting Line */}
          <div className="relative">
            <div className="absolute left-[15px] top-[30px] bottom-0 w-px bg-border group-last:hidden" />
            <div className="relative z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-background border-2 border-primary text-xl">
              {item.icon}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-semibold text-xl mb-2">{item.title}</h3>
            <p className="text-muted-foreground mb-4">{item.description}</p>
            
            {/* Details */}
            <ul className="space-y-2">
              {item.details.map((detail, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
