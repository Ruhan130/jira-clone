import { z } from "zod";
import { TaskType } from "./types";

export const createTaskSchenma = z.object({
    name: z.string().trim().min(1, "Required"),
    status: z.nativeEnum(TaskType, { required_error: "Requried" }),
    workspaceId: z.string().trim().min(1, "Required"),
    projectId: z.string().trim().min(1, "Required"),
    dueDate: z.coerce.date(),
    assigneeId: z.string().trim().min(1, "Required"),
    description: z.string().optional()
})