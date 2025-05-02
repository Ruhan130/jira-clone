import { getCurrent } from "@/app/feature/auth/queries"
import { EditProjectForm } from "@/app/feature/projects/component/edit-project-form";
// import { getProject } from "@/app/feature/projects/queries";
import { redirect } from "next/navigation";
import { ProjectIdSettingsClient } from "./client";



const ProjectISettingsPage = async () => {
    const user = getCurrent();
    if (!user) redirect("/sign-in");


    return <ProjectIdSettingsClient />
}

export default ProjectISettingsPage