# Prisma Setup Guide

This document provides a complete guide for using Prisma ORM in this MCP server project.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Schema Overview](#schema-overview)
- [Usage Examples](#usage-examples)
- [Available Scripts](#available-scripts)
- [Migrations](#migrations)
- [Best Practices](#best-practices)

## Overview

This project uses **Prisma** as its ORM (Object-Relational Mapping) tool to interact with a **PostgreSQL** database. Prisma provides:

- Type-safe database queries
- Auto-generated TypeScript types
- Database migrations
- Intuitive query API
- Database introspection

### Prerequisites

- **PostgreSQL** 12 or higher installed and running
- A PostgreSQL database created (default: `mcp_dev`)
- PostgreSQL user with database access (default: `postgres/postgres`)

## Installation

Prisma and its dependencies are already included in `package.json`:

```bash
npm install
```

This will install:
- `prisma` - Prisma CLI for migrations and schema management
- `@prisma/client` - Prisma Client for querying the database
- `dotenv` - For loading environment variables

## Database Setup

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and update the `DATABASE_URL`:

```bash
cp .env.example .env
```

The default configuration uses **PostgreSQL**:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mcp_dev?schema=public"
```

**Important**: Make sure you have PostgreSQL installed and running locally, or update the connection string to point to your PostgreSQL server.

For other databases:

**SQLite** (for local development):
```env
DATABASE_URL="file:./dev.db"
```

**MySQL:**
```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
```

Note: If you switch database providers, you'll need to update the `provider` field in `prisma/schema.prisma` and regenerate migrations.

### 2. Generate Prisma Client

Generate the Prisma Client to create type-safe database queries:

```bash
npm run db:generate
```

### 3. Run Database Migrations

Create the database and tables:

```bash
npm run db:migrate
```

This will:
- Create the database (for PostgreSQL, make sure the server is running)
- Run all migrations in `prisma/migrations/`
- Generate the Prisma Client

**Note**: For PostgreSQL, you need to create the database first:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE mcp_dev;

# Exit
\q
```

Alternatively, Prisma will attempt to create the database for you if your user has sufficient permissions.

## Schema Overview

The Prisma schema is located at `prisma/schema.prisma`. It currently includes three models:

### ComponentQuery

Tracks component queries made by AI assistants:

```prisma
model ComponentQuery {
  id            String   @id @default(uuid())
  componentName String
  sessionId     String?
  timestamp     DateTime @default(now())
  successful    Boolean  @default(true)
  errorMessage  String?
}
```

### ComponentCache

Stores cached component data:

```prisma
model ComponentCache {
  id           String   @id @default(uuid())
  componentName String  @unique
  content      String
  lastFetched  DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Session

Tracks user sessions:

```prisma
model Session {
  id        String   @id @default(uuid())
  userId    String?
  startTime DateTime @default(now())
  endTime   DateTime?
  active    Boolean  @default(true)
}
```

## Usage Examples

### Basic Usage

Import the Prisma client from the utility file:

```typescript
import { prisma } from './utils/db.js';

// Create a new record
const query = await prisma.componentQuery.create({
  data: {
    componentName: 'Button',
    sessionId: 'session-123',
    successful: true,
  },
});

// Find records
const queries = await prisma.componentQuery.findMany({
  where: {
    componentName: 'Button',
  },
  orderBy: {
    timestamp: 'desc',
  },
  take: 10,
});

// Update a record
const updated = await prisma.componentQuery.update({
  where: { id: query.id },
  data: { successful: false },
});

// Delete records
await prisma.componentQuery.deleteMany({
  where: {
    timestamp: {
      lt: new Date('2025-01-01'),
    },
  },
});
```

### Running the Complete Example

A comprehensive example file is provided at `src/examples/prisma-usage.ts` with 10+ usage patterns:

```bash
npm run prisma:example
```

This demonstrates:
1. Creating records
2. Reading with filters
3. Updating records
4. Upserting (create or update)
5. Deleting records
6. Transactions
7. Aggregations
8. Raw SQL queries
9. Date range queries
10. Session management

## Available Scripts

### Database Commands

```bash
# Generate Prisma Client (run after schema changes)
npm run db:generate

# Create and apply migrations in development
npm run db:migrate

# Apply migrations in production
npm run db:migrate:prod

# Push schema changes without migrations (for prototyping)
npm run db:push

# Open Prisma Studio (visual database browser)
npm run db:studio

# Run Prisma usage examples
npm run prisma:example
```

## Migrations

### Creating a New Migration

After modifying `prisma/schema.prisma`, create a migration:

```bash
npm run db:migrate
```

You'll be prompted to name the migration. Use descriptive names like:
- `add_user_table`
- `add_email_to_user`
- `create_index_on_timestamp`

### Migration Files

Migrations are stored in `prisma/migrations/`. Each migration folder contains:
- `migration.sql` - The SQL commands to execute

### Applying Migrations in Production

```bash
npm run db:migrate:prod
```

This applies pending migrations without prompting.

## Best Practices

### 1. Use the Singleton Pattern

Always import the Prisma client from `src/utils/db.ts`:

```typescript
import { prisma } from './utils/db.js';
```

This ensures only one database connection is maintained.

### 2. Handle Disconnection

The `db.ts` utility automatically disconnects on process exit. For manual cleanup:

```typescript
import { disconnectDatabase } from './utils/db.js';

await disconnectDatabase();
```

### 3. Type Safety

Prisma generates TypeScript types automatically. Use them:

```typescript
import { ComponentQuery } from '@prisma/client';

function processQuery(query: ComponentQuery) {
  // TypeScript knows all fields on ComponentQuery
  console.log(query.componentName);
}
```

### 4. Error Handling

Always wrap database operations in try-catch:

```typescript
try {
  const query = await prisma.componentQuery.create({
    data: { componentName: 'Button' },
  });
} catch (error) {
  console.error('Database error:', error);
  throw new McpError(ErrorCode.InternalError, 'Failed to create query');
}
```

### 5. Transactions for Multiple Operations

Use transactions when multiple operations must succeed together:

```typescript
await prisma.$transaction(async (tx) => {
  await tx.session.create({ data: { userId: 'user-1' } });
  await tx.componentQuery.create({ data: { componentName: 'Button' } });
});
```

### 6. Indexing for Performance

The schema includes indexes on frequently queried fields:

```prisma
@@index([componentName])
@@index([timestamp])
```

Add more indexes as needed for your queries.

### 7. Caching Strategy

Consider using the `ComponentCache` model to reduce external API calls:

```typescript
// Check cache first
let cached = await prisma.componentCache.findUnique({
  where: { componentName: 'Button' },
});

// Fetch if not cached or expired
if (!cached || isCacheExpired(cached.lastFetched)) {
  const content = await fetchFromGitHub('Button');

  cached = await prisma.componentCache.upsert({
    where: { componentName: 'Button' },
    update: { content, lastFetched: new Date() },
    create: { componentName: 'Button', content },
  });
}
```

## Integrating with MCP Tools

### Example: Logging Component Queries

Update your MCP tools to log queries:

```typescript
import { prisma } from './utils/db.js';

async function getComponentTool(componentName: string, sessionId?: string) {
  try {
    // Fetch component
    const content = await fetchComponentStory(componentName);

    // Log successful query
    await prisma.componentQuery.create({
      data: {
        componentName,
        sessionId,
        successful: true,
      },
    });

    return content;
  } catch (error) {
    // Log failed query
    await prisma.componentQuery.create({
      data: {
        componentName,
        sessionId,
        successful: false,
        errorMessage: error.message,
      },
    });

    throw error;
  }
}
```

## Troubleshooting

### Prisma Client Not Found

If you get "Cannot find module '@prisma/client'":

```bash
npm run db:generate
```

### Migration Errors

Reset the database (WARNING: deletes all data):

```bash
npx prisma migrate reset
```

### Schema Changes Not Applied

After modifying `schema.prisma`, always run:

```bash
npm run db:generate
npm run db:migrate
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Example File](./src/examples/prisma-usage.ts) - Complete usage examples
