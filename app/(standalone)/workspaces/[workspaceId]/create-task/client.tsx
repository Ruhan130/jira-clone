"use client"

import { useGetMembers } from "@/app/feature/members/api/use-get-members";
import { useGetAllMembers } from "@/app/feature/members/api/use-get-members-without-id";
import { useGetProjects } from "@/app/feature/projects/api/use-get-projects";
import { CreateTaskUiForm } from "@/app/feature/tasks/components/create-task-ui-form"
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id"
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const CreatePageClient = () => {

    const workspaceId = UseWorkspaceId();

    const { data: members, isLoading: memberLoading } = useGetMembers({ workspaceId });
    const { data: projects, isLoading: projectLoading } = useGetProjects({ workspaceId });
    const isLoading = memberLoading || projectLoading;

    const projectOptions = projects?.documents.map((projects) => ({
        id: projects.$id,
        name: projects.name,
        imageUrl: projects.imageUrl,
    }));

    const memberOptions = members?.documents.map((member) => ({
        id: member.$id,
        name: member.name,
        profileImage: member.profileImage,
    }));


    if (isLoading) {
        return <PageLoader />
    }
    if (!memberOptions || !projectOptions) {
        return <PageError message="Data Not Found" />
    }



    return (
        <CreateTaskUiForm memberOptions={memberOptions ?? []} projectOptions={projectOptions} />
    )
}