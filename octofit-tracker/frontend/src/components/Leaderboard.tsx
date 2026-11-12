import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { useApiResource } from '../hooks/useApiResource.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const loadLeaderboard = useCallback(
    () => getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard'),
    [],
  );
  const { data, error, loading } = useApiResource(loadLeaderboard);
  return (
    <section>
      <h2>Leaderboard</h2>
      {loading && <p role="status">Loading leaderboard...</p>}
      {error && <p role="alert">Unable to load leaderboard: {error}</p>}
      {data && data.leaderboard.length === 0 && <p>No leaderboard rankings yet.</p>}
      {data && data.leaderboard.length > 0 && (
        <ol className="list-group list-group-numbered">
          {data.leaderboard.map((entry) => (
            <li className="list-group-item d-flex justify-content-between" key={entry.rank}>
              <span>{entry.teamName}</span>
              <span>{entry.totalPoints} points</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
