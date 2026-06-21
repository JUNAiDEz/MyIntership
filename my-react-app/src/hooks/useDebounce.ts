import { useState, useEffect } from 'react';

export default function useDebounce<T>(value: T, delay = 350): T {
  const [state, setState] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setState(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return state;
}
