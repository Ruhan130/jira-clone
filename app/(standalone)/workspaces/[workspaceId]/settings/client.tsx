"use client"
import { useGetWorkspace } from "@/app/feature/workspaces/api/use-get-workspace"
import { EditWorkSpaceForm } from "@/app/feature/workspaces/component/edit-workspace-form"
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const WorkspaceIdSettingsClient = () => {
    const workspaceId = UseWorkspaceId();
    const { data: initialValues, isLoading } = useGetWorkspace({ workspaceId });

    if (isLoading) {
        return <PageLoader />
    }

    if (!initialValues) {
        return <PageError message="Project Not Found" />
    }

    return (
        <div className="w-full lg:max-w-xl">
            <EditWorkSpaceForm initialValues={initialValues} />
        </div>
    )
}