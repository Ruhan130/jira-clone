import { Select, SelectContent, SelectTrigger, SelectItem, SelectValue, SelectSeparator }
    from "@/components/ui/select";
import { useGetMembers } from "../../members/api/use-get-members";
import { useGetProjects } from "../../projects/api/use-get-projects";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { FolderIcon, ListCheckIcon, UserIcon } from "lucide-react";

import { TaskType } from "../types";
import { useTaskFilter } from "../hooks/use-task-filters";
import { DatePicker } from "@/components/date-picker";
import { UseGetSprints } from "../../sprint/api/use-get-sprints";

interface MyTaskDataFilterProps {
    hideProjectFilter?: boolean;
}


export const MyTaskDataFilter = ({ hideProjectFilter }: MyTaskDataFilterProps) => {
    const workspaceId = UseWorkspaceId();
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

    const { data: sprint, isLoading: isLoadingSprint } = UseGetSprints({ workspaceId });
    const sprintOptions = sprint?.documents?.map((sprintItem) => ({
        value: sprintItem.$id,
        label: sprintItem.name
    })) || [];
    const onSprintChange = (value: string) => {
        console.log("Sprint changed to:", value);
        setFilters({ sprintId: value === "all" ? null : value as string });
    };
    const isLoading = isLoadingProjects || isLoadingMembers || isLoadingSprint;

    const optionsMember = members?.documents.map((member) => ({
        label: member.name,
        value: member.$id,
    }));

    const optionProjects = projects?.documents.map((projects) => ({
        label: projects.name,
        value: projects.$id,
    }));

    const [{
        projectId,
        status,
        assigneeId,
        dueDate,
        sprintId
    }, setFilters] = useTaskFilter();

    const onStatusChange = (value: string) => {
        setFilters({ status: value === "all" ? null : value as TaskType });
    };

    const onProjectChange = (value: string) => {
        setFilters({ projectId: value === "all" ? null : value as string });
    }

    const onAssigneeChange = (value: string) => {
        setFilters({ assigneeId: value === "all" ? null : value as string });
    };


    if (isLoading) return null;
    return (
        <div className="flex flex-col lg:flex-row gap-2">
            <Select defaultValue={status ?? undefined} onValueChange={(value) => onStatusChange(value)}  >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <ListCheckIcon className="size-8 pr-2" />
                    <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">
                        All Status
                    </SelectItem>
                    <SelectItem value={TaskType.BACKLOG}>
                        BACKLOG
                    </SelectItem>
                    <SelectItem value={TaskType.IN_PROGRESS}>
                        IN_PROGRESS
                    </SelectItem>
                    <SelectItem value={TaskType.IN_REVIEW}>
                        IN_REVIEW
                    </SelectItem>
                    <SelectItem value={TaskType.TODO}>
                        TODO
                    </SelectItem>
                    <SelectItem value={TaskType.DONE}>
                        DONE
                    </SelectItem>
                </SelectContent>
            </Select>


            {/* THIS IS FOR PROJECT */}
            {!hideProjectFilter && (
                < Select defaultValue={projectId ?? undefined} onValueChange={(value) => onProjectChange(value)}  >
                    <SelectTrigger className="w-full lg:w-auto h-8">
                        <FolderIcon className="size-8 pr-2" />
                        <SelectValue placeholder="All Projects" />
                    </SelectTrigger>
                    <SelectContent>

                        <SelectItem value="all" >All Projects</SelectItem>
                        <SelectSeparator />
                        {
                            optionProjects?.map(((project) => (
                                <SelectItem key={project.value} value={project.value}>
                                    {project.label}
                                </SelectItem>
                            )))
                        }

                    </SelectContent>
                </Select>
            )}
            <DatePicker
                placeholder="Due Date"
                className="w-full lg:w-auto h-8"
                value={dueDate ? new Date(dueDate) : undefined}
                onChange={(date) => {
                    setFilters({ dueDate: date ? date.toISOString() : null })
                }}
            />


            <Select
                defaultValue={sprintId ?? undefined}
                onValueChange={(value) => onSprintChange(value)}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <FolderIcon className="size-8 pr-2" />
                    <SelectValue placeholder="Sprint" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Sprints</SelectItem>
                    <SelectSeparator />
                    {sprintOptions?.map((sprint) => (
                        <SelectItem key={sprint.value} value={sprint.value}>
                            {sprint.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div >
    )

}