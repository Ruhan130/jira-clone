import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";

import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Target, MoreVertical, MoreVerticalIcon, User } from "lucide-react";
import { useGetTasks } from "../../tasks/api/use-get-tasks";
import { PageLoader } from "@/components/page-loader";
import { Task, TaskType } from "../../tasks/types";
import { SprintAction } from "./sprint-actions";
import { Sprint } from "../type";
import { SprintKanban } from "./sprint-kaban";

import { useAddTaskToSprint } from "../api/use-bulk-for-kanban";
import { useActiveSprint } from "../api/use-active-sprint";
import { useRouter } from "next/navigation";
import { useTaskId } from "../../tasks/hooks/use-task-id";
import { MemberAvatar } from "../../members/component/member-avatar";


interface ViewActiveSprintProps {
    sprintData: Sprint[];
}

export const ViewActiveSprint = ({ sprintData }: ViewActiveSprintProps) => {

    const workspaceId = UseWorkspaceId();
    const { data: taskdata, isPending: isTaskLoading } = useGetTasks({ workspaceId });
    const addTaskToSprint = useAddTaskToSprint();
    const { mutate, isPending: isActiveSprintPending } = useActiveSprint();
    const router = useRouter();

    if (!sprintData || sprintData.length === 0) {
        return <div>No sprints available</div>;
    }

    if (isTaskLoading) return <PageLoader />

    // ✅ Helper function to get enriched tasks
    const getEnrichedTasks = (sprintTasks: any[], allTasks: Task[]) => {
        return sprintTasks.map(sprintTask => {
            // Find full task data by ID
            const fullTask = allTasks.find(t => t.$id === sprintTask.id);

            if (fullTask) {
                // Return full task data (has assignee info)
                console.log("✅ Found full task data for:", sprintTask.id);
                return fullTask;
            }

            console.log("⚠️ Using sprint task data for:", sprintTask.id);
            // Fallback to sprint task data
            return sprintTask;
        });
    };

    const getTaskStatus = (taskId: string) => {
        const task = taskdata?.documents?.find(t => t.$id === taskId);
        return task?.status || 'BACKLOG';
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatTaskStatus = (status: string) => {
        switch (status as TaskType) {
            case TaskType.BACKLOG:
                return 'Backlog';
            case TaskType.TODO:
                return 'To Do';
            case TaskType.IN_PROGRESS:
                return 'In Progress';
            case TaskType.IN_REVIEW:
                return 'In Review';
            case TaskType.DONE:
                return 'Done';
            default:
                return 'Unknown';
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status as TaskType) {
            case TaskType.BACKLOG:
                return 'secondary';
            case TaskType.TODO:
                return 'outline';
            case TaskType.IN_PROGRESS:
                return 'default';
            case TaskType.IN_REVIEW:
                return 'destructive';
            case TaskType.DONE:
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const handleSprintUpdate = (data: { task: Task; sprintId: string }) => {
        console.log("=== API CALL DEBUG ===");

        const { task: singleTask, sprintId: targetSprintId } = data;

        console.log("Single task:", singleTask);
        console.log("Target Sprint ID:", targetSprintId);

        if (!singleTask || !targetSprintId) {
            console.error("Missing task or sprint ID!");
            return;
        }

        addTaskToSprint.mutate({
            param: {
                workspaceId,
                sprintId: targetSprintId
            },
            json: {
                task: {
                    id: singleTask.$id,
                    name: singleTask.name,
                    description: singleTask.description || null,
                    projectId: singleTask.projectId,
                    assigneeId: singleTask.assigneeId,
                    status: singleTask.status
                }
            }
        });
    };

    return (
        <div className="mb-8">

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-semibold text-gray-900">Sprint View</h2>
                    {sprintData && (
                        <Badge variant="secondary" className="text-sm">
                            {sprintData.length} sprints
                        </Badge>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {sprintData.map((sprint) => {
                    const handleStartThisSprint = () => {
                        console.log(`Starting sprint: ${sprint.$id} (${sprint.name})`);
                        mutate({
                            param: {
                                workspaceId,
                                sprintId: sprint.$id,
                            },
                        });
                    };

                    // ✅ Parse sprint tasks and enrich with full data
                    let sprintTasksRaw: any[] = [];
                    try {
                        sprintTasksRaw = JSON.parse(sprint.tasks || '[]');
                    } catch (error) {
                        console.error("Error parsing tasks:", error);
                    }

                    // ✅ Get enriched tasks with full assignee data
                    const tasks = getEnrichedTasks(sprintTasksRaw, taskdata?.documents || []);

                    console.log("🔍 Sprint tasks raw:", sprintTasksRaw);
                    console.log("✅ Enriched tasks:", tasks);

                    return (
                        <Card key={sprint.$id} className="bg-white shadow-sm">
                            <CardContent className="p-0">
                                {/* Sprint Header */}
                                <div className="p-4 border-b bg-gray-50/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-gray-900">{sprint.name}</h3>
                                            <Badge variant={sprint.status === 'active' ? 'default' : 'secondary'}>
                                                {sprint.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}</span>
                                            </div>

                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={isActiveSprintPending || sprint.isSprintActive}
                                                onClick={handleStartThisSprint}
                                            >
                                                {sprint.isSprintActive
                                                    ? "Sprint Ongoing"
                                                    : isActiveSprintPending
                                                        ? "Starting..."
                                                        : "Start Sprint"}
                                            </Button>

                                            <SprintAction sprintId={sprint.$id}>
                                                <Button variant="ghost" className="size-8 p-0">
                                                    <MoreVerticalIcon className="size-4" />
                                                </Button>
                                            </SprintAction>
                                        </div>
                                    </div>
                                </div>

                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/30">
                                            <TableHead className="font-medium text-gray-700">Task Name</TableHead>
                                            <TableHead className="font-medium text-gray-700">Project</TableHead>
                                            <TableHead className="font-medium text-gray-700">Status</TableHead>
                                            <TableHead className="font-medium text-gray-700">Description</TableHead>
                                            <TableHead className="font-medium text-gray-700">Assignee</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tasks.length > 0 ? (
                                            tasks.map((task: Task, taskIndex: number) => (
                                                <TableRow
                                                    key={`${sprint.$id}-${taskIndex}`}
                                                    onClick={() => router.push(`/workspaces/${workspaceId}/tasks/${task.id || task.$id}`)}
                                                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                                >
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <p className="font-medium text-gray-900">{task.name}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-700 font-mono text-sm">
                                                                {task.projectId}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={getStatusVariant(getTaskStatus(task.id || task.$id))}
                                                            className={`text-xs ${getTaskStatus(task.id || task.$id) === TaskType.TODO
                                                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                                : getTaskStatus(task.id || task.$id) === TaskType.DONE
                                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                                    : ''
                                                                }`}
                                                        >
                                                            {formatTaskStatus(getTaskStatus(task.id || task.$id))}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {task.description && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    {task.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <MemberAvatar
                                                            image={task.assigneeProfileImage ?? ""}
                                                            name={task.assigneeName ?? ""}
                                                            className="size-6"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    <div className="text-gray-500">
                                                        <Users className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                                                        <p className="text-sm">No tasks in this sprint</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/*  Simplified Kanban - No URL dependencies */}
            <div className="mt-5">
                <SprintKanban
                    data={taskdata?.documents || []}
                    onChange={handleSprintUpdate}
                    sprintData={sprintData}
                />
            </div>
        </div>
    );
};