import { Models } from "node-appwrite";

export enum TaskType {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE",
    NOT_STARTED = "NOT_STARTED"
}

export enum PriorityType {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW"
}

export enum LabelType {
    BUG = "BUG",
    FEATURE = "FEATURE",
    IMPROVEMENT = "IMPROVEMENT"
}


export type Task = Models.Document & {
    name: string;
    workspaceId: string;
    status: TaskType;
    assigneeId: string;
    projectId: string;
    position: number;
    dueDate: string;
    description?: string;

    assignee?: {
        name: string;
        email: string;
        profileImage?: string;
    };
    project?: {
        name: string;
        imageUrl?: string;
    };
}

export type TaskTable = Models.Document & {
    name: string;
    workspaceId: string;
    status: TaskType;
    assigneeId: string;
    projectId: string;
    position: number;
    dueDate: string;
    description?: string;
    priority?: string;

    // ✅ FIXED: Direct assignee properties (as they actually exist)
    assigneeName?: string;
    assigneeEmail?: string;
    assigneeProfileImage?: string;

    // ✅ Nested assignee object (workspace member info)
    assignee?: {
        userId: string;
        workspaceId: string;
        role: string;
        $id: string;
        // Note: This doesn't contain name/email/profileImage
    };

    project?: {
        name: string;
        imageUrl?: string;
    };
}