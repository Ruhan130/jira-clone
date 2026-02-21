"use client";

import { EditTaskFormWRapper } from "@/app/feature/tasks/components/edit-form-wrapper";
import { useTaskId } from "@/app/feature/tasks/hooks/use-task-id";
import { toast } from "sonner";

export const EditTaskIdClient = () => {
    const taskId = useTaskId();
    if (!taskId) {
        return toast("Task ID not found");
    }
    return (
        <EditTaskFormWRapper id={taskId} />
    )
}