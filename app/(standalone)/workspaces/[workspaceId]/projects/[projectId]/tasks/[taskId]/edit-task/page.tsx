export const dynamic = 'force-dynamic';

import { getCurrent } from "@/app/feature/auth/queries";
import { redirect } from "next/navigation";
import { EditTaskIdClient } from "./client";

const ProjectISettingsPage = async () => {
    const user = getCurrent();
    if (!user) redirect("/sign-in");


    return <EditTaskIdClient />
}

export default ProjectISettingsPage