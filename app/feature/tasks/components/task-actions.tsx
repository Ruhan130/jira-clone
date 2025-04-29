import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { ExternalLink } from "lucide-react";
interface TaskActionProps {
    id: string;
    projectId: string;
    children: React.ReactNode;
}

export const TaskActions = ({ id, projectId, children }: TaskActionProps) => {
    return (
        <div className="">
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                        disabled={false}
                        onClick={() => { }}
                        className="font-medium p-[10px] ">
                        <ExternalLink className="size-4 mr-2 stroke-2" />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}