import { z } from "zod"; 

export const loginSchema = z.object({
    email : z.string().email(),
    password: z.string().min(1, "required")
});



export const registerSchema = z.object({
    name: z.string().trim().min(1, "Minimun 1 character is required"),
    email: z.string().email(),
    password: z.string().min(1, "Required")
});

