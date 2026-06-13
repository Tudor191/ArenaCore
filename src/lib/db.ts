import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createPrisma() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const url = dbUrl.startsWith("file:") ? `file:${dbUrl.slice(5)}` : dbUrl;
  const adapter = new PrismaLibSql({ url });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
