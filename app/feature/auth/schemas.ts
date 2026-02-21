import { z } from "zod";
import { MemberType } from "../members/type";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "required")
});




export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Invalid email"),
  position: z.string().trim().min(1, "Position is required"),
  productNotification: z.boolean(),
  password: z.string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  imageUrl: z.union([
    z.instanceof(File),
    z.string()
  ]).optional(),
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





export const sendMagicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});


// export const inviteCoworkersSchema = z.object({
//   email: z.string().email("Please entera avalid email address"),
//   role: z.nativeEnum(MemberType, { required_error: "requied"})
// })

export const inviteCoworkersSchema = z.object({
  invites: z.array(
    z.object({
      email: z.string().email("Invalid email"),
      role: z.enum([MemberType.ADMIN, MemberType.MEMBER])
    })
  )
});