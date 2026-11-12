import { useApiResource } from '../hooks/useApiResource.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const { data, error, loading } = useApiResource<{ activities: Activity[] }>('/api/activities');
  return (
    <section>
      <h2>Activities</h2>
      {loading && <p role="status">Loading activities...</p>}
      {error && <p role="alert">Unable to load activities: {error}</p>}
      {data && data.activities.length === 0 && <p>No activities yet.</p>}
      {data && data.activities.length > 0 && (
        <ul className="list-group">
          {data.activities.map((activity, index) => (
            <li className="list-group-item" key={`${activity.type}-${index}`}>
              {activity.type} - {activity.minutes} minutes - {activity.points} points
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
