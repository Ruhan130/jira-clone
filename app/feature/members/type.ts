import { Models } from "node-appwrite";

export enum MemberType {
    ADMIN = "ADMIN",
    MEMBER = "MEMBER"
};


export type Member = Models.Document & {
    workspaceId: string;
    userId: string;
    role: MemberType;
    profileImage?: string;
    assigneeName? : string;
}