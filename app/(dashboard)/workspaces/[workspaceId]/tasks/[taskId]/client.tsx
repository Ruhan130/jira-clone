"use client";

import { useGetTask } from "@/app/feature/tasks/api/use-get-task";
import { useTaskId } from "@/app/feature/tasks/hooks/use-task-id";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";


export const TaskIdClient = () => { 
    const taskId = useTaskId();
    const { data, isLoading } = useGetTask({ taskId });
    if (isLoading) {
        return <PageLoader />
    }
    if (!data) {
        return <PageError message="Task no found" />
    }

    return (
        <p>
            {JSON.stringify(data)}
        </p>


    );
}

