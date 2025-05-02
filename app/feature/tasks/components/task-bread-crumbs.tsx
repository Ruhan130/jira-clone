import Link from "next/link";
import { ProjectAvatar } from "../../projects/component/create-project-avatar";
import { Project } from "../../projects/types"
import { Task } from "../types";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { ChevronRightIcon, TrashIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useDeletTask } from "../api/use-delete-task";
import { useConform } from "@/hooks/use-confirm";

interface TaskBreadCrumbsProps {
    project: Project;
    task: Task;
}
export const TaskBreadCrumbs = ({ project, task }: TaskBreadCrumbsProps) => {
    const router = useRouter();
    const workspaceId = UseWorkspaceId();

    const { mutate, isPending } = useDeletTask();
    const [ConfirmDailogue, confirm] = useConform(
        "Delete task",
        "This action cannot be undone",
        "destructive"
    );

    const handleDelteTask = async () => {
        const ok = await confirm();
        if (!ok) return;

        mutate({ param: { taskId: task.$id } }, {
            onSuccess: () => {
                router.push(`/workspaces/${workspaceId}/tasks`)
            }
        }

        )
    }

    return (
        <div className="flex items-center gap-x-2">
            <ConfirmDailogue />
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
                disabled={isPending}
                onClick={handleDelteTask}
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