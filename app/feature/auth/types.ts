import { Models } from "node-appwrite";

export type ForgotPass = Models.Document & {
    password: string;
    confPassword: string;
    // workspaceId: string;
};

export type SendMagicLinkPayload = {
    email: string;
};

export type SendMagicLinkResponse = {
    message: string;
    maskedEmail: string;
};

export type SendMagicLinkError = {
    error: string;
};


type CheckUserResponse = {
    exists: boolean;
    isNewUser: boolean;
    provider?: "email" | "google"; 
};
