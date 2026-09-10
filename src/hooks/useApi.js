import { useState, useCallback } from 'react';

export function useApi(apiFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message ?? 'An unexpected error occurred.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn],
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
  }, []);

  return { execute, loading, error, data, reset };
}
