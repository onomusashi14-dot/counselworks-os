"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiError } from "./api";

export type LoadState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  reload: () => void;
};

const CACHE_PREFIX = "cw.q.";

function tokenTail(token: string): string {
  return token.slice(-12);
}

function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or private-mode Safari — skip caching this entry
  }
}

export function useAuthedQuery<T>(
  fetcher: (token: string) => Promise<T>,
  token: string | null,
  cacheKey?: string
): LoadState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const storageKey =
    token && cacheKey
      ? `${CACHE_PREFIX}${cacheKey}:${tokenTail(token)}`
      : null;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let alive = true;

    const cached = storageKey ? readCache<T>(storageKey) : null;
    if (cached !== null) {
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);

    fetcherRef.current(token)
      .then((d) => {
        if (!alive) return;
        setData(d);
        setLoading(false);
        if (storageKey) writeCache(storageKey, d);
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
  }, [token, storageKey, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload };
}
