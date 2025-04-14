import { z } from "zod";

export const createWrokspaceSchemas = z.object({
    name: z.string().trim().min(1, "Required"),
    imagUrl: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
    ])
        .optional(),

});