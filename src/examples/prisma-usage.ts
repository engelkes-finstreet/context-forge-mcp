/**
 * Prisma Usage Examples for MCP Server
 *
 * This file demonstrates how to use Prisma ORM within the MCP server context.
 * It includes examples for CRUD operations, queries, relations, and transactions.
 *
 * To run this example:
 * 1. Make sure you've run: npx prisma migrate dev --name init
 * 2. Build the project: npm run build
 * 3. Run: node build/examples/prisma-usage.js
 */

import { prisma, disconnectDatabase } from '../utils/db.js';

/**
 * Example 1: Creating records
 * Demonstrates how to insert data into the database
 */
async function createComponentQuery(componentName: string, sessionId?: string): Promise<void> {
  console.log('\n=== Creating Component Query ===');

  const query = await prisma.componentQuery.create({
    data: {
      componentName,
      sessionId,
      successful: true,
    },
  });

  console.log('Created query:', query);
}

/**
 * Example 2: Reading records with filtering
 * Shows various query patterns
 */
async function findComponentQueries(): Promise<void> {
  console.log('\n=== Finding Component Queries ===');

  // Find all queries
  const allQueries = await prisma.componentQuery.findMany({
    take: 5, // Limit to 5 results
    orderBy: {
      timestamp: 'desc',
    },
  });
  console.log('Recent queries:', allQueries.length);

  // Find queries for a specific component
  const buttonQueries = await prisma.componentQuery.findMany({
    where: {
      componentName: 'Button',
    },
  });
  console.log('Button queries:', buttonQueries.length);

  // Count successful queries
  const successCount = await prisma.componentQuery.count({
    where: {
      successful: true,
    },
  });
  console.log('Successful queries:', successCount);
}

/**
 * Example 3: Updating records
 * Shows how to modify existing data
 */
async function updateComponentQuery(id: string): Promise<void> {
  console.log('\n=== Updating Component Query ===');

  const updated = await prisma.componentQuery.update({
    where: { id },
    data: {
      successful: false,
      errorMessage: 'Component not found',
    },
  });

  console.log('Updated query:', updated);
}

/**
 * Example 4: Upserting records
 * Create if doesn't exist, update if exists
 */
async function upsertComponentCache(componentName: string, content: string): Promise<void> {
  console.log('\n=== Upserting Component Cache ===');

  const cache = await prisma.componentCache.upsert({
    where: {
      componentName,
    },
    update: {
      content,
      lastFetched: new Date(),
    },
    create: {
      componentName,
      content,
    },
  });

  console.log('Upserted cache:', cache.componentName);
}

/**
 * Example 5: Deleting records
 * Shows deletion operations
 */
async function deleteOldQueries(daysOld: number = 30): Promise<void> {
  console.log('\n=== Deleting Old Queries ===');

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await prisma.componentQuery.deleteMany({
    where: {
      timestamp: {
        lt: cutoffDate,
      },
    },
  });

  console.log(`Deleted ${result.count} old queries`);
}

/**
 * Example 6: Using transactions
 * Ensure multiple operations succeed or fail together
 */
async function createSessionWithQueries(userId: string): Promise<void> {
  console.log('\n=== Creating Session with Queries (Transaction) ===');

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create session
      const session = await tx.session.create({
        data: {
          userId,
          active: true,
        },
      });

      // Create multiple queries in this session
      await tx.componentQuery.createMany({
        data: [
          { componentName: 'Button', sessionId: session.id, successful: true },
          { componentName: 'Input', sessionId: session.id, successful: true },
          { componentName: 'Modal', sessionId: session.id, successful: true },
        ],
      });

      return session;
    });

    console.log('Transaction successful, created session:', result.id);
  } catch (error) {
    console.error('Transaction failed:', error);
  }
}

/**
 * Example 7: Aggregation queries
 * Get statistics and aggregated data
 */
