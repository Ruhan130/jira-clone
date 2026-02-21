import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1, "Name is required"),
  workspaceId: z.string().min(1, "Workspace ID is required"),
  image: z.union([
    z.instanceof(File),
    z.string().transform(value => value === "" ? undefined : value),
  ]).optional(),
  members: z.array( // 👈 Frontend mein array rakho
    z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().optional(),
    })
  ).min(1, "Minimum one member is required"),
  description: z.string().optional(),
  team_lead: z.string().min(1, "Team lead is required"),
});
export type CreateTeamType = z.infer<typeof createTeamSchema>;

export default createTeamSchema;


export const createTeamAPISchema = z.object({
  name: z.string().min(1, "Name is required"),
  workspaceId: z.string().min(1, "Workspace ID is required"),
  image: z.union([
    z.instanceof(File),
    z.string().transform(value => value === "" ? undefined : value),
  ]).optional(),
  members: z.string().min(1, "Members are required"), // 👈 JSON string validation
  description: z.string().optional(),
  team_lead: z.string().min(1, "Team lead is required"),
});
