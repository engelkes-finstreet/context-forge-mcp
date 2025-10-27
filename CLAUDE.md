# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript MCP (Model Context Protocol) server that provides tools for AI assistants to interact with finstreet/ui components by fetching component stories from GitHub.

## Common Development Commands

```bash
# Build the TypeScript project
npm run build

# Start the MCP server in STDIO mode with Inspector
npm start

# Start the HTTP/SSE server (builds automatically)
npm run start:http

# Clean build artifacts
npm run clean

# Run with Docker (HTTP mode)
docker compose up

# Database commands (Prisma)
npm run db:generate     # Generate Prisma Client
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio (database GUI)
npm run prisma:example  # Run Prisma usage examples
```

## Architecture

### MCP Server Structure

- **STDIO Mode**: Direct tool invocation via MCP Inspector
- **HTTP/SSE Mode**: Server-Sent Events transport on port 3000 (configurable)
- **Tools**: Located in `src/tools.ts`, currently implements `get_component` tool
- **GitHub API Integration**: `src/utils/api.ts` fetches .llm.md stories from finstreet/ui repository

### Key Implementation Details

1. **Caching**: In-memory cache with TTL (5 minutes default) in `src/utils/cache.ts`
2. **Session Management**: HTTP server tracks multiple connections via session IDs
3. **Schema Validation**: All tool inputs validated with Zod schemas
4. **Error Handling**: Uses MCP-specific error types (McpError)
5. **Database**: Prisma ORM with PostgreSQL (see `PRISMA_SETUP.md` for complete guide)
   - Database utility: `src/utils/db.ts`
   - Schema: `prisma/schema.prisma`
   - Usage examples: `src/examples/prisma-usage.ts`

### Adding New Tools

1. Define tool schema in `src/tools.ts`
2. Implement handler function that returns structured data
3. Register tool with the MCP server in the tools array

### Environment Configuration

- `PORT`: HTTP server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection URL (default: `postgresql://postgres:postgres@localhost:5432/mcp_dev?schema=public`)
- `GITHUB_TOKEN`: GitHub API token (optional, for higher rate limits)
- See `.env.example` for all available environment variables

## Important Notes

- The GitHub token is currently hardcoded in `src/utils/api.ts` - should be moved to environment variable
- Component stories are fetched from the `mcp-server` branch of finstreet/ui repository
- Only `.stories.tsx` files are currently supported
