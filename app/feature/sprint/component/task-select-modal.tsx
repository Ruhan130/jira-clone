import { Button } from "@/components/ui/button";
import { Task } from "../../tasks/types";
import { useGetTasks } from "../../tasks/api/use-get-tasks";
import { useState } from "react";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";

interface TaskSelectModalProps {
    onSelect: (tasks: Task[]) => void;
}

export const TaskSelectModal = ({ onSelect }: TaskSelectModalProps) => {
    const workspaceId = UseWorkspaceId();
    const { data: taskData, isPending: isLoading } = useGetTasks({ workspaceId });
    const backlogTasks = taskData?.documents?.filter(task => task.status === 'BACKLOG') || [];
    const [selected, setSelected] = useState<string[]>([]);

    const handleToggle = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        const selectedTasks = backlogTasks.filter((task: Task) => selected.includes(task.$id));
        onSelect(selectedTasks);
    };

    if (isLoading) return <div className="p-4">Loading...</div>;

    return (
        <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">Select Tasks</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {backlogTasks.map((task: Task) => (
                    <div
                        key={task.$id}
                        className={`p-2 border rounded cursor-pointer ${selected.includes(task.$id) ? "bg-gray-100" : ""
                            }`}
                        onClick={() => handleToggle(task.$id)}
                    >
                        <p className="font-medium">{task.name}</p>
                        <p className="text-sm text-gray-500">{task.description}</p>
                    </div>
                ))}
            </div>
            <Button onClick={handleConfirm}>Confirm Selection</Button>
        </div>
    );
};
