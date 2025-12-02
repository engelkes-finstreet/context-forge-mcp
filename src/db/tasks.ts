import { prisma } from "./db.js";
import { Status } from "@prisma/client";

export async function getOpenTasksByProjectId(projectId: string) {
  return prisma.task.findMany({
    where: { projectId, status: Status.OPEN },
    orderBy: {
      order: "asc",
    },
    include: {
      subtasks: {
        where: { status: Status.OPEN },
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
        },
      },
    },
  });
}

export async function getNextTaskByProjectId(projectId: string) {
  const task = await prisma.task.findFirst({
    where: { projectId, status: Status.OPEN },
    orderBy: {
      order: "asc",
    },
    include: {
      subtasks: {
        where: { status: Status.OPEN },
        orderBy: {
          order: "asc",
        },
        take: 1, // Get only the first (smallest order) open subtask
        select: {
          id: true,
        },
      },
    },
  });

  return task?.subtasks[0];
}

export async function getNextSubtaskByTaskId(taskId: string) {
  const subtask = await prisma.subtask.findFirst({
    where: { taskId, status: Status.OPEN },
    orderBy: {
      order: "asc",
    },
  });

  return subtask;
}

export async function getSubtaskById(subtaskId: string) {
  return prisma.subtask.findUnique({
    where: { id: subtaskId },
    include: {
      task: {
        select: {
          name: true,
          sharedContext: true,
        },
      },
    },
  });
}

export async function updateSubtaskContent(
  subtaskId: string,
  content: string,
) {
  const subtask = await prisma.subtask.findUnique({
    where: { id: subtaskId },
    select: { content: true },
  });

  const updatedContent = subtask?.content
    ? `${subtask.content}\n${content}`
    : content;

  return prisma.subtask.update({
    where: { id: subtaskId },
    data: { content: updatedContent },
  });
}

export async function updateSubtaskStatus(
  subtaskId: string,
  status: Status,
) {
  return prisma.subtask.update({
    where: { id: subtaskId },
    data: { status },
  });
}

export async function updateTaskContext(taskId: string, context: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { sharedContext: true },
  });

  const updatedContext = task?.sharedContext
    ? `${task.sharedContext}\n${context}`
    : context;

  return prisma.task.update({
    where: { id: taskId },
    data: { sharedContext: updatedContext },
  });
}

export async function updateTaskStatus(taskId: string, status: Status) {
  return prisma.task.update({
    where: { id: taskId },
    data: { status },
  });
}
