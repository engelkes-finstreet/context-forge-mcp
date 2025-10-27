/**
 * STDIO server implementation for the Model Context Protocol (MCP) server.
 *
 * This file creates a server that communicates via standard input/output streams.
 */

import { server } from "./tools.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Create the stdio transport
const transport = new StdioServerTransport();

// Connect the transport to the server
server.connect(transport).catch((error) => {
  console.error("Failed to connect transport:", error);
  process.exit(1);
});