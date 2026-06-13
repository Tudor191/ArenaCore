import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");

  if (dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - 7);

    const rankings = await prisma.teamRanking.findMany({
      where: {
        date: { gte: weekStart, lte: date },
        rank: { lte: 10 },
      },
      orderBy: [{ date: "desc" }, { rank: "asc" }],
      include: { team: true },
    });

    const seen = new Set<number>();
    const top10 = rankings.filter((r) => {
      if (seen.has(r.teamId)) return false;
      seen.add(r.teamId);
      return true;
    });

    return NextResponse.json({ data: top10, date: dateStr });
  }

  const latest = await prisma.teamRanking.findFirst({
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (!latest) {
    return NextResponse.json({ data: [], message: "No rankings synced yet" });
  }

  const rankings = await prisma.teamRanking.findMany({
    where: { date: latest.date, rank: { lte: 10 } },
    orderBy: { rank: "asc" },
    include: { team: true },
  });

  return NextResponse.json({ data: rankings, date: latest.date });
}
