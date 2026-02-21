import { z } from "zod";



// =============================================
// FINAL BACKEND SCHEMA - Exact Database Match
// =============================================
export const createProjectSchema = z.object({
  name: z.string().min(1),
  identifier: z.string().min(1),
  owners: z.string().min(1),
  imageUrl: z.any().optional().nullable(),
  description: z.string().default(""),
  default_assignee: z.string().default(""),
  icon: z.string().default("folder"),
  default_issue_status: z.string().default("Backlog"),
  members: z.array(z.string()).default([]),
  is_private: z.boolean().default(false),
  auto_join: z.boolean().default(false),
  teamId: z.string().optional().nullable(),
});

// =============================================
// FRONTEND SCHEMA - UI Form Only
// =============================================
export const createProjectFormSchemaWithCheck = (existingNames: string[]) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, "Project name is required")
      .refine(
        (val) => !existingNames.includes(val.toLowerCase()),
        { message: "Project name already exists" }
      ),
    identifier: z.string().min(1, "Identifier is required"),
    description: z.string(),
    default_assignee: z.string(),
    owners: z.string().min(1, "Project owner is required"),
    icon: z.string(),
    default_issue_status: z.enum(["Backlog", "To Do", "In Progress"]),
    members: z.array(z.string()),
    is_private: z.boolean(),
    auto_join: z.boolean(),
    imageUrl: z.any().optional().nullable(),
    teamId: z.string().optional().nullable()
  });



export const updateProjectFormSchema = (existingNames: string[], currentName: string) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, "Project name is required")
      .refine(
        (val) =>
          val.toLowerCase() === currentName.toLowerCase() ||
          !existingNames.includes(val.toLowerCase()),
        { message: "Project name already exists" }
      ),
    identifier: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    default_assignee: z.string().optional(),
    default_issue_status: z.enum(["Backlog", "To Do", "In Progress"]).optional(),
    owners: z.string().optional(),
    members: z.array(z.string()).optional(),
    imageUrl: z.any().optional(),
    teamId: z.string().optional(),
  });


  // BACKEND SCHEMA  
  export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  imageUrl: z.any().optional(),
  identifier: z.string().min(1).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  default_assignee: z.string().optional(),
  default_issue_status: z.string().optional(),
  owners: z.string().optional(),
  members: z.array(z.string()).optional(),
  teamId: z.string().optional(),
});

