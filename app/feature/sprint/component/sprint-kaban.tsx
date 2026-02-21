import {
    DragDropContext,
    Droppable,
    Draggable,
    type DropResult
} from "@hello-pangea/dnd"
import { Task, } from "../../tasks/types";
import { KanbanCard } from "../../tasks/components/kanban-card";
import { Sprint } from "../type";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Building2 } from "lucide-react";
import { useGetProjects } from "../../projects/api/use-get-projects";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useCallback, useEffect, useState } from "react";

interface SprintKanbanProps {
    data: Task[];
    sprintData?: Sprint[];
    onChange: (data: { task: Task; sprintId: string }) => void;
}

export const SprintKanban = ({
    data,
    sprintData,
    onChange
}: SprintKanbanProps) => {

    const [sprintTasks, setSprintTasks] = useState<any[]>([]);
    const [backlogTasks, setBacklogTasks] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    const workspaceId = UseWorkspaceId();
    const { data: projectData } = useGetProjects({ workspaceId });


    const getSprintIdByProject = (projectId: string): string => {
        const sprint = sprintData?.find(sprint => {
            try {
                const tasks = JSON.parse(sprint.tasks || '[]');
                return tasks.some((task: any) => task.projectId === projectId);
            } catch {
                return false;
            }
        });
        return sprint?.$id || "";
    };

    const getSprintProjectIds = (): string[] => {
        if (!sprintData || sprintData.length === 0) return [];

        const projectIds = new Set<string>();

        sprintData.forEach(sprint => {
            try {
                const tasks = JSON.parse(sprint.tasks || '[]');
                tasks.forEach((task: any) => {
                    if (task.projectId) {
                        projectIds.add(task.projectId);
                    }
                });
            } catch (error) {
                console.error("Error parsing sprint tasks:", error);
            }
        });

        return Array.from(projectIds);
    };


    const getSprintTaskIdsByProject = (projectId: string): string[] => {
        const sprint = sprintData?.find(sprint => {
            try {
                const tasks = JSON.parse(sprint.tasks || '[]');
                return tasks.some((task: any) => task.projectId === projectId);
            } catch {
                return false;
            }
        });

        if (sprint) {
            try {
                const tasks = JSON.parse(sprint.tasks || '[]');
                return tasks
                    .filter((task: any) => task.projectId === projectId)
                    .map((task: any) => task.id);
            } catch {
                return [];
            }
        }
        return [];
    };


    const getAvailableProjects = () => {
        if (!sprintData || !projectData) return [];

        const sprintProjectIds = getSprintProjectIds();
        return projectData?.documents.filter(project =>
            sprintProjectIds.includes(project.$id)
        ) || [];
    };

    const availableProjects = getAvailableProjects();

    useEffect(() => {
        if (!selectedProjectId && availableProjects.length > 0) {
            setSelectedProjectId(availableProjects[0].$id);
        }
    }, [availableProjects, selectedProjectId]);

    useEffect(() => {
        if (!selectedProjectId) return;

        const sprint: Task[] = [];
        const backlog: Task[] = [];
        const projectSprintTaskIds = getSprintTaskIdsByProject(selectedProjectId);

        console.log("Selected Project ID:", selectedProjectId);
        console.log("Project Sprint Task IDs:", projectSprintTaskIds);

        data.forEach((task) => {
            const isSprintTask = projectSprintTaskIds.includes(task.$id);

            if (isSprintTask && task.projectId === selectedProjectId) {

                sprint.push(task);
            } else if (task.projectId === selectedProjectId && task.status === 'BACKLOG') {

                backlog.push(task);
            }
        });

        sprint.sort((a, b) => a.position - b.position);
        backlog.sort((a, b) => a.position - b.position);

        setSprintTasks(sprint);
        setBacklogTasks(backlog);
    }, [data, selectedProjectId, sprintData]);

    const onDragEnd = useCallback((result: DropResult) => {
        if (!result.destination) return;

        const { source, destination } = result;

        if (source.droppableId === "backlog" && destination.droppableId === "sprint") {
            const newBacklogTasks = [...backlogTasks];
            const [movedTask] = newBacklogTasks.splice(source.index, 1);

            const newSprintTasks = [...sprintTasks];
            newSprintTasks.splice(destination.index, 0, movedTask);

            setBacklogTasks(newBacklogTasks);
            setSprintTasks(newSprintTasks);

            if (onChange) {
                const targetSprintId = getSprintIdByProject(movedTask.projectId);
                console.log("Moving task to sprint:", targetSprintId);

                onChange({ task: movedTask, sprintId: targetSprintId });
            }
        }
    }, [backlogTasks, sprintTasks, onChange]);

    return (
        <div>
            {/*  Project Selection Dropdown */}
            <div className="flex items-center justify-center mb-4">
                <Select
                    value={selectedProjectId}
                    onValueChange={setSelectedProjectId}
                >
                    <SelectTrigger className="w-full max-w-md">
                        <Building2 className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableProjects.length > 0 ? (
                            availableProjects.map((project) => (
                                <SelectItem key={project.$id} value={project.$id}>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: project.imageUrl || '#3b82f6' }}
                                        />
                                        {project.name}
                                    </div>
                                </SelectItem>
                            ))
                        ) : (
                            <SelectItem value="" disabled>
                                No projects found in sprints
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>

            {/*  Show selected project info */}
            {selectedProjectId && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Building2 className="w-4 h-4" />
                        <span className="font-medium">
                            Showing tasks for: {availableProjects.find(p => p.$id === selectedProjectId)?.name || selectedProjectId}
                        </span>
                    </div>
                </div>
            )}

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 max-h-[80vh] overflow-y-auto">

                    {/* Sprint Tasks Column */}
                    <div className="flex-1 bg-muted p-3 rounded-md min-w-[300px]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-neutral-700">Sprint Tasks</h3>
                            <div className="bg-neutral-200 text-neutral-600 rounded-full px-2 py-1 text-xs font-medium">
                                {sprintTasks.length}
                            </div>
                        </div>

                        <Droppable droppableId="sprint">
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`max-h-[60vh] overflow-y-auto py-1.5 rounded-md transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-200 border-dashed' : ''
                                        }`}
                                >
                                    {sprintTasks.map((task, index) => (
                                        <Draggable key={task.$id} draggableId={task.$id} index={index} isDragDisabled>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <KanbanCard task={task} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}

                                    {sprintTasks.length === 0 && (
                                        <div className="text-center py-6 text-neutral-500 text-sm">
                                            <div className="mb-2">📋</div>
                                            <div>No sprint tasks for this project</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </div>

                    {/* Backlog Tasks Column */}
                    <div className="flex-1 bg-muted p-3 rounded-md min-w-[300px]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-neutral-700">Backlog Tasks</h3>
                            <div className="bg-neutral-200 text-neutral-600 rounded-full px-2 py-1 text-xs font-medium">
                                {backlogTasks.length}
                            </div>
                        </div>

                        <Droppable droppableId="backlog">
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`max-h-[60vh] overflow-y-auto py-1.5 rounded-md transition-colors ${snapshot.isDraggingOver ? 'bg-orange-50 border-2 border-orange-200 border-dashed' : ''
                                        }`}
                                >
                                    {backlogTasks.map((task, index) => (
                                        <Draggable key={task.$id} draggableId={task.$id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`${snapshot.isDragging ? 'rotate-1 shadow-lg' : ''} transition-transform`}
                                                >
                                                    <KanbanCard task={task} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}

                                    {backlogTasks.length === 0 && (
                                        <div className="text-center py-6 text-neutral-500 text-sm">
                                            <div className="mb-2">📦</div>
                                            <div>No backlog tasks for this project</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Droppable>
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
};