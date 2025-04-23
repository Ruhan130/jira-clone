"use client"

import { ResponsiveModal } from "@/components/responsive-modal"
import { CreateProjectForm } from "./create-project-form"
import { UseCreateProjectModal } from "../hooks/use-create-project-modal";


export const CreateProjectModal = () => {
    const { isopen, setIsOpen, close } = UseCreateProjectModal();
    return (
        <ResponsiveModal open={isopen} onOpenChange={() => { setIsOpen }}>
            <CreateProjectForm onCancel={close} />
        </ResponsiveModal>
    )
}