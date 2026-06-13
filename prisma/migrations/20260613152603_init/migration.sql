-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "country" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TeamRanking" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamId" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "points" INTEGER,
    "date" DATETIME NOT NULL,
    CONSTRAINT "TeamRanking_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "prizePool" TEXT,
    "location" TEXT,
    "format" TEXT,
    "logoUrl" TEXT,
    "numberOfTop10" INTEGER NOT NULL DEFAULT 0,
    "isQualified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EventTeam" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "seed" INTEGER,
    "placement" INTEGER,
    "isTop10" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "EventTeam_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventStage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "EventStage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Match" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hltvId" INTEGER,
    "eventId" INTEGER NOT NULL,
    "stageId" INTEGER,
    "team1Id" INTEGER NOT NULL,
    "team2Id" INTEGER NOT NULL,
    "winnerId" INTEGER,
    "score1" INTEGER,
    "score2" INTEGER,
    "date" DATETIME,
    "format" TEXT,
    "roundName" TEXT,
    CONSTRAINT "Match_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "EventStage" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Match_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "itemsSynced" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");

-- CreateIndex
CREATE INDEX "TeamRanking_date_idx" ON "TeamRanking"("date");

-- CreateIndex
CREATE INDEX "TeamRanking_rank_idx" ON "TeamRanking"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "TeamRanking_teamId_date_key" ON "TeamRanking"("teamId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "EventTeam_eventId_teamId_key" ON "EventTeam"("eventId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Match_hltvId_key" ON "Match"("hltvId");

-- CreateIndex
CREATE INDEX "Match_eventId_idx" ON "Match"("eventId");
