import { Card, CardContent } from "@/components/ui/card";
import { useGetMember } from "../../members/api/use-get-members";
import { useGetProjects } from "../../projects/api/use-get-projects";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";
import { CreateTaskForm } from "./create-task-form";

interface CreateTaskWrapperProps {
    onCanel: () => void;
}

export const CreateTaskFormWRapper = ({ onCanel }: CreateTaskWrapperProps) => {
    const workspaceId = UseWorkspaceId();
    const { data: members, isLoading: isLoadingMembers } = useGetMember({ workspaceId });
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

    const isLoading = isLoadingProjects || isLoadingMembers;

    if (isLoading)
        return (
            <Card className="w-full h-[714px] shadow-none border-none">
                <CardContent className="flex  items-center justify-center h-full">
                    <Loader className="size-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )

    return (
        <CreateTaskForm onCancel={onCanel} projectOptions={projectOptions ?? []} memberOptions={memberOptions ?? []} />
    )

} 