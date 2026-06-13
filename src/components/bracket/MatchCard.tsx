"use client";

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

interface MatchCardProps {
  match: Match;
  compact?: boolean;
}

export function MatchCard({ match, compact = false }: MatchCardProps) {
  const { team1, team2, winner, score1, score2 } = match;
  const hasResult = winner !== null && winner !== undefined;

  function TeamRow({ team, score, isWinner }: { team: Team; score?: number | null; isWinner: boolean }) {
    return (
      <div
        className={`flex items-center justify-between px-2 py-1 ${
          isWinner ? "bg-cs-dark" : ""
        } ${!hasResult ? "" : isWinner ? "text-white" : "text-cs-muted"}`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {team.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team.logoUrl} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
          )}
          <span className={`text-xs font-medium truncate ${isWinner ? "text-cs-orange" : ""}`}>
            {team.name}
          </span>
        </div>
        {hasResult && (
          <span className={`text-xs font-bold ml-2 flex-shrink-0 ${isWinner ? "text-white" : "text-cs-muted"}`}>
            {score ?? 0}
          </span>
        )}
      </div>
    );
  }

  const team1Wins = winner?.id === team1.id;
  const team2Wins = winner?.id === team2.id;

  return (
    <div
      className={`border border-cs-border rounded overflow-hidden bg-cs-darker ${
        compact ? "min-w-[160px]" : "min-w-[200px]"
      }`}
    >
      {match.roundName && !compact && (
        <div className="text-[10px] text-cs-muted px-2 pt-1 font-medium uppercase tracking-wide">
          {match.roundName}
        </div>
      )}
      <TeamRow team={team1} score={score1} isWinner={team1Wins} />
      <div className="h-px bg-cs-border" />
      <TeamRow team={team2} score={score2} isWinner={team2Wins} />
    </div>
  );
}
