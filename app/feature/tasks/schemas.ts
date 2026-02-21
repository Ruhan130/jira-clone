import { z } from "zod";
import { LabelType, PriorityType, TaskType, } from "./types";

export const createTaskSchenma = z.object({
    workspaceId: z.string().trim().min(1, "Required"),
    name: z.string().trim().min(1, "Required"),
    projectId: z.string().trim().min(1, "Required"),
    description: z.string().optional(),
    dueDate: z.coerce.date(),
    assigneeId: z.string().trim().min(1, "Required"),
    status: z.string().trim().min(1, "Required"),
    priority: z.nativeEnum(PriorityType, { required_error: "Requried" })
});

export const createTaskSchemaWithId = createTaskSchenma.omit({ workspaceId: true, description: true });

export const createSubTaskSchema = z.object({
    workspaceId: z.string().trim().min(1, "Required"),
    name: z.string().trim().min(1, "Required"),
    projectId: z.string().trim().min(1, "Required"),
    parentTaskId: z.string().trim().min(1, "Required"),
    description: z.string().optional(),
    dueDate: z.coerce.date().optional(),
    assigneeId: z.string().trim().min(1, "Required"),
    status: z.nativeEnum(TaskType).optional(),
    priority: z.nativeEnum(PriorityType, { required_error: "Required" }),
    label: z.nativeEnum(LabelType).optional(),
    position: z.number().int().min(0).optional()
});


export const updateSubtaskSchema = z.object({
    status: z.nativeEnum(TaskType).optional(),
    priority: z.nativeEnum(PriorityType).optional(),
    name: z.string().optional(),
    dueDate: z.coerce.date().optional(),
    description: z.string().optional(),
    attachments: z.array(z.object({
        id: z.string(),
        name: z.string(),
        url: z.string(),
        type: z.string(),
        size: z.number()
    })).optional(),
});





// ---------------------------- COMMENT SCHEMASS---------------------
export const createCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty"),
    attachments: z.string().optional(),
    parentCommentId: z.string().optional(),
});

export const reactionSchema = z.object({
    emoji: z.string().min(1, "Emoji required"),
    action: z.enum(["add", "remove"])
});