"use client";
import { useGetProject } from "@/app/feature/projects/api/use-get-project"
import { ProjectAvatar } from "@/app/feature/projects/component/create-project-avatar"
import { useProjectId } from "@/app/feature/projects/hooks/use-project-id"
import { TaskViewSwitcher } from "@/app/feature/tasks/components/task-view-switcher"
import { PageError } from "@/components/page-error"
import { PageLoader } from "@/components/page-loader"
import { Button } from "@/components/ui/button"
import { PencilIcon } from "lucide-react"
import Link from "next/link"

export const ProjectIdPage = () => {
    const projectId = useProjectId();
    const { data, isLoading } = useGetProject({ projectId });

    if (isLoading) {
        return <PageLoader />
    }

    if (!data) {
        return <PageError message="Project not Found" />
    }


    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    <ProjectAvatar
                        name={data.name}
                        image={data.imageUrl}
                        className="size-8" />
                    <p className="text-lg font-semibold">
                        {data.name}
                    </p>
                </div>
                <div>
                    <Button variant="secondary" size="sm" asChild >
                        <Link href={`/workspaces/${data.workspaceId}/projects/${data.$id}/settings`}>
                            <PencilIcon className="size-4 mr-2" />
                            Edit Project
                        </Link>
                    </Button>
                </div>
            </div>
            <TaskViewSwitcher hideProjectFilter />
        </div>
    )
}