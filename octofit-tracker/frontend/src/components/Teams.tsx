import { useApiResource } from '../hooks/useApiResource.js';

type Team = { name: string; mascot?: string; members?: unknown[] };

export default function Teams() {
  const { data, error, loading } = useApiResource<{ teams: Team[] }>('/api/teams');
  return (
    <section>
      <h2>Teams</h2>
      {loading && <p role="status">Loading teams...</p>}
      {error && <p role="alert">Unable to load teams: {error}</p>}
      {data && data.teams.length === 0 && <p>No teams yet.</p>}
      {data && data.teams.length > 0 && (
        <ul className="list-group">
          {data.teams.map((team) => (
            <li className="list-group-item" key={team.name}>
              <strong>{team.name}</strong>
              {team.mascot && <span> - {team.mascot}</span>}
              <span> - {team.members?.length ?? 0} members</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
