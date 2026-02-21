"use client";

import { useGetProject } from "@/app/feature/projects/api/use-get-project";
import { useGetProjectAnalytics } from "@/app/feature/projects/api/use-get-project-analytics";
import { ProjectAvatar } from "@/app/feature/projects/component/create-project-avatar";
import { useProjectId } from "@/app/feature/projects/hooks/use-project-id";
import { TaskViewSwitcher } from "@/app/feature/tasks/components/task-view-switcher";
import { Analytics } from "@/components/analytics";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import Link from "next/link";


export const ProjectIdClient = () => {
    const projectId = useProjectId();
    const { data: project, isLoading: isLoadingProject } = useGetProject({ projectId });


    const { data: analytics, isLoading: isLoadingProjectAnalytics } = useGetProjectAnalytics({ projectId });

    const isLoading = isLoadingProject || isLoadingProjectAnalytics
    if (isLoading) {
        return <PageLoader />
    }
    if (!project) {
        return <PageError message="Project not found" />
    }

    return (
        <div className="flex flex-col gap-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-x-2">
                    {/* <ProjectAvatar
                        image={project.imageUrl}
                        name={project.name}
                        className="size-8" />
                    <p className="text-lg font-semibold">
                        {project.name}
                    </p> */}
                </div>
                <div>
                    <Button variant="secondary" size="sm" asChild >
                        <Link href={`/workspaces/${project.workspaceId}/projects/${project.$id}/settings`}>
                            <PencilIcon className="size-4 mr-2" />
                            Edit Project
                        </Link>
                    </Button>
                </div>
            </div>
            {analytics ? (
                <Analytics data={analytics} />
            ) : null}
            <TaskViewSwitcher hideProjectFilter />
        </div>
    )
} 