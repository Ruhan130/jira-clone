import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "required")
});



export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email"),
  password: z.string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
});



export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Only if you don't want to validate on server
export const resetPasswordSchema = z.object({
  userId: z.string(),
  secret: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});





