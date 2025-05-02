import Link from "next/link";
import { ProjectAvatar } from "../../projects/component/create-project-avatar";
import { Project } from "../../projects/types"
import { Task } from "../types";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { ChevronRightIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TaskBreadCrumbsProps {
    project: Project;
    task: Task;
}
export const TaskBreadCrumbs = ({ project, task }: TaskBreadCrumbsProps) => {
    const workspaceId = UseWorkspaceId();
    return (
        <div className="flex items-center gap-x-2">
            <ProjectAvatar
                name={project.name}
                image={project.imageUrl}
                className="size-6 lg:size-8"
            />
            <Link
                href={`/workspaces/${workspaceId}/projects/${project.$id}`}
            >
                <p className="text-sm lg:text-lg text-muted-foreground font-semibold hover:opacity-75 transition">
                    {project.name}
                </p>
            </Link>

            <ChevronRightIcon
                className="size-4 lg:size-6 text-muted-foreground"
            />
            <p className="text-sm lg:text-lg font-semibold">
                {task.name}
            </p>

            <Button
                size="sm"
                variant="destructive"
                className="ml-auto"
            >
                <TrashIcon className="size-4 lg:mr-2" />
                <span className="hidden lg:block">
                    Delete Task
                </span>
            </Button>
        </div>
    )
}