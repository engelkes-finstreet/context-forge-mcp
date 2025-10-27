# Finstreet UI MCP Server

A TypeScript implementation of a Model Context Protocol (MCP) server designed to help AI assistants interact with finstreet/ui components. It allows AI models to fetch component stories.

## Running with Docker

### Prerequisites

- Docker: [Install Docker](https://docs.docker.com/get-docker/)

### Setup

1. **Create environment file:**

```bash
cp .env.example .env
```

2. **Edit `.env` file and add your GitHub token:**

```bash
# Edit the .env file and replace 'your_github_token_here' with your actual GitHub token
# The file should contain:
# GITHUB_TOKEN=your_actual_github_token
```

### Running the Server

The `compose.yaml` uses the `.env` file for all environment variables.

**1. Build the Docker image:**

```bash
docker compose build
```

**2. Start the HTTP/SSE server:**

```bash
docker compose up -d mcp-server-http
```

- Access: `http://localhost:4444` (SSE: `/sse`, Messages: `/messages`)
- The server runs on port 3000 inside the container, mapped to port 4444 on your host

**3. View logs:**

```bash
docker compose logs -f mcp-server-http
```

**4. Stop the server:**

```bash
docker compose down
```

## Features

This MCP server provides the following capabilities:

### Tools

1.  **`get_component`**:

    - Retrieves the source code of a specified shadcn/ui component.
    - Parameter: `componentName` (string) - e.g., "button".
    - Returns: Component source code.

2.  **`get_component_demo`**:
    - Fetches demo code for a shadcn/ui component.
    - Parameter: `componentName` (string).
    - Returns: Demo code.

### Resources

1.  **`resource:get_components`**:
    - Lists all available shadcn/ui components.

### Resource Templates

1.  **`resource-template:get_install_script_for_component`**:

    - Generates installation script for a component.
    - Parameters: `packageManager` (string - npm, pnpm, yarn, bun), `component` (string).

2.  **`resource-template:get_installation_guide`**:
    - Provides framework-specific installation guides for shadcn/ui.
    - Parameters: `framework` (string - next, vite, etc.), `packageManager` (string).

## Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/introduction)
- [MCP Typescript SDK](https://github.com/modelcontextprotocol/typescript-sdk?tab=readme-ov-file)
- [Shadcn UI Documentation](https://ui.shadcn.com/)
