"use client";

import { useGetTask } from "@/app/feature/tasks/api/use-get-task";
import { TaskBreadCrumbs } from "@/app/feature/tasks/components/task-bread-crumbs";
import { TaskDescription } from "@/app/feature/tasks/components/task-description";
import { TaskOverView } from "@/app/feature/tasks/components/task-over-view";
import { useTaskId } from "@/app/feature/tasks/hooks/use-task-id";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";


export const TaskIdClient = () => {
    const taskId = useTaskId();
    const { data, isLoading } = useGetTask({ taskId });
    if (isLoading) {
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
                <TaskDescription task={data}/>

            </div>
        </div>

    );
}

