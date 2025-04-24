import { getCurrent } from "@/app/feature/auth/queries"
import { getProject } from "@/app/feature/projects/queries";
import { redirect } from "next/navigation";

interface ProjectIdSettingsPage {
    params: { projectId: string }
}

const ProjectISettingsPage = async ({ params }: ProjectIdSettingsPage) => {
    const user = getCurrent();
    if (!user) redirect("/sign-in");

    const initialValues = getProject(
        {
            projectId: params.projectId
        }
    )
    return (
        <div className="w-full lg:max-w-xl">
            projectidOafe
        </div>
    )
}

export default ProjectISettingsPage