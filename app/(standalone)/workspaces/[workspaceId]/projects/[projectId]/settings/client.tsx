"use client"

import { useGetMembers } from "@/app/feature/members/api/use-get-members";
import { useGetProject } from "@/app/feature/projects/api/use-get-project";
import { EditProjectForm } from "@/app/feature/projects/component/edit-project-form";
import { useProjectId } from "@/app/feature/projects/hooks/use-project-id"
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const ProjectIdSettingsClient = () => {
    const projectId = useProjectId();
    const workspaceId = UseWorkspaceId();
    const { data: initalValues, isLoading } = useGetProject({ projectId });
    const { data: members } = useGetMembers({ workspaceId });

    const memberOptions = members?.documents.map((member) => ({
        id: member.$id,
        name: member.name,
        image: member.profileImage,
    })) || [];


    if (isLoading) {
        return <PageLoader />
    }

    if (!initalValues) {
        return <PageError message="Project not found" />
    }


    return (
        <div className="w-full lg:max-w-xl">
            <EditProjectForm memberOptions={memberOptions} initialValues={initalValues} />
        </div>

    )
}