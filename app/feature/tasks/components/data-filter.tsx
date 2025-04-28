import { Select, SelectContent, SelectTrigger, SelectItem, SelectValue, SelectSeparator }
    from "@/components/ui/select";
import { useGetMember } from "../../members/api/use-get-members";
import { useGetProjects } from "../../projects/api/use-get-projects";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { FolderIcon, ListCheckIcon, UserIcon } from "lucide-react";

import { TaskType } from "../types";
import { useTaskFilter } from "../hooks/use-task-filters";
// import { useGetTasks } from "../api/use-get-tasks";

interface DataFilterProps {
    hideProjectFilter?: boolean;
}


export const DataFilter = ({ hideProjectFilter }: DataFilterProps) => {
    const workspaceId = UseWorkspaceId();
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });
    const { data: members, isLoading: isLoadingMembers } = useGetMember({ workspaceId });


    const isLoading = isLoadingProjects || isLoadingMembers;

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
        search }, setFilters] = useTaskFilter();

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

            {/* THIS IS FOR ASSIGNEE/MEMBER */}

            <Select defaultValue={assigneeId ?? undefined} onValueChange={(value) => onAssigneeChange(value)}  >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <UserIcon className="size-8 pr-2" />
                    <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>

                    <SelectItem value="all" >All assignees</SelectItem>
                    <SelectSeparator />
                    {
                        optionsMember?.map(((member) => (
                            <SelectItem key={member.value} value={member.value}>
                                {member.label}
                            </SelectItem>
                        )))
                    }

                </SelectContent>
            </Select>


            {/* THIS IS FOR PROJECT */}
            <Select defaultValue={projectId ?? undefined} onValueChange={(value) => onProjectChange(value)}  >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <FolderIcon className="size-8 pr-2" />
                    <SelectValue placeholder="All Statuses" />
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
        </div>
    )

}