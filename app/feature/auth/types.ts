import { Models } from "node-appwrite";

export type ForgotPass = Models.Document & {
    password: string;
    confPassword: string;
    // workspaceId: string;
};