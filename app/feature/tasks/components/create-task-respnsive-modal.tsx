"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { UseCreateTaskModal } from "../hooks/use-create-task-modal";

export const CreateTaskModal = () => {
    const { isopen, setIsOpen } = UseCreateTaskModal();
    return (
        <ResponsiveModal open={isopen} onOpenChange={setIsOpen} >
            <div className="">
                TODO:TASK IS FORM
            </div>

        </ResponsiveModal>
    )
}