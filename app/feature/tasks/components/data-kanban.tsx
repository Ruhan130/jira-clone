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
    onChange: (task: { $id: string; status: TaskType; position: number }[]) => void;
}

export const DataKanban = ({
    data,
    onChange
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

    useEffect(() => {
        const newTasks: TaskState = {
            [TaskType.BACKLOG]: [],
            [TaskType.TODO]: [],
            [TaskType.IN_PROGRESS]: [],
            [TaskType.IN_REVIEW]: [],
            [TaskType.DONE]: [],
        };
        data.forEach((task) => {
            newTasks[task.status].push(task);
        });
        Object.keys(newTasks).forEach((status) => {
            newTasks[status as TaskType].sort((a, b) => a.position - b.position);
        });

        setTask(newTasks);
    }, [data])


    const onDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return;

        const { source, destination } = result;
        const sourceStatus = source.droppableId as TaskType;
        const destStatus = destination.droppableId as TaskType;

        let updatesPayLoad: { $id: string; status: TaskType; position: number; }[] = [];

        setTask((prevTask) => {
            const newTask = { ...prevTask };

            // Safely remove the task form the source column 
            const sourceColumn = [...newTask[sourceStatus]];
            const [movedTask] = sourceColumn.splice(source.index, 1);

            // Of there is no moved task (shouldn't happen, but just in case) return the task

            if (!movedTask) {
                console.error("No task Found at the source index");
                return prevTask;
            }

            //  Create new task object with pottenitalyy updated status
            const updateMovedTask = sourceStatus !== destStatus
                ? { ...movedTask, status: destStatus }
                : movedTask;

            // update the soucre column 
            newTask[sourceStatus] = sourceColumn;

            //  Add the task to the destination column
            const destColumn = [...newTask[destStatus]];
            destColumn.splice(destination.index, 0, updateMovedTask);
            newTask[destStatus] = destColumn;


            // prepare minimal update payload

            updatesPayLoad = [];

            // alwats update the moved task
            updatesPayLoad.push({
                $id: updateMovedTask.$id,
                status: destStatus,
                position: Math.min((destination.index + 1) * 1000, 1_000_000)
            });

            // Updates the positon for affected tasks in the destination column
            newTask[destStatus].forEach((task, index) => {
                if (task && task.$id !== updateMovedTask.$id) {
                    const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                    if (task.position !== newPosition) {
                        updatesPayLoad.push({
                            $id: task.$id,
                            status: destStatus,
                            position: newPosition
                        });
                    }
                }
            })


            //  if the task moved between columns , update positions int he soucre columns
            if (sourceStatus !== destStatus) {
                newTask[sourceStatus].forEach((task, index) => {
                    if (task) {
                        const newPosition = Math.min((index + 1) * 1000, 1_000_000);
                        if (task.position !== newPosition) {
                            updatesPayLoad.push({
                                $id: task.$id,
                                status: sourceStatus,
                                position: newPosition
                            });
                        }
                    }
                })
            }


            return newTask;
        });
        onChange(updatesPayLoad);
    }, [onChange]);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
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