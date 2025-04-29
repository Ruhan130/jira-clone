import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { useConform } from "@/hooks/use-confirm";
import { ExternalLink, ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useDeletTask } from "../api/use-delete-task";
interface TaskActionProps {
    id: string;
    projectId: string;
    children: React.ReactNode;
}

export const TaskActions = ({ id, projectId, children }: TaskActionProps) => {

    const [ConformDialogue, confirm] = useConform(
        "Delete task",
        "This action can not be undone",
        "destructive"
    )

    const { mutate, isPending } = useDeletTask();
    const onDelete = async () => {
        const ok = await confirm();
        if (!ok) return;

        mutate({
            param: { taskId: id }
        });
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
                        onClick={() => { }}

                        className="font-medium p-[10px] "
                    >
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Task Details
                    </DropdownMenuItem>

                    <DropdownMenuItem

                        onClick={() => { }}
                        className="font-medium p-[10px] ">
                        <ExternalLink className="size-4 mr-2 stroke-2" />
                        Open Project
                    </DropdownMenuItem>

                    <DropdownMenuItem

                        onClick={() => { }}
                        className="font-medium p-[10px] ">
                        <PencilIcon className="size-4 mr-2 stroke-2" />
                        Edit Task
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={onDelete}
                        disabled={isPending}
                        className="font-medium text-amber-700 focus:text-amber-500  p-[10px] ">
                        <TrashIcon className="size-4 mr-2 stroke-2" />
                        Delete task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}