"use client";
import { useGetWorkspaceInfo } from "@/app/feature/workspaces/api/use-get-workspace-info";
import { UseJoinWorkspaceForm } from "@/app/feature/workspaces/component/join-workspace-form"
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const WorkspaceJoinIdClient = () => {
    const workspaceId = UseWorkspaceId();
    const { data: initialValues, isLoading } = useGetWorkspaceInfo({ workspaceId });

    if (isLoading) {
        return <PageLoader />
    }

    if (!initialValues) {
        return <PageError message="Project Not Found" />
    }

    return (
        <div className="w-full lg:max-w-xl">
            <UseJoinWorkspaceForm initialValues={initialValues} />
        </div>
    )
}