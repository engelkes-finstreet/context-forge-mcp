/**
 * Tools implementation for the Model Context Protocol (MCP) server.
 *
 * This file defines the tools that can be called by the AI model through the MCP protocol.
 * Each tool has a schema that defines its parameters and a handler function that implements its logic.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerTaskTools } from "./utils/task-tools.js";

// Create a wrapper for the McpServer to add logging
class LoggingMcpServer extends McpServer {
  registerTool(
    name: string,
    config: any,
    handler: (...args: any[]) => any,
  ): any {
    // Wrap the handler to add logging
    const wrappedHandler = async (...args: any[]) => {
      console.log(`Tool ${name} was called`);
      return handler(...args);
    };

    // Call the parent's registerTool with the wrapped handler
    return super.registerTool(name, config, wrappedHandler);
  }
}

// Factory function to create a new server instance
export function createServer() {
  console.log("Creating server instance");

  const server = new LoggingMcpServer({
    name: "Context Forge MCP Server",
    version: "1.0.0",
  });

  // Register all tools
  registerTaskTools(server);

  return server;
}

// Create a single server instance for STDIO mode
export const server = createServer();
