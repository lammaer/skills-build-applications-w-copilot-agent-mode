import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { useApiResource } from '../hooks/useApiResource.js';

type Workout = { title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string };

export default function Workouts() {
  const loadSuggestions = useCallback(
    () => getJson<{ suggestions: Workout[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`),
    [],
  );
  const { data, error, loading } = useApiResource(loadSuggestions);
  return (
    <section>
      <h2>Workout suggestions</h2>
      {loading && <p role="status">Loading workout suggestions...</p>}
      {error && <p role="alert">Unable to load workout suggestions: {error}</p>}
      {data && data.suggestions.length === 0 && <p>No workout suggestions yet.</p>}
      {data && data.suggestions.length > 0 && (
        <ul className="list-group">
          {data.suggestions.map((workout) => (
            <li className="list-group-item" key={workout.title}>
              <strong>{workout.title}</strong>
              {workout.focus && <span> - {workout.focus}</span>}
              {workout.minutes !== undefined && <span> - {workout.minutes} minutes</span>}
              {workout.difficulty && <span> - {workout.difficulty}</span>}
              {workout.reason && <p className="mb-0">{workout.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
