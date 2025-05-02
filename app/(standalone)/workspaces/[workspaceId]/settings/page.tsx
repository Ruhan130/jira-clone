import { getCurrent } from "@/app/feature/auth/queries";
import { redirect } from "next/navigation";
import { WorkspaceIdSettingsClient } from "./client";


const WorkspaceSettingPage = async () => {

    const user = await getCurrent();
    if (!user) redirect("/sign-in");
    return <WorkspaceIdSettingsClient />
}

export default WorkspaceSettingPage