import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = parseInt(searchParams.get("pageSize") ?? "20");

  const where = search ? { name: { contains: search } } : {};

  const [teams, total] = await Promise.all([
    prisma.team.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        rankings: {
          orderBy: { date: "desc" },
          take: 1,
          select: { rank: true, date: true },
        },
        _count: { select: { eventTeams: true } },
      },
    }),
    prisma.team.count({ where }),
  ]);

  return NextResponse.json({
    data: teams,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}
