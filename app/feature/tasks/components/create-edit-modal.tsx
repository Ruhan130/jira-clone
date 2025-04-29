"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { UseEditTaskModel } from "../hooks/use-edit-task-modal";
import { EditTaskFormWRapper } from "./create-edit-form-wrapper";

export const CreateEditModel = () => {
    const { taskId, close } = UseEditTaskModel();
    return (
        <ResponsiveModal open={!!taskId} onOpenChange={close} >
            {
                taskId && (
                    <EditTaskFormWRapper id={taskId} onCanel={close} />
                )
            };
        </ResponsiveModal>
    )
}