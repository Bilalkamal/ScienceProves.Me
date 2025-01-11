'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NavBar } from '@/components/nav-bar';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { ResearchResponse } from '@/components/research-response';
import { Search, Sparkles, Clock, Brain } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHistory } from '@/hooks/use-history';
import { formatDate } from '@/lib/utils';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Footer } from '@/components/footer';

const isValidDate = (date: string | number | undefined | null): boolean => {
  if (!date) return false;
  try {
    const timestamp = new Date(date).getTime();
    return !isNaN(timestamp);
  } catch {
    return false;
  }
};

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0]);
  const [isLoading, setIsLoading] = useState(true);
  const { history, syncHistory } = useHistory(user?.id || '');

  useEffect(() => {
    const loadHistory = async () => {
      if (user?.id) {
        setIsLoading(true);
        await syncHistory();
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [user?.id, syncHistory]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await syncHistory();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <NavBar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative w-16 h-16"
              >
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-primary rounded-full animate-spin [border-top-color:transparent]" />
              </motion.div>
              <p className="text-muted-foreground">Loading your research history...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  const filteredHistory = history.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const parseHistoryAnswer = (item: any) => {
    if (!item) return null;
    
    try {
      const timestamp = isValidDate(item.created_at) 
        ? new Date(item.created_at).toISOString()
        : isValidDate(item.timestamp)
          ? new Date(item.timestamp).toISOString()
          : new Date().toISOString();

      // Handle case where answer is already an object
      if (item.answer && typeof item.answer === 'object') {
        const sources = item.answer.documents?.map((doc: any) => ({
          title: doc.title?.replace(/\n\s+/g, ' ').trim(),
          url: doc.url,
          excerpt: doc.content?.replace(/\n\s+/g, ' ').trim() || '',
          journal: doc.journal_title || '',
          year: doc.date ? new Date(doc.date).getFullYear() : undefined,
          date: doc.date ? new Date(doc.date).toISOString() : undefined,
          authors: doc.authors,
          journal_ref: doc.journal_ref,
          similarity: doc.similarity
        })) || [];

        return {
          ...item,
          timestamp,
          answer: {
            question: item.question,
            answer: item.answer.answer || item.answer,
            sources,
            from_websearch: item.answer.from_websearch,
            processing_time: item.answer.processing_time
          }
        };
      }

      // Handle case where answer is a string
      if (typeof item.answer === 'string') {
        try {
          // First try parsing as JSON
          const parsedAnswer = JSON.parse(item.answer);
          const sources = parsedAnswer.documents?.map((doc: any) => ({
            title: doc.title?.replace(/\n\s+/g, ' ').trim(),
            url: doc.url,
            excerpt: doc.content?.replace(/\n\s+/g, ' ').trim() || '',
            journal: doc.journal_title || '',
            year: doc.date ? new Date(doc.date).getFullYear() : undefined,
            date: doc.date ? new Date(doc.date).toISOString() : undefined,
            authors: doc.authors,
            journal_ref: doc.journal_ref,
            similarity: doc.similarity
          })) || [];

          return {
            ...item,
            timestamp,
            answer: {
              question: item.question,
              answer: parsedAnswer.answer.split('\n\nSources:')[0].trim(),
              sources,
              from_websearch: parsedAnswer.from_websearch,
              processing_time: parsedAnswer.processing_time
            }
          };
        } catch (jsonError) {
          // If JSON parsing fails, try parsing the markdown-style format
          const parts = item.answer.split('\n\nSources:\n');
          if (parts.length === 2) {
            const [mainAnswer, sourcesText] = parts;
            
            // Parse sources from markdown-style list
            const sourceLines = sourcesText.split('\n').filter(line => line.startsWith('* ['));
            const sources = sourceLines.map(line => {
              const titleMatch = line.match(/\[(.*?)\]/);
              const urlMatch = line.match(/\((.*?)\)/);
              const dateMatch = line.match(/\((\d{4})\)/); // Try to extract year if present in title
              return {
                title: titleMatch ? titleMatch[1] : '',
                url: urlMatch ? urlMatch[1] : '',
                excerpt: '', // No excerpt available in markdown format
                journal: '',
                year: dateMatch ? parseInt(dateMatch[1]) : undefined,
                date: undefined,
                authors: null,
                journal_ref: null,
                similarity: null
              };
            });

            return {
              ...item,
              timestamp,
              answer: {
                question: item.question,
                answer: mainAnswer.trim(),
                sources,
                from_websearch: false,
                processing_time: null
              }
            };
          }

          // If no sources section found, return just the answer
          return {
            ...item,
            timestamp,
            answer: {
              question: item.question,
              answer: item.answer,
              sources: [],
              from_websearch: false,
              processing_time: null
            }
          };
        }
      }

      // Default case - return a basic structure
      return {
        ...item,
        timestamp,
        answer: {
          question: item.question,
          answer: 'No response available',
          sources: [],
          from_websearch: false,
          processing_time: null
        }
      };

    } catch (error) {
      console.error('Error parsing history item:', error);
      return {
        ...item,
        timestamp: new Date().toISOString(),
        answer: {
          question: item.question,
          answer: 'Error loading response',
          sources: [],
          from_websearch: false,
          processing_time: null
        }
      };
    }
  };

  const selectedHistoryItem = history.find(item => item.id === selectedItem);
  const parsedHistoryItem = selectedHistoryItem ? parseHistoryAnswer(selectedHistoryItem) : null;

  return (
    <main className="min-h-screen flex flex-col">
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

      {/* Hero Section with Enhanced Gradient Background */}
      <section className="relative min-h-[30vh] flex items-center justify-center pt-20 pb-4">
        <motion.div 
          style={{ opacity }}
          className="container relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <div className="space-y-4">
              <div className="relative">
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-full blur-2xl opacity-50"
                />
                <h1 className="relative text-4xl font-bold tracking-tight sm:text-5xl">
                  Your Research{' '}
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                    Journey
                  </span>
                </h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Explore your past scientific inquiries and discoveries
              </p>
            </div>

            {/* Enhanced Search Input with Animation */}
            <div className="w-full max-w-2xl mx-auto">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full opacity-0 group-hover:opacity-100 animate-pulse-slow" />
                <Input
                  placeholder="Search your research history..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-background/60 backdrop-blur-sm border-border/50 hover:border-border focus:border-primary shadow-lg transition-all duration-300"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Main Content Section */}
      <section className="flex-1 container mx-auto px-4 py-8">
        {/* History Items Section with Clean Fade Animations */}
        <section className="py-2 relative">
          <div className="container max-w-3xl mx-auto px-4">
            <motion.div 
              className="space-y-2"
            >
              <AnimatePresence mode="sync" initial={false}>
                {filteredHistory.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }} // Quick, subtle fade
                  >
                    <Card className="group relative overflow-hidden border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-background/60 backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      
                      <button
                        onClick={() => setSelectedItem(item.id)}
                        className="w-full text-left"
                      >
                        <CardContent className="p-6 relative">
                          <div className="flex items-start gap-4">
                            <div className="shrink-0 p-3 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm border border-primary/10 shadow-inner">
                              <Brain className="h-6 w-6 text-primary/80" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="space-y-1">
                                <h3 className="font-medium text-lg truncate pr-4 group-hover:text-primary transition-colors duration-300">
                                  {item.question}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span className="text-xs">
                                    {isValidDate(item.created_at || item.timestamp)
                                      ? formatDate(new Date(item.created_at || item.timestamp))
                                      : 'Date unavailable'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </button>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Clean Empty State Animation */}
              {filteredHistory.length === 0 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="py-8"
                >
                  <Card className="p-8 border-dashed relative overflow-hidden bg-background/60 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
                    <CardContent className="space-y-4 flex flex-col items-center relative">
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 2, -2, 0]
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity,
                          ease: "easeInOut" 
                        }}
                        className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 shadow-inner"
                      >
                        <Brain className="h-8 w-8 text-primary/80" />
                      </motion.div>
                      <div className="space-y-2 text-center">
                        <h3 className="text-xl font-medium">No Results Found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                          Try adjusting your search terms or start a new research query
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="mt-4 relative overflow-hidden group bg-background/50 backdrop-blur-sm"
                        onClick={() => router.push('/ask')}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                        <span className="relative">Start New Research</span>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Enhanced Dialog with Better Desktop Layout */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto p-0 bg-background/95 backdrop-blur-md">
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
              <div className="max-w-4xl mx-auto px-6 py-4">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                    Research Findings
                  </DialogTitle>
                  <DialogDescription className="flex items-center gap-2">
                    {selectedHistoryItem?.timestamp && (
                      <>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(selectedHistoryItem.timestamp)}
                        </span>
                      </>
                    )}
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>

            {parsedHistoryItem && (
              <div className="relative">
                {/* Background effects for content area */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
                
                <div className="relative max-w-4xl mx-auto px-6 py-6">
                  <div className="prose prose-lg dark:prose-invert prose-primary max-w-none">
                    <h2 className="text-xl font-medium text-primary/80 mb-4">
                      Research Question
                    </h2>
                    <p className="text-lg mb-8">
                      {parsedHistoryItem.answer.question}
                    </p>
                  </div>
                  <ResearchResponse data={parsedHistoryItem.answer} />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
} 