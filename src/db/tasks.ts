import { prisma } from "./db.js";

export async function getTasksByProjectId(projectId: string) {
  return prisma.task.findMany({
    where: { projectId },
    orderBy: {
      order: "asc",
    },
  });
}
