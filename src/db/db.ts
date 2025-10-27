/**
 * Prisma Client Database Utility
 *
 * This module provides a singleton instance of the Prisma Client to ensure
 * only one database connection is established throughout the application lifecycle.
 *
 * Usage:
 * import { prisma } from './utils/db.js'
 *
 * const users = await prisma.user.findMany()
 */

import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting database connections during hot reloads in development.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Gracefully disconnect from database on shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}

// Handle shutdown signals
process.on("beforeExit", async () => {
  await disconnectDatabase();
});
