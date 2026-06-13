import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      teams: {
        include: { team: true },
        orderBy: { seed: "asc" },
      },
      stages: {
        orderBy: { order: "asc" },
        include: {
          matches: {
            include: {
              team1: true,
              team2: true,
              winner: true,
            },
            orderBy: { id: "asc" },
          },
        },
      },
      matches: {
        where: { stageId: null },
        include: {
          team1: true,
          team2: true,
          winner: true,
        },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ data: event });
}
