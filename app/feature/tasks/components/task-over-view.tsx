import { Button } from "@/components/ui/button"
import { Task } from "../types"
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater"
import { OverviewProperty } from "./overview-property"
import { MemberAvatar } from "../../members/component/member-avatar"
import { TaskDate } from "./task-date"
import { Badge } from "@/components/ui/badge"
import { snakeCaseToTitleCase } from "@/lib/utils"
import { UseEditTaskModel } from "../hooks/use-edit-task-modal"
import { useRouter } from "next/navigation"
import { useProjectId } from "../../projects/hooks/use-project-id"
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id"

interface TaskOverViewPops {
    task: Task
    // projectId? : string 
}
export const TaskOverView = ({ task }: TaskOverViewPops) => {
    // const { open } = UseEditTaskModel();
    const projectId = useProjectId();
    const workpsaceId = UseWorkspaceId();
    const router = useRouter();
    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Overview
                    </p>
                    <div className="justify-between ">
                        <Button
                            onClick={() => router.push(`/workspaces/${workpsaceId}/projects/${task.projectId}/tasks/${task.$id}/edit-task`)}
                            size="sm" variant="secondary"
                        >
                            Edit
                        </Button>
                        <Button className="ml-4"
                            onClick={() => router.push(`/workspaces/${workpsaceId}/projects/${task.projectId}/tasks/${task.$id}/sub-task`)}
                            size="sm" variant="destructive"
                        >
                            Create Sub task
                        </Button>
                    </div>

                </div>
                <DottedSeperator className="my-4" />
                <div className="flex flex-col gap-y-4">
                    <OverviewProperty label="Assignee">
                        <MemberAvatar
                            image={task.assigneeProfileImage ?? ""}
                            name={task.assignee?.name ?? ""}
                            className="size-6"
                        />
                        <p className="text-sm font-medium">{task.assignee?.name}</p>
                    </OverviewProperty>
                    <OverviewProperty label="Due Date">
                        <TaskDate value={task.dueDate} className="text-sm font-medium" />
                    </OverviewProperty>

                    <OverviewProperty label="Status">
                        <Badge variant={task.status}>
                            {snakeCaseToTitleCase(task.status)}
                        </Badge>
                    </OverviewProperty>
                </div>
            </div>

        </div>
    )
}