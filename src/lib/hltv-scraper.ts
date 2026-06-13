import { HLTV } from "hltv";
import { prisma } from "./db";

const DELAY_MS = 2500;
const MIN_TOP10_TEAMS = 5;
const START_YEAR = 2015;

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
] as const;

type HltvYear = 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022;
type HltvMonth = typeof MONTHS[number];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeCall<T>(fn: () => Promise<T>, label: string, retries = 3): Promise<T | null> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const result = await fn();
      await sleep(DELAY_MS);
      return result;
    } catch (err) {
      const wait = DELAY_MS * (attempt + 2);
      console.warn(`[Scraper] ${label} failed (attempt ${attempt + 1}/${retries}), retrying in ${wait}ms:`, err);
      if (attempt < retries - 1) await sleep(wait);
    }
  }
  console.error(`[Scraper] ${label} failed after all retries`);
  return null;
}

// ─── Rankings ────────────────────────────────────────────────────────────────

export async function fetchCurrentRankings() {
  const rankings = await safeCall(() => HLTV.getTeamRanking(), "getTeamRanking (current)");
  if (!rankings) return [];

  const saved = [];
  const now = new Date();
  const rankDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (const entry of rankings.slice(0, 20)) {
    if (!entry.team.id) continue;

    await prisma.team.upsert({
      where: { id: entry.team.id },
      update: { name: entry.team.name },
      create: {
        id: entry.team.id,
        name: entry.team.name,
        slug: slugify(entry.team.name),
      },
    });

    await prisma.teamRanking.upsert({
      where: { teamId_date: { teamId: entry.team.id, date: rankDate } },
      update: { rank: entry.place, points: entry.points },
      create: { teamId: entry.team.id, rank: entry.place, points: entry.points, date: rankDate },
    });

    saved.push({ teamId: entry.team.id, rank: entry.place });
  }

  return saved;
}

