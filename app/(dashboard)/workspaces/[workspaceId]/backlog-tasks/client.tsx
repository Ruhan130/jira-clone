"use client"
import { ShowBacklogTask } from "@/app/feature/sprint/component/show-backlog-tasks";
import { useGetTasks } from "@/app/feature/tasks/api/use-get-tasks";
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const BackLogTasksIdClient = () => {
    const workspaceId = UseWorkspaceId();
    const { data: taskData, isLoading: taskDataLoading } = useGetTasks({ workspaceId });
    const isLoading = taskDataLoading;


    if (isLoading) {
        return <PageLoader />
    }
    if (!taskData) {
        return <PageError message="Tasks Not Found" />
    }



    return (
        <ShowBacklogTask taskData={taskData} />
    )
}