async function getQueryStatistics(): Promise<void> {
  console.log('\n=== Query Statistics ===');

  // Group by component name and count
  const stats = await prisma.componentQuery.groupBy({
    by: ['componentName'],
    _count: {
      componentName: true,
    },
    _sum: {
      successful: true,
    },
    orderBy: {
      _count: {
        componentName: 'desc',
      },
    },
  });

  console.log('Component query statistics:');
  stats.forEach((stat) => {
    console.log(`  ${stat.componentName}: ${stat._count.componentName} queries`);
  });
}

/**
 * Example 8: Raw SQL queries
 * For complex queries not easily expressed with Prisma
 */
async function executeRawQuery(): Promise<void> {
  console.log('\n=== Raw SQL Query ===');

  const result = await prisma.$queryRaw`
    SELECT componentName, COUNT(*) as count
    FROM ComponentQuery
    WHERE successful = 1
    GROUP BY componentName
    LIMIT 5
  `;

  console.log('Raw query result:', result);
}

/**
 * Example 9: Date range queries
 * Filter by date ranges
 */
async function getQueriesInDateRange(startDate: Date, endDate: Date): Promise<void> {
  console.log('\n=== Queries in Date Range ===');

  const queries = await prisma.componentQuery.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  console.log(`Found ${queries.length} queries in date range`);
}

/**
 * Example 10: Session management
 * Practical example for the MCP server
 */
async function manageSession(sessionId: string): Promise<void> {
  console.log('\n=== Session Management ===');

  // Create or get active session
  let session = await prisma.session.findFirst({
    where: {
      id: sessionId,
      active: true,
    },
  });

  if (!session) {
    session = await prisma.session.create({
      data: {
        id: sessionId,
        active: true,
      },
    });
    console.log('Created new session:', session.id);
  } else {
    console.log('Using existing session:', session.id);
  }

  // Get query count for this session
  const queryCount = await prisma.componentQuery.count({
    where: {
      sessionId: session.id,
    },
  });
  console.log('Queries in this session:', queryCount);

  // End session
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      active: false,
      endTime: new Date(),
    },
  });
  console.log('Session ended');
}

/**
 * Main function to run all examples
 */
async function main(): Promise<void> {
  try {
    console.log('Starting Prisma Usage Examples...\n');

    // Example 1: Create records
    await createComponentQuery('Button', 'session-123');
    await createComponentQuery('Input', 'session-123');
    await createComponentQuery('Modal', 'session-456');

    // Example 2: Read records
    await findComponentQueries();

    // Example 3: Update record
    const firstQuery = await prisma.componentQuery.findFirst();
    if (firstQuery) {
      await updateComponentQuery(firstQuery.id);
    }

    // Example 4: Upsert cache
    await upsertComponentCache('Button', '# Button Component\n\nA reusable button component...');
    await upsertComponentCache('Button', '# Button Component\n\nUpdated documentation...');

    // Example 5: Delete old queries
    // await deleteOldQueries(30); // Commented to preserve example data

    // Example 6: Transactions
    await createSessionWithQueries('user-123');

    // Example 7: Statistics
    await getQueryStatistics();

    // Example 8: Raw queries
    await executeRawQuery();

    // Example 9: Date range
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    await getQueriesInDateRange(oneHourAgo, now);

    // Example 10: Session management
    await manageSession('demo-session-789');

    console.log('\n=== All Examples Completed Successfully ===');
  } catch (error) {
    console.error('Error running examples:', error);
    throw error;
  } finally {
    // Clean up database connection
    await disconnectDatabase();
  }
}

// Run examples if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(() => {
      console.log('\nExamples completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Examples failed:', error);
      process.exit(1);
    });
}

// Export functions for use in other modules
export {
  createComponentQuery,
  findComponentQueries,
  updateComponentQuery,
  upsertComponentCache,
  deleteOldQueries,
  createSessionWithQueries,
  getQueryStatistics,
  executeRawQuery,
  getQueriesInDateRange,
  manageSession,
};
