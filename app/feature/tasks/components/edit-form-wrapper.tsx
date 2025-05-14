import { Card, CardContent } from "@/components/ui/card";
import {  useGetMembers } from "../../members/api/use-get-members";
import { useGetProjects } from "../../projects/api/use-get-projects";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { CreateTaskForm } from "./create-task-form";

import { useGetTask } from "../api/use-get-task";
import { EditTaskForm } from "./edit-task-form";

interface EditWrapperProps {
    onCanel: () => void;
    id: string,
}

export const EditTaskFormWRapper = ({ onCanel, id }: EditWrapperProps) => {
    const workspaceId = UseWorkspaceId();

    const { data: initialValues, isLoading: isLoadingTask } = useGetTask({ taskId: id });
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });
    const { data: projects, isLoading: isLoadingProjects } = useGetProjects({ workspaceId });


    const projectOptions = projects?.documents.map((projects) => ({
        id: projects.$id,
        name: projects.name,
        imageUrl: projects.imageUrl,
    }));

    const memberOptions = members?.documents.map((project) => ({
        id: project.$id,
        name: project.name,
    }));

    const isLoading = isLoadingProjects || isLoadingMembers || isLoadingTask;

    if (isLoading)
        return (
            <Card className="w-full h-[714px] shadow-none border-none">
                <CardContent className="flex  items-center justify-center h-full">
                    <Loader className="size-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )

    if (!initialValues) {
        return null;
    }

    return (
        <EditTaskForm
            onCancel={onCanel}
            projectOptions={projectOptions ?? []}
            memberOptions={memberOptions ?? []}
            initialValues={initialValues}
        />
    )

} 