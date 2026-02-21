"use client";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader, PlusIcon } from "lucide-react"
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useGetTasks } from "../api/use-get-tasks";
import { useQueryState } from "nuqs";
import { DataFilter } from "./data-filter";
import { useTaskFilter } from "../hooks/use-task-filters";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DataKanban } from "./data-kanban";
import { useCallback, useMemo } from "react";
import { TaskType } from "../types";
import { useBulkUpdateTask } from "../api/use-bulk-update-task";
import { DataCalendar } from "./data-calendar";
import { useProjectId } from "../../projects/hooks/use-project-id";
import { UseGetSprints } from "../../sprint/api/use-get-sprints";
import { useRouter } from "next/navigation";
import { MyTaskDataFilter } from "./my-task-data-filter";
import { useCurrent } from "../../auth/api/use-current";
import { useGetMembers } from "../../members/api/use-get-members";

interface MyTaskViewSwitcherProps {
    hideProjectFilter?: boolean;
}

export const MyTaskViewSwitcher = ({ hideProjectFilter }: MyTaskViewSwitcherProps) => {
    const { data: user } = useCurrent();
    const workspaceId = UseWorkspaceId();
    const { data: membersData } = useGetMembers({ workspaceId });

    const currentMember = membersData?.documents?.find(
        member => member.userId === user?.$id
    )
    const [view, setView] = useQueryState("task-view", {
        defaultValue: "table"
    });

    const [{
        projectId,
        status,
        assigneeId,
        dueDate,
        sprintId
    }] = useTaskFilter();

    const {
        data: tasks,
        isLoading: isLoadingTasks } = useGetTasks({
            workspaceId,
            projectId,
            status,
            assigneeId: currentMember?.$id,
            dueDate,

        });

    console.log("👤 User ID:", user?.$id);
    console.log("👥 Current Member:", currentMember);
    console.log("🆔 Member ID:", currentMember?.$id);

    const { data: sprint } = UseGetSprints({ workspaceId });

    const router = useRouter();
    const { mutate: bulkUpdate } = useBulkUpdateTask();
    const handleAddProject = () => {
        router.push(`/workspaces/${workspaceId}/create-task`);
    };

    const onKanbanChange = useCallback((
        tasks: { $id: string; status: TaskType; position: number }[]
    ) => {
        bulkUpdate({
            json: { tasks }
        });

    }, [bulkUpdate]);


    const filteredTasks = useMemo(() => {
        if (!tasks?.documents) return [];

        let filtered = tasks.documents;

        // Sprint filtering
        if (sprintId && sprintId !== "all") {
            // Selected sprint find karo
            const selectedSprint = sprint?.documents?.find(s => s.$id === sprintId);

            if (selectedSprint && selectedSprint.tasks) {
                try {
                    // JSON string ko parse karo
                    const sprintTasks = JSON.parse(selectedSprint.tasks);
                    console.log("Sprint tasks:", sprintTasks);

                    // Sprint mein jo task IDs hain, unko extract karo
                    const sprintTaskIds = sprintTasks.map((task: any) => task.id);
                    console.log("Sprint task IDs:", sprintTaskIds);

                    // Tasks ko filter karo jin ki ID sprint mein hai
                    filtered = filtered.filter(task =>
                        sprintTaskIds.includes(task.$id)
                    );

                } catch (error) {
                    console.error("Error parsing sprint tasks:", error);
                    filtered = [];
                }
            } else {
                filtered = [];
            }
        }

        console.log("Total tasks:", tasks.documents.length);
        console.log("Filtered tasks:", filtered.length);
        console.log("Selected Sprint ID:", sprintId);

        return filtered;
    }, [tasks?.documents, sprintId, sprint?.documents]);

    return (
        <Tabs defaultValue={view} onValueChange={setView} className="flex-1 w-full border rounded-lg">
            <div className="h-full flex flex-col overflow-auto p-4">
                <div className="flex flex-col gap-y-2 lg:flex-row  justify-between items-center">
                    <TabsList className="w-full lg:w-auto">
                        <TabsTrigger value="table" className="h-8 w-full lg:w-auto">
                            Table
                        </TabsTrigger>
                        <TabsTrigger value="kanban" className="h-8 w-full lg:w-auto">
                            Kanban
                        </TabsTrigger>
                        <TabsTrigger value="calender" className="h-8 w-full lg:w-auto">
                            Calender
                        </TabsTrigger>
                    </TabsList>
                    {<Button
                        onClick={handleAddProject}
                        className="w-full lg:w-auto"
                        size="sm">
                        <PlusIcon className="size-4 mr-2" />
                        New Task
                    </Button>}
                </div>
                <DottedSeperator className="my-4" />

                <MyTaskDataFilter hideProjectFilter={!hideProjectFilter} />

                <DottedSeperator className="my-4" />
                {isLoadingTasks ? (
                    <div className="w-full flex flex-col border rounded-lg items-center justify-center h-[200px]">
                        <Loader className="size-5 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <>
                        <TabsContent value="table" className="mt-0">
                            {/* filteredTasks use karo */}
                            <DataTable columns={columns} data={filteredTasks} />
                        </TabsContent>
                        <TabsContent value="kanban" className="mt-0">
                            {/* filteredTasks use karo */}
                            <DataKanban onChange={onKanbanChange} data={filteredTasks} />
                        </TabsContent>
                        <TabsContent value="calender" className="mt-0">
                            {/* filteredTasks use karo */}
                            <DataCalendar data={filteredTasks} />
                        </TabsContent>
                    </>
                )}
            </div>
        </Tabs >
    )
}