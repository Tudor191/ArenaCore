"use client";

import { MatchCard } from "./MatchCard";

interface Team {
  id: number;
  name: string;
  logoUrl?: string | null;
}

interface Match {
  id: number;
  team1: Team;
  team2: Team;
  winner?: Team | null;
  score1?: number | null;
  score2?: number | null;
  format?: string | null;
  roundName?: string | null;
}

interface Props {
  matches: Match[];
  stageName: string;
}

export function GroupStage({ matches, stageName }: Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-cs-muted uppercase tracking-wide mb-3">
        {stageName}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {matches.map((m) => (
          <MatchCard key={m.id} match={m} />
        ))}
      </div>
    </div>
  );
}
