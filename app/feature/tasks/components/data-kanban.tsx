import React, { useCallback, useEffect, useState } from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult
} from "@hello-pangea/dnd"
import { Task, TaskType } from "../types";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";

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
                        <div key={board} className="flex-1 mr-2 bg-muted p-1.5 rounded-md min-w-[200px]">
                            <KanbanColumnHeader
                                board={board}
                                taskCount={task[board].length}
                            />
                            <Droppable droppableId={board}>
                                {(provided) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="min-h-[200px] py-1.5"
                                    >
                                        {task[board].map((task, index) => (
                                            <Draggable key={task.$id} draggableId={task.$id} index={index}>
                                                {
                                                    (provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.dragHandleProps}
                                                            {...provided.draggableProps}
                                                        >
                                                            <KanbanCard task={task} />
                                                        </div>
                                                    )
                                                }
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>

                        </div>
                    )
                })}
            </div>
        </DragDropContext>
    )
}