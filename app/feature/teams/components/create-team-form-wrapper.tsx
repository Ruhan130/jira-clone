import { useGetMembers } from "../../members/api/use-get-members";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";
import { CreateTeamForm } from "./create-teams-form";
interface CreateTeamsWrapperProps {
    onCanel: () => void;
}

export const CreateTeamFormWrapper = ({ onCanel }: CreateTeamsWrapperProps) => {
    const workspaceId = UseWorkspaceId();
    const { data: members, isLoading: isLoadingMembers } = useGetMembers({ workspaceId });

    const memberOptions = members?.documents.map((project) => ({
        id: project.$id,
        name: project.name,
    }));

    const isLoading = isLoadingMembers;

    if (isLoading)
        return (
            <Card className="w-full h-[714px] shadow-none border-none">
                <CardContent className="flex  items-center justify-center h-full">
                    <Loader className="size-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        )

    return (
        <CreateTeamForm
            onCancel={onCanel}
            memberOptions={memberOptions ?? []} workspaceId={workspaceId} />
    )
}
