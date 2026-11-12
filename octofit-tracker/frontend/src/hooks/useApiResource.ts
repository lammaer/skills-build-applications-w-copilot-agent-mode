import { useEffect, useState } from 'react';

type ResourceState<T> = {
  data?: T;
  error?: string;
  loading: boolean;
};

export function useApiResource<T>(load: () => Promise<T>): ResourceState<T> {
  const [state, setState] = useState<ResourceState<T>>({ loading: true });

  useEffect(() => {
    let active = true;
    setState({ loading: true });
    load().then((data) => {
      if (active) setState({ data, loading: false });
    }).catch((error: unknown) => {
      if (active) {
        setState({
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false,
        });
      }
    });
    // Ignore responses after unmount or when the requested resource changes.
    return () => {
      active = false;
    };
  }, [load]);

  return state;
}
