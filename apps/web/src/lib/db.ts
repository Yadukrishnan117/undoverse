import { PrismaClient } from "@undoverse/db";

/**
 * Prisma client singleton — lazily constructed and build-safe.
 *
 * Next.js hot-reloads modules in dev, which would otherwise spin up a new
 * PrismaClient (and a new connection pool) on every change until Neon starts
 * rejecting connections. We stash one instance on `globalThis` to survive HMR.
 *
 * The client is created lazily (on first property access) and wrapped in a
 * Proxy. This matters at build time: `next build` pre-renders pages that read
 * the database, but a deploy may not have a reachable DB (placeholder
 * DATABASE_URL) or a freshly-initialised engine. By constructing on demand and
 * letting every model call surface as a normal rejected promise, the seed
 * fallbacks in `lib/projects.ts` can catch it — instead of an unhandled throw
 * at module-eval time that would fail the whole build.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

// A Proxy so that simply importing `db` never constructs a client (and never
// throws). Construction is deferred to the first real model access.
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as PrismaClient;
