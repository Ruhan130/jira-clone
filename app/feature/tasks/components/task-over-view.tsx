import { Button } from "@/components/ui/button"
import { Task } from "../types"
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater"
import { OverviewProperty } from "./overview-property"
import { MemberAvatar } from "../../members/component/member-avatar"
import { TaskDate } from "./task-date"
import { Badge } from "@/components/ui/badge"
import { snakeCaseToTitleCase } from "@/lib/utils"
import { UseEditTaskModel } from "../hooks/use-edit-task-modal"

interface TaskOverViewPops {
    task: Task
}
export const TaskOverView = ({ task }: TaskOverViewPops) => {
    const { open } = UseEditTaskModel();
    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Overview
                    </p>
                    <Button
                        onClick={() => open(task.$id)}
                        size="sm" variant="secondary"
                    >
                        Edit
                    </Button>
                </div>
                <DottedSeperator className="my-4" />
                <div className="flex flex-col gap-y-4">
                    <OverviewProperty label="Assignee">
                        <MemberAvatar
                            name={task.assignee.name}
                            className="size-6"
                        />
                        <p className="text-sm font-medium">{task.assignee.name}</p>
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