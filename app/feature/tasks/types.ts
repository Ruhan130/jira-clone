import { Models } from "node-appwrite";

export enum TaskType {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE"
}

export type Task = Models.Document & {
    name: string;
    status: string;
    assigneeId: string;
    projectId: string;
    position: string;
    dueDate: string;
}