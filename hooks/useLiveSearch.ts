"use client";

import { useEffect, useRef, useState } from "react";

interface LiveSearchState {
  /** Debounced query used for search execution. */
  debouncedQuery: string;
  /** True while the input differs from the debounced query (search in flight). */
  isPending: boolean;
  /** Monotonic id — only the latest search generation may update results. */
  generation: number;
}

/**
 * Debounced live search input.
 * Clears immediately when the query is emptied (X button).
 */
export function useLiveSearch(inputQuery: string, delayMs = 200): LiveSearchState {
  const [debouncedQuery, setDebouncedQuery] = useState(inputQuery);
  const [isPending, setIsPending] = useState(false);
  const [generation, setGeneration] = useState(0);
  const generationRef = useRef(0);

  useEffect(() => {
    const trimmed = inputQuery.trim();

    if (trimmed === "") {
      generationRef.current += 1;
      setGeneration(generationRef.current);
      setDebouncedQuery("");
      setIsPending(false);
      return;
    }

    if (inputQuery.trim() === debouncedQuery.trim()) {
      setIsPending(false);
      return;
    }

    setIsPending(true);
    const scheduledGeneration = generationRef.current + 1;

    const timer = window.setTimeout(() => {
      generationRef.current = scheduledGeneration;
      setGeneration(scheduledGeneration);
      setDebouncedQuery(inputQuery);
      setIsPending(false);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [debouncedQuery, delayMs, inputQuery]);

  return { debouncedQuery, isPending, generation };
}
