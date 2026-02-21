import { Models } from "node-appwrite";

export type Sprint = Models.Document & {
  name: string;                    
  duration: string;                
  startDate: string;              
  endDate: string;                 
  goal: string;                   
  reviewerId: string;             
  status: SprintStatus;            
  workspaceId: string;             
  projectId: string;               
}; 
export enum SprintDuration {
    ONE_WEEK = "1_week",
    TWO_WEEKS = "2_weeks",
    CUSTOM = "custom"
}
export enum SprintStatus {
  DRAFT = "draft",
  ACTIVE = "active", 
  COMPLETED = "completed"
}

export enum SprintSectionTaskType {
    BACKLOG = "BACKLOG",
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    IN_REVIEW = "IN_REVIEW",
    DONE = "DONE"
}

