import { z } from "zod";
import { TaskType } from "./types";

export const createTaskSchenma = z.object({
    workspaceId: z.string().trim().min(1, "Required"),
    name: z.string().trim().min(1, "Required"),
    projectId: z.string().trim().min(1, "Required"),
    description: z.string().optional(),
    dueDate: z.coerce.date(),
    assigneeId: z.string().trim().min(1, "Required"),
    status: z.nativeEnum(TaskType, { required_error: "Requried" }),
});

export const createTaskSchemaWithId = createTaskSchenma.omit({ workspaceId: true });