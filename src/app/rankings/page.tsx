"use client";

import { useEffect, useState } from "react";

interface RankingEntry {
  id: number;
  rank: number;
  points?: number | null;
  date: string;
  team: {
    id: number;
    name: string;
    logoUrl?: string | null;
    country?: string | null;
  };
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [date, setDate] = useState("");
  const [rankDate, setRankDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRankings = async (d = "") => {
    setLoading(true);
    const params = new URLSearchParams();
    if (d) params.set("date", d);
    const res = await fetch(`/api/rankings?${params}`);
    const json = await res.json();
    setRankings(json.data ?? []);
    setRankDate(json.date ?? null);
    setLoading(false);
  };

  useEffect(() => {
    fetchRankings();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">CS Top 10 Rankings</h1>
        <p className="text-cs-muted text-sm">Historical top-10 rankings used to qualify tournaments</p>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min="2015-01-01"
          max={new Date().toISOString().slice(0, 10)}
          className="px-3 py-1.5 text-sm bg-cs-card border border-cs-border rounded-md text-cs-text focus:outline-none focus:border-cs-orange"
        />
        <button
          onClick={() => fetchRankings(date)}
          className="px-3 py-1.5 text-sm bg-cs-orange text-white rounded-md hover:bg-orange-500 transition-colors"
        >
          View Rankings
        </button>
        {date && (
          <button
            onClick={() => { setDate(""); fetchRankings(""); }}
            className="px-3 py-1.5 text-sm bg-cs-card border border-cs-border text-cs-muted rounded-md hover:border-cs-orange transition-colors"
          >
            Latest
          </button>
        )}
      </div>

      {rankDate && (
        <p className="text-xs text-cs-muted mb-4">
          Rankings as of {new Date(rankDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      )}

      <div className="bg-cs-card border border-cs-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-10 bg-cs-dark rounded animate-pulse" />
            ))}
          </div>
        ) : rankings.length === 0 ? (
          <div className="p-10 text-center text-cs-muted">
            <p>No ranking data available.</p>
            <p className="text-xs mt-1">Run a sync to populate rankings.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-cs-border text-left text-xs font-medium text-cs-muted uppercase tracking-wider">
                <th className="px-4 py-3 w-12">#</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cs-border">
              {rankings.map((entry) => (
                <tr key={entry.id} className="hover:bg-cs-dark transition-colors">
                  <td className="px-4 py-3 text-cs-orange font-bold text-sm">
                    {entry.rank}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {entry.team.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={entry.team.logoUrl} alt="" className="w-6 h-6 object-contain" />
                      ) : (
                        <div className="w-6 h-6 rounded bg-cs-dark" />
                      )}
                      <span className="text-sm font-medium">{entry.team.name}</span>
                      {entry.team.country && (
                        <span className="text-xs text-cs-muted">{entry.team.country}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-cs-muted">
                    {entry.points ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
