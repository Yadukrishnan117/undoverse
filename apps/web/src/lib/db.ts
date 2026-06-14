import { PrismaClient } from "@undoverse/db";

/**
 * Prisma client singleton.
 *
 * Next.js hot-reloads modules in dev, which would otherwise spin up a new
 * PrismaClient (and a new connection pool) on every change until Neon starts
 * rejecting connections. We stash one instance on `globalThis` to survive HMR.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
