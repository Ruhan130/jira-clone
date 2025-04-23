import { z } from "zod";

// shared schema
export const createProjectSchema = z.object({
    name: z.string().trim().min(1, "Required"),
    image: z.union([
      z.instanceof(File),
      z.string().transform((value) => value === "" ? undefined : value),
    ]).optional(),
    workspaceId: z.string()
  });
  
  // frontend-only schema (omit workspaceId)
  export const createProjectFormSchema = createProjectSchema.omit({ workspaceId: true });
  