import { MoreHorizontal } from "lucide-react";
import { Task } from "../types";
import { TaskActions } from "./task-actions";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { MemberAvatar } from "../../members/component/member-avatar";
import { TaskDate } from "./task-date";
import { ProjectAvatar } from "../../projects/component/create-project-avatar";

interface KanbanCardProps {
    task: Task;
}

export const KanbanCard = ({
    task
}: KanbanCardProps) => {
    return (
        <div className="bg-white rounded-md shadow-sm space-y-3 p-1.5 mb-1.5">
            <div className="flex items-start justify-between gap-x-2 ">
                <p className="text-sm line-clamp-2">
                    {task.name}
                </p>
                <TaskActions id={task.$id} projectId={task.$id}>
                    <MoreHorizontal className="size-[18px] stroke-1 shrink-0 text-neutral-600 hover:opacity-75 transition" />
                </TaskActions>
            </div>
            <DottedSeperator />
            <div className="flex items-center gap-x-1.5">
                <MemberAvatar
                    image={task.assigneeProfileImage  ?? ""}
                    name={task.assignee?.name ?? ""}
                    FallbackClassName="text-[10px] "
                />
                <div className="size-1 rounded-full bg-neutral-300" />
                <TaskDate value={task.dueDate} className="text-sm" />

            </div>
            <div className="flex items-center gap-x-1.5">
                <ProjectAvatar
                    name={task.project?.name ?? ""}
                    image={task.imageUrl}
                    FallBackClassName="text-sm"
                />
                <span className="text-sm font-medium">
                    {task.project?.name}
                </span>
            </div>
        </div>
    );
}