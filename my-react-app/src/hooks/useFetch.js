import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../utils/api';

export default function useFetch(path, options = {}, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetcher = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}${path}`, options);
      const text = await res.text();
      try { const json = JSON.parse(text); setData(json); } catch (e) { setData(text); }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [path, JSON.stringify(options)]);

  useEffect(() => {
    fetcher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: fetcher };
}
