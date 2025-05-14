"use client"

import { useGetProject } from "@/app/feature/projects/api/use-get-project";
import { EditProjectForm } from "@/app/feature/projects/component/edit-project-form";
import { useProjectId } from "@/app/feature/projects/hooks/use-project-id"
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const ProjectIdSettingsClient = () => {
    const projectId = useProjectId();
    const { data: initalValues, isLoading } = useGetProject({ projectId });

    if (isLoading) {
        return <PageLoader />
    }

    if (!initalValues) {
        return <PageError message="Project not found" />
    }


    return (
        <div className="w-full lg:max-w-xl">
            <EditProjectForm initialValues={initalValues} />
        </div>

    )
}