"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!token) return;
    let alive = true;
    setLoading(true);
    setError(null);
    fetcher(token)
      .then((d) => {
        if (alive) {
          setData(d);
          setLoading(false);
        }
      })
      .catch((e) => {
        const err = e as ApiError;
        if (alive) {
          setError(err?.message || "Failed to load");
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [token, fetcher, tick]);

  return { data, error, loading, reload: () => setTick((t) => t + 1) };
}
