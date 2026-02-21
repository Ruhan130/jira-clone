import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { useConform } from "@/hooks/use-confirm";
import { ExternalLink, ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useDeleteSprint } from "../api/use-delete-sprint";
interface SprintActionProps {
    sprintId: string,
    children: React.ReactNode;
}
export const SprintAction = ({ sprintId, children }: SprintActionProps) => {

    const router = useRouter();
    const workspaceId = UseWorkspaceId();
    const [ConformDialogue, confirm] = useConform(
        "Delete task",
        "This action can not be undone",
        "destructive"
    );

    const OpenEditSprint = () => {
        router.push(`/workspaces/${workspaceId}/edit-sprint/${sprintId}`)
    }

    const { mutate, isPending } = useDeleteSprint();
    const onDelete = async () => {
        const ok = await confirm();
        if (!ok) return;

        mutate({
            param: { workspaceId: workspaceId, sprintId: sprintId }
        }, {
            onSuccess: () => { router.refresh(); }
        }
        );
    }

    return (
        <div className="flex justify-end">
            <ConformDialogue />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        onClick={OpenEditSprint}

                        className="font-medium p-[10px] "
                    >
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Edit Sprint
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={onDelete}
                        disabled={isPending}
                        className="font-medium p-[10px] ">
                        <ExternalLink className="size-4 mr-2 stroke-2" />
                        Delete Sprint
                    </DropdownMenuItem>

                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}