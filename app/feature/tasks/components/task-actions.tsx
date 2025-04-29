import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { ExternalLink, ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
interface TaskActionProps {
    id: string;
    projectId: string;
    children: React.ReactNode;
}

export const TaskActions = ({ id, projectId, children }: TaskActionProps) => {
    return (
        <div className="flex justify-end">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        onClick={() => { }}
                        disabled={false}
                        className="font-medium p-[10px] "
                    >
                        <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
                        Task Details
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        disabled={false}
                        onClick={() => { }}
                        className="font-medium p-[10px] ">
                        <ExternalLink className="size-4 mr-2 stroke-2" />
                        Open Project
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        disabled={false}
                        onClick={() => { }}
                        className="font-medium p-[10px] ">
                        <PencilIcon className="size-4 mr-2 stroke-2" />
                        Edit Task
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        disabled={false}
                        onClick={() => { }}
                        className="font-medium text-amber-700 focus:text-amber-500  p-[10px] ">
                        <TrashIcon className="size-4 mr-2 stroke-2" />
                        Delete task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}