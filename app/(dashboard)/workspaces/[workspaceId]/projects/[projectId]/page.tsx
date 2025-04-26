import { getCurrent } from "@/app/feature/auth/queries";
import { ProjectAvatar } from "@/app/feature/projects/component/create-project-avatar";
import { getProject } from "@/app/feature/projects/queries";
import { TaskViewSwitcher } from "@/app/feature/tasks/components/task-view-switcher";
// import TaskViewSwitcher from "@/app/feature/tasks/components/task-view-switcher";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface ProjectIdpAgeProps {
    params: { projectId: string }
}
const ProjectIdPage = async ({ params }: ProjectIdpAgeProps) => {
    const user = await getCurrent();
    if (!user) redirect("/sign-in");

    const initailValues = await getProject({
        projectId: params.projectId
    });

    if (!initailValues) {
        throw new Error("Project Not Found");
    }
    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <ProjectAvatar
                        name={initailValues.name}
                        image={initailValues.imageUrl}
                        className="size-8" />
                    <p className="text-lg font-semibold">
                        {initailValues.name}
                    </p>
                </div>
                <div>
                    <Button variant="secondary" size="sm" asChild >
                        <Link href={`/workspaces/${initailValues.workspaceId}/projects/${initailValues.$id}/settings`}>
                            <PencilIcon className="size-4 mr-2" />
                            Edit Project
                        </Link>
                    </Button>
                </div>
            </div>
            <TaskViewSwitcher />
        </div>
    );
}

export default ProjectIdPage;