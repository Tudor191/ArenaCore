import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");
  const year = searchParams.get("year");
  const search = searchParams.get("search");

  const where = {
    isQualified: true,
    ...(year && {
      startDate: {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`),
      },
    }),
    ...(search && {
      name: { contains: search },
    }),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        slug: true,
        startDate: true,
        endDate: true,
        prizePool: true,
        location: true,
        logoUrl: true,
        numberOfTop10: true,
        isQualified: true,
        _count: { select: { matches: true, teams: true } },
      },
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json({
    data: events,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
