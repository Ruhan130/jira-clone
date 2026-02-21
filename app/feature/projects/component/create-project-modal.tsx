"use client"

import { ResponsiveModal } from "@/components/responsive-modal"
import { CreateProjectForm } from "./create-project-form"
import { UseCreateProjectModal } from "../hooks/use-create-project-modal";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useGetMembers } from "../../members/api/use-get-members";


export const CreateProjectModal = () => {
    const workspaceId = UseWorkspaceId();
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

    const memberOptions = members?.documents.map((project) => ({
        id: project.$id,
        name: project.name,
    }));
    const { isopen, setIsOpen, close } = UseCreateProjectModal();
    return (
        <ResponsiveModal open={isopen} onOpenChange={setIsOpen}>
            <CreateProjectForm onCancel={close} memberOptions={memberOptions ?? []} />
        </ResponsiveModal>
    )
}