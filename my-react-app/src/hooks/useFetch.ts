import { useState, useEffect, useCallback, type DependencyList } from 'react';
import { API_URL } from '@/utils/api';

export interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

export default function useFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  deps: DependencyList = [],
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fetcher = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}${path}`, options);
      const text = await res.text();
      try {
        const json = JSON.parse(text) as T;
        setData(json);
      } catch {
        setData(text as unknown as T);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, JSON.stringify(options)]);

  useEffect(() => {
    fetcher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: fetcher };
}
