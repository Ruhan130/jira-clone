import React, { useCallback, useEffect, useState } from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult
} from "@hello-pangea/dnd"
import { Task, TaskType } from "../types";

const boards: TaskType[] = [
    TaskType.BACKLOG,
    TaskType.TODO,
    TaskType.IN_PROGRESS,
    TaskType.IN_REVIEW,
    TaskType.DONE,
]


type TaskState = {
    [key in TaskType]: Task[];
};

interface DataKanbanProps {
    data: Task[];
}

export const DataKanban = ({
    data,
}: DataKanbanProps) => {

    const [task, setTask] = useState<TaskState>(() => {
        const initailTask: TaskState = {
            [TaskType.BACKLOG]: [],
            [TaskType.TODO]: [],
            [TaskType.IN_PROGRESS]: [],
            [TaskType.IN_REVIEW]: [],
            [TaskType.DONE]: [],
        };

        data.forEach((task) => {
            initailTask[task.status].push(task);
        });
        Object.keys(initailTask).forEach((status) => {
            initailTask[status as TaskType].sort((a, b) => a.position - b.position);
        });

        return initailTask;
    });

    return (
        <DragDropContext onDragEnd={() => { }}>
            <div className="flex overflow-x-auto">
                {boards.map((board) => {
                    return (
                        <div className="flex-1 mr-2 bg-muted p-1.5 rounded-md min-w-[200px]">
                            {board}
                        </div>
                    )
                })}
            </div>
        </DragDropContext>
    )
}