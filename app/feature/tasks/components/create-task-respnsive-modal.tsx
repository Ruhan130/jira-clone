"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { UseCreateTaskModal } from "../hooks/use-create-task-modal";
import { CreateProjectForm } from "../../projects/component/create-project-form";
import { CreateTaskFormWRapper } from "./creat-task-form-wrapper";

export const CreateTaskModal = () => {
    const { isopen, setIsOpen, close } = UseCreateTaskModal();
    return (
        <ResponsiveModal open={isopen} onOpenChange={setIsOpen} >
            <CreateTaskFormWRapper onCanel={close} />
        </ResponsiveModal>
    )
}