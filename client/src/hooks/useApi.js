import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Minimal data-fetching hook used by every page.
 *
 *   const { data, loading, error, reload } = useApi(() => api.get('/stats'), []);
 *
 * - loading: true until the first fetch settles (drives skeleton states)
 * - error:   a normalized Error (drives error states with a Retry button)
 * - reload:  re-runs the loader (wired to the Retry button)
 */
export function useApi(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    Promise.resolve(loaderRef.current())
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
