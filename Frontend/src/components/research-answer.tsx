'use client';

import { Search, BookOpen, Quote } from 'lucide-react';

export function ResearchAnswer() {
  return (
    <div className="bg-card rounded-lg shadow-2xl p-6 dark:bg-card/50 backdrop-blur">
      <div className="flex items-center gap-3 mb-4">
        <Search className="h-5 w-5 text-primary" />
        <span className="text-sm text-muted-foreground">Point to Prove</span>
      </div>
      
      <p className="text-lg mb-6">
        &ldquo;Exercise improves cognitive function and brain health&rdquo;
      </p>
      
      <div className="border-l-2 border-primary/20 pl-4 mb-6">
        <p className="text-base mb-4">
          Strong scientific evidence supports this claim. Recent studies demonstrate that:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>Regular aerobic exercise enhances memory formation and retention</li>
          <li>Physical activity increases brain plasticity and neural connectivity</li>
          <li>Exercise-induced BDNF production supports new neuron growth</li>
          <li>Consistent physical activity may reduce cognitive decline risks</li>
        </ul>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-primary mt-1" />
          <div>
            <p className="text-sm text-muted-foreground">Source: Nature Neuroscience (2023)</p>
            <p className="text-base">Regular aerobic exercise increases BDNF levels, promoting neurogenesis...</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Quote className="h-5 w-5 text-primary mt-1" />
          <div>
            <p className="text-sm text-muted-foreground">Source: Frontiers in Aging Neuroscience (2023)</p>
            <p className="text-base">Meta-analysis shows 20% improvement in memory tasks...</p>
          </div>
        </div>
      </div>
    </div>
  );
}