/**
 * HTTP server implementation for the Model Context Protocol (MCP) server.
 *
 * This file creates an Express server that exposes the MCP server using
 * Server-Sent Events (SSE) for real-time communication.
 */
import express, { Request, Response } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import cors from "cors";
import { createServer } from "./tools.js";

// Create Express application
const app = express();

// Enable CORS for all routes
app.use(cors());

// IMPORTANT: Do NOT use express.json() middleware globally
// as it will consume the request stream and make it unreadable for the SSE transport
// Remove this line: app.use(express.json());

// Store transports and server instances for multiple simultaneous connections
const connections: { 
  [sessionId: string]: {
    transport: SSEServerTransport;
    server: McpServer;
  }
} = {};

// SSE endpoint
app.get("/sse", async (_: Request, res: Response) => {
  // Create a new SSE transport for this connection
  const transport = new SSEServerTransport("/messages", res);

  // Create a new MCP server instance for this connection
  const serverInstance = createServer();

  // Store both the transport and server instance
  connections[transport.sessionId] = {
    transport,
    server: serverInstance
  };

  // Clean up when the connection is closed
  res.on("close", () => {
    // Close the server instance
    connections[transport.sessionId]?.server.close();
    delete connections[transport.sessionId];
    console.log(`Client disconnected: ${transport.sessionId}`);
  });

  console.log(`Client connected: ${transport.sessionId}`);

  // Connect the transport to this connection's dedicated server instance
  await serverInstance.connect(transport);
});

// Message handling endpoint
// Do NOT use express.json() middleware for this route
app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;

  if (!sessionId) {
    res.status(400).send("Missing sessionId parameter");
    return;
  }

  const connection = connections[sessionId];

  if (connection) {
    await connection.transport.handlePostMessage(req, res);
  } else {
    res.status(404).send("No active connection found for this sessionId");
  }
});

const PORT = process.env.PORT || 3000;

// Start the server
const httpServer = app.listen(PORT, () => {
  console.log(`MCP server listening on port ${PORT}`);
  console.log(`SSE endpoint available at http://localhost:${PORT}/sse`);
  console.log(
    `Message endpoint available at http://localhost:${PORT}/messages`,
  );
});

// Export for testing or further configuration
export { app, httpServer };
