import { cn } from "@/lib/utils";
import { Project } from "../../projects/types";
import { TaskType } from "../types";
import { MemberAvatar } from "../../members/component/member-avatar";
import { ProjectAvatar } from "../../projects/component/create-project-avatar";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useRouter } from "next/navigation";

interface EventCardProps {
    title: string;
    assignee: any;
    project: Project;
    status: TaskType;
    id: string;
}


const statusColorMap: Record<TaskType, string> = {
    [TaskType.BACKLOG]: "border-l-pink-500",
    [TaskType.TODO]: "border-l-red-500",
    [TaskType.IN_PROGRESS]: "border-l-yellow-500",
    [TaskType.IN_REVIEW]: "border-l-blue-500",
    [TaskType.DONE]: "border-l-emerald-500",
};



export const EventCard = ({
    title,
    assignee,
    project,
    status,
    id,
}: EventCardProps) => {
    const workspaceId = UseWorkspaceId();
    const router = useRouter();
    const onClick = (
        e: React.MouseEvent<HTMLDivElement>
    ) => {
        e.stopPropagation();
        router.push(`/workspaces/${workspaceId}/tasks/${id}`)
    }

    return (
        <div className="px2">
            <div onClick={onClick} className={cn("p-1.5 text-xs bg-white text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition",
                statusColorMap[status]

            )}>
                <p>{title}</p>
                <div className="flex items-center gap-x-2">
                    <MemberAvatar
                        name={assignee?.name}
                    />
                    <div className="size-1 rounded-full bg-neutral-300" />

                    <ProjectAvatar
                        name={project?.name}
                        image={project.imageUrl}
                    />
                </div>
            </div>
        </div>
    )
}