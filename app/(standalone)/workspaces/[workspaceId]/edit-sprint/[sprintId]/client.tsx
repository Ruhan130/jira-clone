"use client"

import { useGetSprint } from "@/app/feature/sprint/api/use-get-sprint";
import { EditSprintForm } from "@/app/feature/sprint/component/edit-sprint-form"
import { UseSprintId } from "@/app/feature/sprint/hooks/use-sprint-id";
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const EditsprintIdClient = () => {
    const workspaceId = UseWorkspaceId();
    const sprintId = UseSprintId();
    const { data: initialValues, isPending: isLoading } = useGetSprint({ workspaceId, sprintId });

    if (isLoading) {
        return <PageLoader />
    }
    if (!initialValues) {
        return <PageError message="Project Not Found" />
    }
    return (
        <div>
            <EditSprintForm initailValues={initialValues} />
        </div>
    )
}