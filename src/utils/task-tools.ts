import { ToolRegistration } from "./tool-types.js";
import { z } from "zod";
import {
  getNextTaskByProjectId,
  getOpenTasksByProjectId,
  getNextSubtaskByTaskId,
  getSubtaskById,
  updateSubtaskContent,
  updateSubtaskStatus,
  updateTaskContext,
  updateTaskStatus,
} from "../db/tasks.js";
import { Status } from "@prisma/client";

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
      const tasks = await getOpenTasksByProjectId(projectId);
      return {
        content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }],
        mimeType: "application/json",
      };
    },
  );

  server.registerTool(
    "get_next_task_by_project_id",
    {
      title: "Get Next Task by Project ID",
      description: "Get the next task by project id",
      inputSchema: {
        projectId: z
          .string()
          .describe("The ID of the project to get the next task for"),
      },
    },
    async ({ projectId }) => {
      const nextTask = await getNextTaskByProjectId(projectId);
      return {
        content: [{ type: "text", text: JSON.stringify(nextTask, null, 2) }],
        mimeType: "application/json",
      };
    },
  );

  server.registerTool(
    "get_next_subtask_by_task_id",
    {
      title: "Get Next Subtask by Task ID",
      description:
        "Get the next open subtask with the smallest order ID for a given task",
      inputSchema: {
        taskId: z
          .string()
          .describe("The ID of the task to get the next subtask for"),
      },
    },
    async ({ taskId }) => {
      const nextSubtask = await getNextSubtaskByTaskId(taskId);
      return {
        content: [{ type: "text", text: JSON.stringify(nextSubtask, null, 2) }],
        mimeType: "application/json",
      };
    },
  );

  server.registerTool(
    "get_subtask_by_id",
    {
      title: "Get Subtask by ID",
      description:
        "Get a subtask with its metadata, content, and parent task information",
      inputSchema: {
        subtaskId: z.string().describe("The ID of the subtask to retrieve"),
      },
    },
    async ({ subtaskId }) => {
      const subtask = await getSubtaskById(subtaskId);
      return {
        content: [{ type: "text", text: JSON.stringify(subtask, null, 2) }],
        mimeType: "application/json",
      };
    },
  );

  server.registerTool(
    "update_subtask_content",
    {
      title: "Update Subtask Content",
      description:
        "Just pass the new content to the tool and it will be appended to the existing content. DO NOT send the existing content in the request again.",
      inputSchema: {
        subtaskId: z.string().describe("The ID of the subtask to update"),
        content: z.string().describe("The new content for the subtask"),
      },
    },
    async ({ subtaskId, content }) => {
      const updatedSubtask = await updateSubtaskContent(subtaskId, content);
      return {
        content: [
          { type: "text", text: JSON.stringify(updatedSubtask, null, 2) },
        ],
        mimeType: "application/json",
      };
    },
  );

  server.registerTool(
    "update_subtask_status",
    {
      title: "Update Subtask Status",
      description:
        "Update the status of a subtask (OPEN, IN_PROGRESS, or DONE)",
      inputSchema: {
        subtaskId: z.string().describe("The ID of the subtask to update"),
        status: z
          .enum(["OPEN", "IN_PROGRESS", "DONE"])
          .describe("The new status for the subtask"),
      },
    },
    async ({ subtaskId, status }) => {
      const updatedSubtask = await updateSubtaskStatus(
        subtaskId,
        status as Status,
      );
      return {
        content: [
          { type: "text", text: JSON.stringify(updatedSubtask, null, 2) },
        ],
        mimeType: "application/json",
      };
    },
  );

  server.registerTool(
    "update_task_context",
    {
      title: "Update Task Context",
      description:
        "Just pass the new context to the tool and it will be appended to the existing sharedContext. DO NOT send the existing context in the request again.",
      inputSchema: {
        taskId: z.string().describe("The ID of the task to update"),
        context: z.string().describe("The new context for the task"),
      },
    },
    async ({ taskId, context }) => {
      const updatedTask = await updateTaskContext(taskId, context);
      return {
        content: [
          { type: "text", text: JSON.stringify(updatedTask, null, 2) },
        ],
        mimeType: "application/json",
      };
    },
  );

  server.registerTool(
    "update_task_status",
    {
      title: "Update Task Status",
      description: "Update the status of a task (OPEN, IN_PROGRESS, or DONE)",
      inputSchema: {
        taskId: z.string().describe("The ID of the task to update"),
        status: z
          .enum(["OPEN", "IN_PROGRESS", "DONE"])
          .describe("The new status for the task"),
      },
    },
    async ({ taskId, status }) => {
      const updatedTask = await updateTaskStatus(taskId, status as Status);
      return {
        content: [
          { type: "text", text: JSON.stringify(updatedTask, null, 2) },
        ],
        mimeType: "application/json",
      };
    },
  );
};