export async function fetchHistoricalRankings() {
  console.log("[Scraper] Fetching historical rankings (2015-2022)...");
  let count = 0;

  for (let year = START_YEAR; year <= 2022; year++) {
    for (const month of MONTHS) {
      const rankings = await safeCall(
        () => HLTV.getTeamRanking({ year: year as HltvYear, month: month as HltvMonth }),
        `getTeamRanking(${year} ${month})`
      );
      if (!rankings) continue;

      const monthIndex = MONTHS.indexOf(month as HltvMonth);
      const rankDate = new Date(year, monthIndex, 1);

      for (const entry of rankings.slice(0, 15)) {
        if (!entry.team.id) continue;

        await prisma.team.upsert({
          where: { id: entry.team.id },
          update: { name: entry.team.name },
          create: {
            id: entry.team.id,
            name: entry.team.name,
            slug: slugify(entry.team.name),
          },
        });

        await prisma.teamRanking.upsert({
          where: { teamId_date: { teamId: entry.team.id, date: rankDate } },
          update: { rank: entry.place, points: entry.points },
          create: { teamId: entry.team.id, rank: entry.place, points: entry.points, date: rankDate },
        });
        count++;
      }
    }
  }

  return count;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function fetchPastEvents(startDate: string, endDate: string) {
  console.log(`[Scraper] Fetching past events from ${startDate} to ${endDate}...`);

  const events = await safeCall(
    () => HLTV.getPastEvents({ startDate, endDate, delayBetweenPageRequests: 1500 }),
    `getPastEvents(${startDate}-${endDate})`
  );

  if (!events) return 0;

  console.log(`[Scraper] Found ${events.length} past events — fetching details...`);
  let qualified = 0;

  for (const ev of events) {
    try {
      const detail = await safeCall(() => HLTV.getEvent({ id: ev.id }), `getEvent(${ev.id})`);
      if (!detail) continue;

      const teams = detail.teams ?? [];
      const top10Count = teams.filter((t) => (t.rankDuringEvent ?? 999) <= 10).length;
      const isQualified = top10Count >= MIN_TOP10_TEAMS;

      const eventStart = new Date(ev.dateStart);
      const eventEnd = ev.dateEnd ? new Date(ev.dateEnd) : null;

      await prisma.event.upsert({
        where: { id: ev.id },
        update: {
          name: ev.name,
          startDate: eventStart,
          endDate: eventEnd,
          prizePool: ev.prizePool ?? detail.prizePool ?? null,
          location: ev.location?.name ?? detail.location?.name ?? null,
          logoUrl: detail.logo ?? null,
          numberOfTop10: top10Count,
          isQualified,
          updatedAt: new Date(),
        },
        create: {
          id: ev.id,
          name: ev.name,
          slug: slugify(ev.name),
          startDate: eventStart,
          endDate: eventEnd,
          prizePool: ev.prizePool ?? detail.prizePool ?? null,
          location: ev.location?.name ?? detail.location?.name ?? null,
          logoUrl: detail.logo ?? null,
          numberOfTop10: top10Count,
          isQualified,
        },
      });

      if (isQualified) {
        qualified++;
        await saveEventTeams(ev.id, teams);
        await saveEventMatches(ev.id);
      }
    } catch (err) {
      console.error(`[Scraper] Error processing event ${ev.id}:`, err);
    }
  }

  return qualified;
}

async function saveEventTeams(
  eventId: number,
  teams: Array<{ id?: number; name: string; rankDuringEvent?: number }>
) {
  for (const team of teams) {
    if (!team.id) continue;

    await prisma.team.upsert({
      where: { id: team.id },
      update: { name: team.name },
      create: { id: team.id, name: team.name, slug: slugify(team.name) },
    });

    const isTop10 = (team.rankDuringEvent ?? 999) <= 10;

    await prisma.eventTeam.upsert({
      where: { eventId_teamId: { eventId, teamId: team.id } },
      update: { isTop10 },
      create: { eventId, teamId: team.id, isTop10 },
    });
  }
}

async function saveEventMatches(eventId: number) {
  const results = await safeCall(
    () => HLTV.getResults({ eventIds: [eventId], delayBetweenPageRequests: 1000 }),
    `getResults(event=${eventId})`
  );
  if (!results) return;

  // Build a name→id map from teams already in the event
  const eventTeams = await prisma.eventTeam.findMany({
    where: { eventId },
    include: { team: { select: { id: true, name: true } } },
  });
  const nameToId = new Map<string, number>(
    eventTeams.map((et) => [et.team.name.toLowerCase(), et.team.id])
  );

  for (const match of results) {
    const t1Name = match.team1.name.toLowerCase();
    const t2Name = match.team2.name.toLowerCase();

    let team1Id = nameToId.get(t1Name);
    let team2Id = nameToId.get(t2Name);

    // Fallback: upsert by name with a synthetic negative ID if not in event
    if (!team1Id) {
      const t = await prisma.team.findFirst({ where: { name: { equals: match.team1.name } } });
      if (t) team1Id = t.id;
    }
    if (!team2Id) {
      const t = await prisma.team.findFirst({ where: { name: { equals: match.team2.name } } });
      if (t) team2Id = t.id;
    }

    if (!team1Id || !team2Id) continue;

    const score1 = match.result.team1;
    const score2 = match.result.team2;
    const winnerId = score1 > score2 ? team1Id : team2Id;

    const existing = await prisma.match.findUnique({ where: { hltvId: match.id } });
    if (existing) continue;

    await prisma.match.create({
      data: {
        hltvId: match.id,
        eventId,
        team1Id,
        team2Id,
        winnerId,
        score1,
        score2,
        format: match.format ?? null,
        date: match.date ? new Date(match.date) : null,
      },
    });
  }
}

// ─── Full & Incremental sync ──────────────────────────────────────────────────

export async function runFullSync() {
  const log = await prisma.syncLog.create({ data: { type: "full", status: "running" } });

  try {
    console.log("[Scraper] Starting FULL sync...");

    await fetchHistoricalRankings();
    await fetchCurrentRankings();

    const currentYear = new Date().getFullYear();
    let totalQualified = 0;

    for (let year = START_YEAR; year <= currentYear; year++) {
      const count = await fetchPastEvents(`${year}-01-01`, `${year}-12-31`);
      totalQualified += count;
      console.log(`[Scraper] Year ${year}: ${count} qualified events`);
    }

    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        itemsSynced: totalQualified,
        message: `Full sync complete: ${totalQualified} qualified events`,
      },
    });

    return { success: true, totalQualified };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.syncLog.update({
      where: { id: log.id },
      data: { status: "error", finishedAt: new Date(), message },
    });
    throw err;
  }
}

export async function runIncrementalSync() {
  const log = await prisma.syncLog.create({ data: { type: "incremental", status: "running" } });

  try {
    await fetchCurrentRankings();

    const now = new Date();
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const start = threeMonthsAgo.toISOString().slice(0, 10);
    const end = now.toISOString().slice(0, 10);

    const count = await fetchPastEvents(start, end);

    await prisma.syncLog.update({
      where: { id: log.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        itemsSynced: count,
        message: `Incremental sync: ${count} events refreshed`,
      },
    });

    return { success: true, count };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await prisma.syncLog.update({
      where: { id: log.id },
      data: { status: "error", finishedAt: new Date(), message },
    });
    throw err;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}
