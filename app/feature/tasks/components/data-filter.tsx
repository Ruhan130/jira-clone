import { Select, SelectContent, SelectTrigger, SelectItem, SelectValue }
 from "@/components/ui/select";
import { useGetMember } from "../../members/api/use-get-members";
import { useGetProjects } from "../../projects/api/use-get-projects";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { ListCheckIcon } from "lucide-react";

import { TaskType } from "../types";
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
    }))


    if (isLoading) return null;
    return (
        <div className="flex flex-col lg:flex-row gap-2">
            <Select defaultValue={undefined} onValueChange={() => { }}  >
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
        </div>
    )

}