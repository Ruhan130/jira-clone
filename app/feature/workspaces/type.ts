import { Models } from "node-appwrite";

export type Workspace = Models.Document & {
    name: string;
    imageUrl: string;
    inviteCode: string;
    userId: string
};

export enum WorkspaceRange {
    ONE_TO_TEN = "1-2",           
    ELEVEN_TO_FIFTY = "11-50",    
    FIFTY_ONE_TO_HUNDRED = "51-100",
    HUNDRED_PLUS = "100+",        
}


export const WorkspaceRangeLabels: Record<WorkspaceRange, string> = {
    [WorkspaceRange.ONE_TO_TEN]: "1-2 people",
    [WorkspaceRange.ELEVEN_TO_FIFTY]: "11-50 people",
    [WorkspaceRange.FIFTY_ONE_TO_HUNDRED]: "51-100 people",
    [WorkspaceRange.HUNDRED_PLUS]: "100+ people",
};

export const getMaxUsersFromRange = (range: string): number => {
    switch (range) {
        case "1-2": return 2;
        case "11-50": return 50;
        case "51-100": return 100;
        case "100+": return 1000; // or unlimited
        default: return 10; // fallback
    }
};