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
}

function buildRounds(matches: Match[]): Match[][] {
  if (matches.length === 0) return [];

  const labeled = matches.map((m) => ({
    ...m,
    roundLabel: m.roundName?.toLowerCase() ?? "",
  }));

  const roundOrder = ["ro16", "quarterfinal", "semifinal", "grand final", "final", "3rd place"];
  const grouped = new Map<string, Match[]>();

  for (const m of labeled) {
    const key = m.roundLabel || "other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(m);
  }

  const sortedKeys = Array.from(grouped.keys()).sort((a, b) => {
    const ai = roundOrder.indexOf(a);
    const bi = roundOrder.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return sortedKeys.map((k) => grouped.get(k)!);
}

export function SingleEliminationBracket({ matches }: Props) {
  const rounds = buildRounds(matches);

  if (rounds.length === 0) {
    return <p className="text-cs-muted text-sm">No matches available</p>;
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {rounds.map((roundMatches, ri) => (
          <div key={ri} className="flex flex-col">
            <div className="text-xs font-semibold uppercase tracking-wider text-cs-muted mb-3 text-center">
              {roundMatches[0]?.roundName ?? `Round ${ri + 1}`}
            </div>
            <div
              className="flex flex-col"
              style={{ gap: `${Math.pow(2, ri) * 8}px` }}
            >
              {roundMatches.map((match, mi) => (
                <div key={match.id} className="relative flex items-center">
                  <MatchCard match={match} compact />
                  {ri < rounds.length - 1 && (
                    <div className="absolute right-0 translate-x-full flex items-center h-full">
                      <div className="w-8 h-px bg-cs-border" />
                      <div
                        className="absolute right-0 border-r border-cs-border"
                        style={{
                          height: `${Math.pow(2, ri) * 8 + 32}px`,
                          top: mi % 2 === 0 ? "50%" : undefined,
                          bottom: mi % 2 === 1 ? "50%" : undefined,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
