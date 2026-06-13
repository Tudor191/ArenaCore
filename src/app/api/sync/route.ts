import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const lastLog = await prisma.syncLog.findFirst({
    orderBy: { startedAt: "desc" },
  });

  return NextResponse.json({
    data: {
      lastSync: lastLog?.finishedAt ?? null,
      status: lastLog?.status ?? "never",
      message: lastLog?.message ?? null,
      itemsSynced: lastLog?.itemsSynced ?? 0,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const type = body.type ?? "incremental";

  const running = await prisma.syncLog.findFirst({
    where: { status: "running" },
  });

  if (running) {
    return NextResponse.json(
      { error: "A sync is already running" },
      { status: 409 }
    );
  }

  // Fire and forget — the actual sync runs in background
  // In production you'd use a proper job queue (BullMQ, etc.)
  void (async () => {
    const { runFullSync, runIncrementalSync } = await import("@/lib/hltv-scraper");
    try {
      if (type === "full") {
        await runFullSync();
      } else {
        await runIncrementalSync();
      }
    } catch (err) {
      console.error("[Sync API] Error:", err);
    }
  })();

  return NextResponse.json({
    data: { message: `${type} sync started`, type },
  });
}
