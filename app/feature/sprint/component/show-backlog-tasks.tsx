"use client"
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Trash, UserIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Task } from "../../tasks/types";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { BacklogViewDataFilter } from "./backlog-view-data-filter";
import { toast } from "sonner";
import { useGetProjects } from "../../projects/api/use-get-projects";
import { UseGetSprints } from "../api/use-get-sprints";
import { MemberAvatar } from "../../members/component/member-avatar";
import { useConform } from "@/hooks/use-confirm";
import { useDeletTask } from "../../tasks/api/use-delete-task";



interface BacklogTasksProps {
    taskData: {
        documents: Task[];
    } | undefined;
}


export const ShowBacklogTask = ({ taskData }: BacklogTasksProps) => {
    const router = useRouter();
    const workspaceId = UseWorkspaceId();
    const { data: existingSprints } = UseGetSprints({ workspaceId });
    const { data: projectData } = useGetProjects({ workspaceId });
    const [ConformDialogue, confirm] = useConform(
        "Delete task",
        "This action can not be undone",
        "destructive"
    );

    const { mutate } = useDeletTask();
    const onDelete = async (taskId: string) => {
        const ok = await confirm();
        if (!ok) return;
        mutate({
            param: { taskId }
        }, {
            onSuccess: () => {
                setSelectedTasks(prev =>
                    prev.filter((task) => task.$id !== taskId)
                );
            },
        }
        )

    }

    const [appliedFilters, setAppliedFilters] = useState<{
        teamId: string | null;
        projectId: string | null;
    }>({
        teamId: null,
        projectId: null
    });

    const [isFilterApplied, setIsFilterApplied] = useState(false);

    const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);
    const backlogTasks = useMemo(() => {
        return taskData?.documents?.filter(task => {
            return (
                task.status === 'BACKLOG' &&
                task.projectId === appliedFilters.projectId &&
                !task.sprintId
            );
        }) || [];
    }, [taskData?.documents, appliedFilters]);



    // Handle filter application from child component
    const handleApplyFilters = (teamId: string | null, projectId: string | null) => {
        setSelectedTasks([]);

        if (teamId && projectId) {
            setAppliedFilters({ teamId, projectId });
            setIsFilterApplied(true);
        } else {
            setAppliedFilters({ teamId: null, projectId: null });
            setIsFilterApplied(false);
        }
    };



    const project = projectData?.documents?.find(p => p.$id === appliedFilters.projectId);
    console.log("Current Project ID:", project?.$id);
    const handleCreateSprint = () => {
        if (!workspaceId || !project) return;

        const projectHasSprint = existingSprints?.documents?.some((sprint) => {
            try {
                const tasks = JSON.parse(sprint.tasks);
                return tasks.some((task: any) => task.projectId === project.$id);
            } catch (err) {
                console.error("Failed to parse sprint.tasks", err);
                return false;
            }
        });

        if (projectHasSprint) {
            toast.error("This project already has a sprint.");
            return;
        }

        localStorage.setItem("selectedTasks", JSON.stringify(selectedTasks));
        router.push(`/workspaces/${workspaceId}/create-sprint`);
    };


    const handleTaskSelect = (task: Task) => {
        setSelectedTasks(prev => {
            const isAlreadySelected = prev.find(t => t.$id === task.$id);
            if (isAlreadySelected) {
                const updated = prev.filter(t => t.$id !== task.$id);
                return updated;
            } else {
                const updated = [...prev, task];
                return updated;
            }
        });
    };

    const isTaskSelected = (taskId: string) => {
        return selectedTasks.some(t => t.$id === taskId);
    };


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <ConformDialogue />
            {/* Backlog Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold text-gray-900">Backlog</h1>
                    <BacklogViewDataFilter onApplyFilters={handleApplyFilters} />

                    {/* Show selected count */}
                    {selectedTasks.length > 0 && (
                        <Badge variant="secondary" className="text-sm">
                            {selectedTasks.length} selected
                        </Badge>
                    )}
                </div>

                <div className="flex justify-between">
                    <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={selectedTasks.length === 0}
                        onClick={() => handleCreateSprint()}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Next
                    </Button>

                    {/* <div className="flex items-center gap-2 ml-5 rounded">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit issue</DropdownMenuItem>
                                <DropdownMenuItem>Move to sprint</DropdownMenuItem>
                                <DropdownMenuItem>Delete issue</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div> */}
                </div>
            </div>

            {/* Backlog Tasks Container */}
            {isFilterApplied && (
                <Card className="bg-white shadow-sm">
                    <CardContent className="p-0">
                        {backlogTasks.length > 0 ? (
                            <div className="divide-y divide-gray-200">
                                {backlogTasks.map((task, index) => (
                                    <div
                                        key={task.$id}
                                        className={`flex items-center justify-between p-4 transition-colors group cursor-pointer border-l-4 ${isTaskSelected(task.$id)
                                            ? 'bg-blue-50 hover:bg-blue-100 border-l-blue-500'
                                            : 'hover:bg-gray-50 border-l-transparent'
                                            }`}
                                        onClick={() => handleTaskSelect(task)}
                                    >
                                        {/* Task Content */}
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Selection Checkbox */}
                                            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${isTaskSelected(task.$id)
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'border-gray-300 hover:border-blue-400'
                                                }`}>
                                                {isTaskSelected(task.$id) && (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>

                                                )}
                                            </div>

                                            {/* Task Icon */}
                                            <div className="items-center flex px-1 py-1 bg-green-500 rounded-full">
                                                <UserIcon className="text-white h-4 w-4" />
                                            </div>

                                            {/* Task Details */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <span className={`font-medium transition-colors ${isTaskSelected(task.$id) ? 'text-blue-700' : 'text-gray-900 hover:text-blue-600'
                                                        }`}>
                                                        {task.name}
                                                    </span>
                                                </div>
                                                {task.description && (
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                {task.assignee && (
                                                    <span className="font-mono">
                                                        {task.$id}
                                                    </span>
                                                )}
                                                <Button variant="ghost" size="icon" className="text-orange-500" onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(task.$id);
                                                }}>
                                                    <svg
                                                        className="w-4 h-4"
                                                        viewBox="0 0 24 24"
                                                        fill="currentColor"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path d="M12 2L2 7v10c0 5.55 3.84 9.739 9 11 5.16-1.261 9-5.45 9-11V7l-10-5z" />
                                                    </svg>
                                                </Button>
                                                {task.assignee && (
                                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                        <MemberAvatar name={task.assignee.name} image={task.assigneeProfileImage} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Selection indicator */}
                                        {isTaskSelected(task.$id) && (
                                            <div className="ml-2 text-blue-500 font-medium text-xs">
                                                Selected
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Plus className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No BACKLOG tasks found</h3>
                                <p className="text-sm text-gray-500">Create your first backlog task to get started</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};