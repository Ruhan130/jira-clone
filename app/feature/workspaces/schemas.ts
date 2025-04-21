import { z } from "zod";

export const createWrokspaceSchemas = z.object({
    name: z.string().trim().min(1, "Required"),
    image: z.union([
        z.instanceof(File),
        z.string().transform((value) => value === "" ? undefined : value),
    ])
        .optional(),

});

export const updateWorkSpaceSchema = z.object({
    name: z.string().trim().min(1, "Must have 1 charachter").optional(),
    image: z.union([
        z.instanceof(File),
        z.string().nullable(),

    ])
        .optional(),

});