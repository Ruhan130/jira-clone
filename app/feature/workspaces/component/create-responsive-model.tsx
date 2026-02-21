"use client"

import { ResponsiveModal } from "@/components/responsive-modal"
import { CreateWorkSpaceForm } from "./create-workspace-form"
import { UseCreateWorkspaceModal } from "../hooks/use-create-workspace-modal"

export const CreateResponsiveModal = () => {
    const { isopen, setIsOpen, close } = UseCreateWorkspaceModal();
    return (
        <ResponsiveModal open={isopen} onOpenChange={setIsOpen}>
            <CreateWorkSpaceForm onCancel={close} />
        </ResponsiveModal>
    )
}