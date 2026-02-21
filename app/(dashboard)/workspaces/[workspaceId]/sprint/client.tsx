"use client"

import { UseGetSprints } from "@/app/feature/sprint/api/use-get-sprints";
import { ViewActiveSprint } from "@/app/feature/sprint/component/view-active-sprint"
import { Sprint } from "@/app/feature/sprint/type";
import { useGetTasks } from "@/app/feature/tasks/api/use-get-tasks";
import { Task } from "@/app/feature/tasks/types";
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const ActiveSprintViewIdClient = () => {
    const workspaceId = UseWorkspaceId()
    const { data: sprintData, isPending: isSprintLoading } = UseGetSprints({ workspaceId });
    // const { data: taskdata, isPending: isTaskLoading } = useGetTasks({ workspaceId });
    const isLoading = isSprintLoading;

    if (isLoading) {
        return <PageLoader />
    }
    if (!sprintData) {
        return <PageError message="Data Not Found" />
    }
    console.log("Sprint data:", sprintData.documents);
    console.log("Sprint count:", sprintData.documents?.length);

    return (
        <ViewActiveSprint  sprintData={sprintData.documents as Sprint[]} />
    )
}