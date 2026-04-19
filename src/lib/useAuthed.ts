"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiError } from "./api";

export type LoadState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
};

export function useAuthedQuery<T>(
  fetcher: (token: string) => Promise<T>,
  token: string | null
): LoadState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    fetcherRef.current(token)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        const err = e as ApiError;
        setError(err?.message || "Failed to load");
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [token, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload };
}
