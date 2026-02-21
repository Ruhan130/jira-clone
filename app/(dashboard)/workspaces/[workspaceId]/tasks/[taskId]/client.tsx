"use client";

import { useGetComments } from "@/app/feature/tasks/api/use-get-commets";
import { useGetSubtasks } from "@/app/feature/tasks/api/use-get-subtask";
import { useGetTask } from "@/app/feature/tasks/api/use-get-task";
import { SubtasksSection } from "@/app/feature/tasks/components/sub-task-view";
import { TaskBreadCrumbs } from "@/app/feature/tasks/components/task-bread-crumbs";
import { TaskDescription } from "@/app/feature/tasks/components/task-description";
import { TaskOverView } from "@/app/feature/tasks/components/task-over-view";
import { useTaskId } from "@/app/feature/tasks/hooks/use-task-id";
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";


export const TaskIdClient = () => {
    const taskId = useTaskId();
    const workpsaceId = UseWorkspaceId();
    const { data, isLoading: getTaskLoading } = useGetTask({ taskId });
    const { data: subtasks, isLoading: subtaskLoading } = useGetSubtasks(workpsaceId, taskId);
    // const {data: comments} = useGetComments(subtasks);
    const isLoading = getTaskLoading || subtaskLoading;
    if (isLoading || subtaskLoading) {
        return <PageLoader />
    }
    if (!data) {
        return <PageError message="Task no found" />
    }

    return (
        <div className="flex flex-col">
            <TaskBreadCrumbs project={data.project} task={data} />

            <DottedSeperator className="my-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <TaskOverView task={data} />

                {/* Right side - Combined content */}
                <div className="space-y-6">
                    <TaskDescription task={data} />
                    {!isLoading && subtasks && subtasks.length > 0 && (
                        <SubtasksSection task={data} />
                    )}
                </div>
            </div>
        </div>
    );
}

