import { z } from "zod";
import { WorkspaceRange } from "./type";

export const createWorkspaceSchema = z.object({
    name: z.string().trim().min(1, "Workspace name is required")
        .max(100, "Workspace name must be less than 100 characters"),
    workspaceUrl: z.string().trim().min(1, "Workspace URL is required")
        .regex(/^[a-z0-9-]+$/, "URL can only contain lowercase letters, numbers, and hyphens")
        .min(3, "URL must be at least 3 characters")
        .max(50, "URL must be less than 50 characters"),
    range: z.nativeEnum(WorkspaceRange, {
        errorMap: () => ({ message: "Please select a valid team size range" })
    })
});

export const updateWorkSpaceSchema = z.object({
    name: z.string().trim().min(1, "Must have 1 charachter").optional(),
    image: z.union([
        z.instanceof(File),
        z.string().nullable(),

    ])
        .optional(),

});