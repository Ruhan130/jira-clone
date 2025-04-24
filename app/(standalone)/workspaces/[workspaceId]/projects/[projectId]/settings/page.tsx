import { getCurrent } from "@/app/feature/auth/queries"
import { EditProjectForm } from "@/app/feature/projects/component/edit-project-form";
import { getProject } from "@/app/feature/projects/queries";
import { redirect } from "next/navigation";

interface ProjectIdSettingsPage {
    params: { projectId: string }
}

const ProjectISettingsPage = async ({ params }: ProjectIdSettingsPage) => {
    const user = getCurrent();
    if (!user) redirect("/sign-in");

    const initialValues = await getProject(
        {
            projectId: params.projectId
        }
    )
    return (
        <div className="w-full lg:max-w-xl">
            <EditProjectForm initialValues={initialValues} />
        </div>
    )
}

export default ProjectISettingsPage