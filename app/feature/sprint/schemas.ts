import { z } from "zod";

export const CreateSprintSchema = z.object({
    name: z.string().min(1, "Sprint name is required"),
    duration: z.enum(["1_week", "2_weeks", "custom"]),
    startDate: z.string().min(1, "Start date is required"),     
    endDate: z.string().min(1, "End date is required"),
    goal: z.string().optional(),
    // reviewerId: z.string().min(1, "Reviewer is required"),      
    tasks: z.string().min(1, "Minimum 1 task is required"),      
    workspaceId: z.string().min(1, "Workspace ID is required"),
    status: z.enum(["draft", "active", "completed"]).optional(),  
    sprintIdentifier: z.string().min(1, "Sprint Identifer is required"),
});

// export type CreteSprintType = z.infer<typeof CreateSprintSchema>export
export type CreateSprintType = z.infer<typeof CreateSprintSchema>;


export const EditSprintSchema = z.object({
    name: z.string().min(1, "Sprint name is required"),
    duration: z.enum(["1_week", "2_weeks", "custom"]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    goal: z.string().optional(),
    // reviewerId: z.string().min(1, "Reviewer is required"),
    tasks: z.string().min(1, "Minimum 1 task is required"),
    workspaceId: z.string().min(1, "Workspace ID is required"),
    status: z.enum(["draft", "active", "completed"]).optional(),
});


export type EditSprintType = z.infer<typeof EditSprintSchema>;