import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type ResourceState<T> = {
  data?: T;
  error?: string;
  loading: boolean;
};

export function useApiResource<T>(path: string): ResourceState<T> {
  const [state, setState] = useState<ResourceState<T>>({ loading: true });

  useEffect(() => {
    let active = true;
    setState({ loading: true });
    getJson<T>(path).then((data) => {
      if (active) setState({ data, loading: false });
    }).catch((error: unknown) => {
      if (active) {
        setState({
          error: error instanceof Error ? error.message : 'Unknown error',
          loading: false,
        });
      }
    });
    return () => {
      active = false;
    };
  }, [path]);

  return state;
}
