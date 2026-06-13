export interface TeamBasic {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  country?: string | null;
}

export interface TeamRanking {
  rank: number;
  points?: number | null;
  date: string;
  team: TeamBasic;
}

export interface EventBasic {
  id: number;
  name: string;
  slug?: string | null;
  startDate: string;
  endDate?: string | null;
  prizePool?: string | null;
  location?: string | null;
  logoUrl?: string | null;
  numberOfTop10: number;
  isQualified: boolean;
}

export interface MatchResult {
  id: number;
  hltvId?: number | null;
  team1: TeamBasic;
  team2: TeamBasic;
  winner?: TeamBasic | null;
  score1?: number | null;
  score2?: number | null;
  format?: string | null;
  roundName?: string | null;
  date?: string | null;
}

export interface EventStageWithMatches {
  id: number;
  name: string;
  type: "group" | "playoff" | "swiss" | "other";
  order: number;
  matches: MatchResult[];
}

export interface EventFull extends EventBasic {
  format?: string | null;
  stages: EventStageWithMatches[];
  teams: Array<{
    seed?: number | null;
    placement?: number | null;
    isTop10: boolean;
    team: TeamBasic;
  }>;
}

export interface BracketNode {
  match: MatchResult;
  round: number;
  position: number;
  nextMatchPosition?: number;
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  pageSize?: number;
}

export interface SyncStatus {
  lastSync?: string;
  status: "idle" | "running" | "error";
  message?: string;
  itemsSynced?: number;
}
