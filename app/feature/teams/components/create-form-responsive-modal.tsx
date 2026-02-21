"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { UseCreateTeamModal } from "../hook/use-create-team-modal";
import { CreateTeamFormWrapper } from "./create-team-form-wrapper";

export const CreateTeamsModal = () => {
    const { isopen, setIsOpen, close } = UseCreateTeamModal();
    return (
        <ResponsiveModal open={isopen} onOpenChange={setIsOpen} >
            <CreateTeamFormWrapper onCanel={close} />
        </ResponsiveModal>
    )
}