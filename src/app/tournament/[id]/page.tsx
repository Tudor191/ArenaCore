"use client";

import { useEffect, useState } from "react";
import { SingleEliminationBracket } from "@/components/bracket/SingleEliminationBracket";
import { GroupStage } from "@/components/bracket/GroupStage";
import Link from "next/link";

interface Team {
  id: number;
  name: string;
  logoUrl?: string | null;
  country?: string | null;
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

interface Stage {
  id: number;
  name: string;
  type: string;
  order: number;
  matches: Match[];
}

interface EventTeam {
  seed?: number | null;
  placement?: number | null;
  isTop10: boolean;
  team: Team;
}

interface EventDetail {
  id: number;
  name: string;
  startDate: string;
  endDate?: string;
  prizePool?: string;
  location?: string;
  logoUrl?: string;
  numberOfTop10: number;
  teams: EventTeam[];
  stages: Stage[];
  matches: Match[];
}

export default function TournamentPage({ params }: { params: { id: string } }) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState<number | "all">("all");

  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((r) => r.json())
      .then((json) => {
        setEvent(json.data);
        if (json.data?.stages?.length > 0) {
          setActiveStage(json.data.stages[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-cs-card border border-cs-border rounded-lg animate-pulse" />
        <div className="h-96 bg-cs-card border border-cs-border rounded-lg animate-pulse" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-20">
        <p className="text-cs-muted">Tournament not found</p>
        <Link href="/" className="text-cs-orange text-sm mt-2 block hover:underline">
          ← Back to tournaments
        </Link>
      </div>
    );
  }

  const allStagesMatches = [
    ...event.stages.flatMap((s) => s.matches),
    ...event.matches,
  ];

  const playoffStages = event.stages.filter((s) =>
    s.type === "playoff" || s.name.toLowerCase().includes("playoff")
  );

  const otherStages = event.stages.filter((s) => !playoffStages.includes(s));

  const activeStageData =
    activeStage === "all"
      ? null
      : event.stages.find((s) => s.id === activeStage);

  const isPlayoff = activeStageData
    ? activeStageData.type === "playoff" || activeStageData.name.toLowerCase().includes("playoff")
    : false;

  const top10Teams = event.teams.filter((t) => t.isTop10);
  const otherTeams = event.teams.filter((t) => !t.isTop10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-cs-card border border-cs-border rounded-lg p-6">
        <Link href="/" className="text-cs-muted text-xs hover:text-white mb-3 block">
          ← All Tournaments
        </Link>
        <div className="flex items-start gap-4">
          {event.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.logoUrl} alt="" className="w-16 h-16 object-contain flex-shrink-0" />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-cs-muted">
              <span>
                {new Date(event.startDate).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
                {event.endDate && ` – ${new Date(event.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`}
              </span>
              {event.location && <span>📍 {event.location}</span>}
              {event.prizePool && <span>💰 {event.prizePool}</span>}
            </div>
            <div className="flex gap-3 mt-2">
              <span className="text-xs bg-cs-dark border border-cs-border px-2 py-0.5 rounded text-cs-orange">
                {event.numberOfTop10} top-10 teams
              </span>
              <span className="text-xs bg-cs-dark border border-cs-border px-2 py-0.5 rounded text-cs-muted">
                {allStagesMatches.length} matches
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Teams sidebar */}
        <div className="xl:col-span-1 space-y-4">
          {top10Teams.length > 0 && (
            <div className="bg-cs-card border border-cs-border rounded-lg p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-cs-orange mb-3">
                Top 10 Teams
              </h2>
              <div className="space-y-2">
                {top10Teams.map((et) => (
                  <div key={et.team.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {et.team.logoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={et.team.logoUrl} alt="" className="w-5 h-5 object-contain" />
                      )}
                      <span className="text-sm">{et.team.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-cs-muted">
                      {et.seed && <span>#{et.seed}</span>}
                      {et.placement && <span className="text-cs-orange">{et.placement}th</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherTeams.length > 0 && (
            <div className="bg-cs-card border border-cs-border rounded-lg p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-cs-muted mb-3">
                Other Teams
              </h2>
              <div className="space-y-2">
                {otherTeams.map((et) => (
                  <div key={et.team.id} className="flex items-center justify-between">
                    <span className="text-sm text-cs-muted">{et.team.name}</span>
                    {et.placement && (
                      <span className="text-xs text-cs-muted">{et.placement}th</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bracket / Matches */}
        <div className="xl:col-span-3">
          {/* Stage tabs */}
          {event.stages.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {event.stages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(stage.id)}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    activeStage === stage.id
                      ? "bg-cs-orange border-cs-orange text-white"
                      : "bg-cs-card border-cs-border text-cs-muted hover:border-cs-orange"
                  }`}
                >
                  {stage.name}
                </button>
              ))}
              {event.matches.length > 0 && (
                <button
                  onClick={() => setActiveStage("all")}
                  className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                    activeStage === "all"
                      ? "bg-cs-orange border-cs-orange text-white"
                      : "bg-cs-card border-cs-border text-cs-muted hover:border-cs-orange"
                  }`}
                >
                  All Matches
                </button>
              )}
            </div>
          )}

          <div className="bg-cs-card border border-cs-border rounded-lg p-4">
            {activeStage === "all" && event.matches.length > 0 ? (
              <SingleEliminationBracket matches={event.matches} />
            ) : activeStageData ? (
              isPlayoff ? (
                <SingleEliminationBracket matches={activeStageData.matches} />
              ) : (
                <GroupStage matches={activeStageData.matches} stageName={activeStageData.name} />
              )
            ) : (
              /* Fallback: show all matches from all stages grouped */
              <div className="space-y-8">
                {otherStages.map((stage) => (
                  <GroupStage key={stage.id} matches={stage.matches} stageName={stage.name} />
                ))}
                {playoffStages.map((stage) => (
                  <div key={stage.id}>
                    <h3 className="text-sm font-semibold text-cs-muted uppercase tracking-wide mb-3">
                      {stage.name}
                    </h3>
                    <SingleEliminationBracket matches={stage.matches} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
