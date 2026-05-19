
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTranscript } from '@/lib/api';
import { TranscriptAPIResponse } from '@/types';

interface UseTranscriptResult {
  transcript: TranscriptAPIResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTranscript(studentId: string | null): UseTranscriptResult {
  const [transcript, setTranscript] = useState<TranscriptAPIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTranscript = useCallback(async () => {
    if (!studentId) {
      setTranscript(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log(`📄 Fetching transcript for student ID: ${studentId}`);

    try {
      const data = await getTranscript(studentId);
      
      // Console log the API response
      console.log('📜 Transcript API Response:', data);
      console.log('👤 Student:', data.student);
      console.log('📚 Academic Years:', Object.keys(data.transcript));
      
      // Log each year's courses
      Object.entries(data.transcript).forEach(([year, yearData]) => {
        console.log(`${year}:`, yearData);
      });
      
      setTranscript(data);
    } catch (err) {
      console.error('Error fetching transcript:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transcript');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchTranscript();
  }, [fetchTranscript]);

  return {
    transcript,
    isLoading,
    error,
    refetch: fetchTranscript,
  };
}