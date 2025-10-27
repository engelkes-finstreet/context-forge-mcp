import { ToolRegistration } from "./tool-types.js";
import { z } from "zod";
import { getTasksByProjectId } from "../db/tasks.js";

export const registerTaskTools: ToolRegistration = (server) => {
  server.registerTool(
    "get_tasks_by_project_id",
    {
      title: "Get Tasks by Project ID",
      description: "Get all tasks by project id",
      inputSchema: {
        projectId: z
          .string()
          .describe("The ID of the project to get tasks for"),
      },
    },
    async ({ projectId }) => {
      const tasks = await getTasksByProjectId(projectId);
      return {
        content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }],
        mimeType: "application/json",
      };
    },
  );
};
