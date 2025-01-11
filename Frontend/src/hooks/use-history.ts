import { useState, useEffect, useCallback } from 'react';
import type { ResearchResponse } from '@/types/research';

export interface HistoryItem {
  id: string;
  question: string;
  answer: ResearchResponse;
  timestamp: number;
  created_at?: string;
}

interface UseHistoryReturn {
  history: HistoryItem[];
  isLoading: boolean;
  error: string | null;
  syncHistory: () => Promise<void>;
  addToHistory: (item: Omit<HistoryItem, 'id'>) => Promise<void>;
  deleteFromHistory: (id: string) => Promise<void>;
}

export function useHistory(userId: string): UseHistoryReturn {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with backend
  const syncHistory = useCallback(async () => {
    if (!userId) {
      setError('No user ID provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/history', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.queries) {
        throw new Error('Invalid response format');
      }

      // Sort by timestamp, newest first
      const sortedHistory = data.queries.sort((a: HistoryItem, b: HistoryItem) => {
        const timeA = new Date(a.created_at || a.timestamp).getTime();
        const timeB = new Date(b.created_at || b.timestamp).getTime();
        return timeB - timeA;
      });

      setHistory(sortedHistory);
    } catch (error) {
      console.error('Error syncing history:', error);
      setError(error instanceof Error ? error.message : 'Failed to sync history');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const addToHistory = useCallback(async (item: Omit<HistoryItem, 'id'>) => {
    if (!userId) return;
    try {
      await syncHistory(); // Just sync to get the latest history
    } catch (error) {
      console.error('Error updating history:', error);
    }
  }, [userId, syncHistory]);

  const deleteFromHistory = useCallback(async (id: string) => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete history item');
      }

      await syncHistory(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting history item:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete history item');
    }
  }, [userId, syncHistory]);

  // Initial sync when component mounts
  useEffect(() => {
    if (userId) {
      syncHistory();
    }
  }, [userId, syncHistory]);

  return {
    history,
    isLoading,
    error,
    syncHistory,
    addToHistory,
    deleteFromHistory,
  };
} 