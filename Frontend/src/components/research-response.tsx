'use client';

import type { ResearchResponse } from '@/types/research';
import { Card } from './ui/card';
import { motion } from 'framer-motion';
import { Search, BookOpen, Quote, ExternalLink, Lightbulb, ListChecks, AlertCircle, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface ResearchResponseProps {
  data: Partial<ResearchResponse>;
}

const formatContentForCopy = (data: Partial<ResearchResponse>): string => {
  if (!data.question || !data.answer) return '';

  const sourcesText = data.sources?.map((source, index) => 
    `[${index + 1}] ${source.title}${source.journal ? ` - ${source.journal}` : ''}${source.year ? ` (${source.year})` : ''}\n${source.url}`
  ).join('\n\n');

  return `Question: ${data.question}\n\nAnswer: ${data.answer}${
    data.bulletPoints?.length 
      ? '\n\nKey Points:\n' + data.bulletPoints.map(point => `• ${point}`).join('\n')
      : ''
  }${
    sourcesText 
      ? '\n\nSources:\n' + sourcesText
      : ''
  }`;
};

export function ResearchResponse({ data }: ResearchResponseProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const content = formatContentForCopy(data);
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!data || !data.answer) {
    return null;
  }

  // Check if it's an invalid question response
  const isInvalidQuestion = data.answer.includes("doesn't appear to be a scientific query");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        {/* Header Section */}
        <div className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
          <div className="relative p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Research Question</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className={cn(
                  "h-9 px-3 font-medium",
                  "bg-background/95 backdrop-blur-sm border shadow-sm",
                  "transition-colors duration-200",
                  copied && "bg-green-500/90 text-white hover:bg-green-500/90"
                )}
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Response
                  </>
                )}
              </Button>
            </div>
            <h2 className="text-xl font-semibold">{data.question}</h2>
          </div>
        </div>

        {/* Main Answer Section */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-accent/10 mt-1">
                {isInvalidQuestion ? (
                  <AlertCircle className="h-5 w-5 text-accent" />
                ) : (
                  <Lightbulb className="h-5 w-5 text-accent" />
                )}
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="font-medium text-lg">
                  {isInvalidQuestion ? "Invalid Question" : "Key Findings"}
                </h3>
                <div className="prose dark:prose-invert max-w-none">
                  <div className="text-muted-foreground whitespace-pre-wrap">
                    {data.answer}
                  </div>
                </div>
              </div>
            </div>

            {/* Only show bullet points for valid questions */}
            {!isInvalidQuestion && data.bulletPoints && data.bulletPoints.length > 0 && (
              <div className="flex items-start gap-3 mt-6">
                <div className="p-2 rounded-full bg-primary/10 mt-1">
                  <ListChecks className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-3 flex-1">
                  <h3 className="font-medium text-lg">Key Points</h3>
                  <ul className="space-y-2">
                    {data.bulletPoints.map((point, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{point}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Only show sources for valid questions */}
          {!isInvalidQuestion && data.sources && data.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-lg">Academic Sources</h3>
              </div>
              <div className="grid gap-4">
                {data.sources.map((source, index) => (
                  <motion.a
                    key={index}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "group relative p-4 rounded-lg",
                      "bg-gradient-to-r from-card to-card/50",
                      "border border-border/50 hover:border-border",
                      "transition-all duration-300"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg" />
                    <div className="relative space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Quote className="h-4 w-4 text-primary" />
                            <h4 className="font-medium group-hover:text-primary transition-colors">
                              {source.title}
                            </h4>
                          </div>
                          {source.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {source.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {source.journal && <span>{source.journal}</span>}
                            {source.year && (
                              <>
                                <span>•</span>
                                <span>{source.year}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
} 