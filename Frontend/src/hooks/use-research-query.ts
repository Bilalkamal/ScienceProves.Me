import { useState, useCallback, useRef, useEffect } from 'react';
import type { ResearchResponse } from '@/types/research';
import { getLoaderStateIndex } from '@/lib/loader-utils';

interface ResearchQueryState {
  status: string;
  answer: Partial<ResearchResponse> | null;
  isLoading: boolean;
  error: string | null;
  currentLoaderState: number;
}

interface UseResearchQueryReturn {
  submitQuestion: (question: string, userId: string) => void;
  state: ResearchQueryState;
  reset: () => void;
}

const RECONNECT_TIMEOUT = 3000;
const MAX_RETRIES = 3;

export function useResearchQuery(): UseResearchQueryReturn {
  const [state, setState] = useState<ResearchQueryState>({
    status: '',
    answer: null,
    isLoading: false,
    error: null,
    currentLoaderState: 0
  });
  const eventSourceRef = useRef<EventSource | null>(null);
  const retriesRef = useRef(0);

  const cleanup = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cleanup();
    setState({
      status: '',
      answer: null,
      isLoading: false,
      error: null,
      currentLoaderState: 0
    });
    retriesRef.current = 0;
  }, [cleanup]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const submitQuestion = useCallback(async (question: string, userId: string) => {
    setState({
      status: '',
      answer: null,
      isLoading: true,
      error: null,
      currentLoaderState: 0
    });
    
    cleanup();
    
    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.body) {
        throw new Error('No response body received');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);

        // Split the chunk into individual events more carefully
        const events = chunk
          .split(/event:/)
          .slice(1) // Remove the first empty element
          .map(event => `event:${event.trim()}`);

        for (const event of events) {
          try {
            // Parse event type and data
            const lines = event.split('\n').map(line => line.trim()).filter(Boolean);
            const eventType = lines[0].replace('event:', '').trim();
            const dataLine = lines.find(line => line.startsWith('data:'));

            if (!dataLine) {
              continue;
            }

            const data = dataLine.replace('data:', '').trim();

            try {
              const parsedData = JSON.parse(data);

              switch (eventType) {
                case 'status':
                  setState(prev => ({
                    ...prev,
                    currentLoaderState: getLoaderStateIndex(parsedData.status)
                  }));
                  break;

                case 'answer':
                  // Split the content into answer and sources sections
                  const [answerText] = parsedData.content.split('\n\nSources:');
                  setState(prev => ({
                    ...prev,
                    answer: {
                      ...prev.answer,
                      question,
                      answer: answerText.trim(),
                      bulletPoints: parsedData.bullet_points || [],
                    },
                  }));
                  break;

                case 'document':
                  if (!parsedData.title || !parsedData.content) {
                    continue;
                  }

                  setState(prev => {
                    // Get existing sources
                    const existingSources = prev.answer?.sources || [];
                    
                    // Create new source object
                    const newSource = {
                      title: parsedData.title.replace(/\[(.*?)\]/, '$1').trim(),
                      excerpt: parsedData.content.trim(),
                      journal: parsedData.journal_title || parsedData.journal || '',
                      year: parsedData.date ? new Date(parsedData.date).getFullYear() : new Date().getFullYear(),
                      url: parsedData.url.startsWith('http') ? parsedData.url : `https://${parsedData.url}`,
                    };

                    // Check if source with same URL already exists
                    const sourceExists = existingSources.some(
                      source => source.url === newSource.url
                    );

                    // Only add if it's a new source
                    if (!sourceExists) {
                      return {
                        ...prev,
                        answer: {
                          ...prev.answer,
                          sources: [...existingSources, newSource],
                        },
                      };
                    }

                    // Return unchanged state if source already exists
                    return prev;
                  });
                  break;

                case 'error':
                  setState(prev => ({
                    ...prev,
                    error: parsedData.message,
                    isLoading: false,
                  }));
                  break;

                case 'complete':
                  setState(prev => ({ ...prev, isLoading: false, status: '' }));
                  break;

                default:
                  // Don't throw the error, just log it and continue
                  continue;
              }
            } catch (parseError) {
              // Don't throw the error, just log it and continue
              continue;
            }
          } catch (eventError) {
            // Don't throw the error, just log it and continue
            continue;
          }
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "An error occurred while processing your question. Please try again.",
        isLoading: false,
      }));
    }
  }, [cleanup]);

  return {
    submitQuestion,
    state,
    reset,
  };
} 