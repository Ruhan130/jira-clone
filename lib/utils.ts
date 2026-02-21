import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function generateInvitationCode(length: number) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};


export function snakeCaseToTitleCase(str: string) {
  return str.toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

// lib/auth.ts or utils/email-verification.ts

import { Account } from "appwrite";
import { appwriteClientBrowser } from "@/lib/appwrite-client";

export interface EmailVerificationResult {
  success: boolean;
  message: string;
  error?: string;
}

export const sendEmailVerification = async (email: string): Promise<EmailVerificationResult> => {
  try {
    const account = new Account(appwriteClientBrowser);
    
    // Send OTP to email using email as userId
    await account.createEmailToken(email, email);
    
    return {
      success: true,
      message: "Verification code sent successfully to your email!"
    };

  } catch (error: any) {
    console.error("Email verification error:", error);
    
    // Handle specific Appwrite errors
    let errorMessage = "Failed to send verification code. Please try again.";
    
    switch (error.code) {
      case 400:
        errorMessage = "Invalid email address format.";
        break;
      case 401:
        errorMessage = "Email address not found.";
        break;
      case 429:
        errorMessage = "Too many requests. Please wait before trying again.";
        break;
      case 500:
        errorMessage = "Server error. Please try again later.";
        break;
      default:
        errorMessage = error.message || "Something went wrong.";
    }

    return {
      success: false,
      message: errorMessage,
      error: error.code
    };
  }
};