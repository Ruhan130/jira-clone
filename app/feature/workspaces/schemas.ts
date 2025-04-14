import { z } from "zod";

export const createWrokspaceSchemas = z.object({
    name: z.string().trim().min(1, "Required"),
});