"use client";

import { useEffect, useState } from "react";

interface Team {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  country?: string | null;
  rankings: Array<{ rank: number; date: string }>;
  _count: { eventTeams: number };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTeams = async (q = "") => {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: "100" });
    if (q) params.set("search", q);
    const res = await fetch(`/api/teams?${params}`);
    const json = await res.json();
    setTeams(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Teams</h1>
        <p className="text-cs-muted text-sm">All teams that have been in the CS top 10 since 2015</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchTeams(search)}
          className="px-3 py-1.5 text-sm bg-cs-card border border-cs-border rounded-md text-cs-text placeholder-cs-muted focus:outline-none focus:border-cs-orange w-72"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-20 bg-cs-card border border-cs-border rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {teams.map((team) => (
            <div
              key={team.id}
              className="bg-cs-card border border-cs-border rounded-lg p-3 flex items-center gap-3"
            >
              {team.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={team.logoUrl} alt="" className="w-8 h-8 object-contain flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded bg-cs-dark flex-shrink-0" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{team.name}</p>
                <div className="flex items-center gap-2 text-xs text-cs-muted">
                  {team.rankings[0] && <span>Rank #{team.rankings[0].rank}</span>}
                  <span>{team._count.eventTeams} events</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
