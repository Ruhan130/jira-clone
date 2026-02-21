// "use client"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Plus, Calendar, User } from "lucide-react";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useGetSubtasks } from "../api/use-get-subtask";
import { useRouter } from "next/navigation";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useProjectId } from "../../projects/hooks/use-project-id";
import { useUpdateSubtaskStatus } from "../api/use-update-subtask-status";
import { PriorityType, TaskType } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { DatePicker } from "@/components/date-picker";
import TiptapEditor from "./tiptap-editor";
import { CommentSection } from "./comment-section";
import { toast } from "sonner";

interface SubtasksSectionProps {
    task: any;
}

interface SubtaskCardProps {
    subtask: any;
}

const SubtaskCard = ({ subtask }: SubtaskCardProps) => {
    const isCompleted = subtask.status === "COMPLETED";
    const { mutate: updateSubtask } = useUpdateSubtaskStatus();
    const [isEditing, setIsEditing] = useState(false);
    const [open, setOpen] = useState(false);
    const [editValue, setEditValue] = useState(subtask.name);
    const [error, setError] = useState("");


    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "HIGH": return "bg-red-100 text-red-800 border-red-200";
            case "MEDIUM": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "LOW": return "bg-green-100 text-green-800 border-green-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getLabelColor = (label: string) => {
        switch (label) {
            case "BUG": return "bg-red-50 text-red-700 border-red-200";
            case "FEATURE": return "bg-blue-50 text-blue-700 border-blue-200";
            case "IMPROVEMENT": return "bg-purple-50 text-purple-700 border-purple-200";
            default: return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const handleStatusChange = (newStatus: string) => {
        updateSubtask({
            json: { status: newStatus as TaskType },
            param: {
                workspaceId: subtask.workspaceId,
                taskId: subtask.parentTaskId,
                subtaskId: subtask.$id
            }
        });
    };

    const handlePriorityChange = (newPriority: string) => {
        updateSubtask({
            json: { priority: newPriority as PriorityType },
            param: {
                workspaceId: subtask.workspaceId,
                taskId: subtask.parentTaskId,
                subtaskId: subtask.$id
            }
        });
    };

    const handleTitleClick = () => {
        setIsEditing(true);
        setEditValue(subtask.name);
    };

    const handleTitleSave = () => {
        const trimmedValue = editValue.trim();
        if (!trimmedValue) {
            toast.error("Title cannot be empty");
            setEditValue(subtask.name);
            return;
        }
        setError("");

        if (editValue.trim() !== subtask.name) {
            updateSubtask({
                json: { name: editValue.trim() },
                param: {
                    workspaceId: subtask.workspaceId,
                    taskId: subtask.parentTaskId,
                    subtaskId: subtask.$id
                }
            });
        }
        setIsEditing(false);
    };

    const handleTitleCancel = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setEditValue(subtask.name);
            setError("");
            setIsEditing(false);
        } else if (e.key === 'Enter') {
            handleTitleSave();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
        if (error) setError("");
    };


    const handleDateSave = (newDate: any) => {
        if (newDate && newDate !== subtask.dueDate) {
            updateSubtask({
                json: { dueDate: newDate },
                param: {
                    workspaceId: subtask.workspaceId,
                    taskId: subtask.parentTaskId,
                    subtaskId: subtask.$id,
                },
            });
        }

        setOpen(false);
    };

    return (
        <Card className={cn(
            "transition-all duration-200 hover:shadow-md",
            isCompleted && "opacity-60"
        )}>
            <CardContent className="p-4">
                <div className="flex items-start gap-3">


                    <div className="flex-1 space-y-2">
                        {/* Title - Editable */}
                        <div className="flex items-center justify-between">
                            {isEditing ? (
                                <div className="w-full">
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={handleInputChange}
                                        onBlur={handleTitleSave}
                                        onKeyDown={handleTitleCancel}
                                        className={cn(
                                            "font-medium text-lg bg-transparent border-none outline-none rounded px-1 py-0.5 w-full",
                                            error && "border border-red-500"
                                        )}
                                        autoFocus
                                    />
                                    {error && (
                                        <p className="text-red-500 text-xs mt-1 px-1">
                                            {error}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <h4
                                    className={cn(
                                        "font-medium text-lg cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 transition-colors",
                                        isCompleted && "line-through text-gray-500"
                                    )}
                                    onClick={handleTitleClick}
                                >
                                    {subtask.name}
                                </h4>
                            )}
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                            </Button>
                        </div>

                        <TiptapEditor
                            value={subtask.description || ""}
                            onChange={(updatedDescription) => {
                                console.log("Description updating:", updatedDescription);
                                updateSubtask({
                                    json: { description: updatedDescription },
                                    param: {
                                        workspaceId: subtask.workspaceId,
                                        taskId: subtask.parentTaskId,
                                        subtaskId: subtask.$id
                                    }
                                });
                            }}
                            attachments={subtask.attachments ? JSON.parse(subtask.attachments) : []}
                            onAttachmentsChange={(attachments) => {
                                updateSubtask({
                                    json: { attachments },
                                    param: {
                                        workspaceId: subtask.workspaceId,
                                        taskId: subtask.parentTaskId,
                                        subtaskId: subtask.$id
                                    }
                                });
                            }}
                        />
                        <div>
                            <CommentSection subtaskId={subtask.$id} />
                        </div>


                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Assignee */}
                            {subtask.assigneeName && (
                                <div className="flex items-center gap-1">
                                    <Avatar className="h-4 w-4">
                                        <AvatarImage src={subtask.assigneeProfileImage} />
                                        <AvatarFallback className="text-xs">
                                            {subtask.assigneeName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-gray-600">
                                        {subtask.assigneeName}
                                    </span>
                                </div>
                            )}
                            {/* Due Date  */}
                            {subtask.dueDate && (
                                <div className="flex items-center gap-1">
                                    <DatePicker
                                        value={subtask.dueDate}
                                        onChange={(date) => handleDateSave(date)}

                                        className="text-xs border-none bg-transparent hover:bg-gray-50 rounded px-1 py-0.5 transition-colors"
                                        placeholder="Select date"
                                    />
                                </div>
                            )}
                            {/* Status Dropdown */}
                            <Select value={subtask.status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="h-6 w-auto text-xs border-none p-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={TaskType.TODO}>
                                        <Badge variant="outline" className="text-xs">
                                            TODO
                                        </Badge>
                                    </SelectItem>
                                    <SelectItem value={TaskType.IN_PROGRESS}>
                                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                            IN PROGRESS
                                        </Badge>
                                    </SelectItem>
                                    <SelectItem value={TaskType.DONE}>
                                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                            DONE
                                        </Badge>
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Priority Dropdown - UPDATED */}
                            {subtask.priority && (
                                <Select value={subtask.priority} onValueChange={handlePriorityChange}>
                                    <SelectTrigger className="h-6 w-auto text-xs border-none p-1">
                                        <Badge variant="outline" className={cn(
                                            "text-xs px-1.5 py-0.5 h-5 cursor-pointer",
                                            getPriorityColor(subtask.priority)
                                        )}>
                                            {subtask.priority}
                                        </Badge>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={PriorityType.HIGH}>
                                            <Badge variant="outline" className="text-xs bg-red-100 text-red-800">
                                                HIGH
                                            </Badge>
                                        </SelectItem>
                                        <SelectItem value={PriorityType.MEDIUM}>
                                            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                                                MEDIUM
                                            </Badge>
                                        </SelectItem>
                                        <SelectItem value={PriorityType.LOW}>
                                            <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                                                LOW
                                            </Badge>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}


                            {subtask.label && (
                                <Badge variant="outline" className={cn(
                                    "text-xs px-1.5 py-0.5 h-5",
                                    getLabelColor(subtask.label)
                                )}>
                                    {subtask.label}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};


const SubtasksProgress = ({ completed, total }: { completed: number; total: number }) => {
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{completed}/{total} ({percentage}%)</span>
            </div>
            <Progress value={percentage} className="h-2" />
        </div>
    );
};


export const SubtasksSection = ({ task }: SubtasksSectionProps) => {
    const { data: subtasks, isLoading } = useGetSubtasks(task.workspaceId, task.$id);
    const router = useRouter();
    const projectId = useProjectId();
    const workpsaceId = UseWorkspaceId();

    const completedSubtasks = subtasks?.filter(subtask => subtask.status === "COMPLETED") || [];
    const totalSubtasks = subtasks?.length || 0;
    const handleNavigate = () => {
        router.push(`/workspaces/${workpsaceId}/projects/${task.projectId}/tasks/${task.$id}/sub-task`);
    }
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="font-semibold text-lg">Subtasks</h3>
                        <p className="text-sm text-gray-600">
                            {totalSubtasks} {totalSubtasks === 1 ? 'subtask' : 'subtasks'}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handleNavigate()}>
                        <Plus className="h-4 w-4" />
                        Add Subtask
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Progress Bar */}
                {/* {totalSubtasks > 0 && (
                    <SubtasksProgress
                        completed={completedSubtasks.length}
                        total={totalSubtasks}
                    />
                )} */}

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-16 bg-gray-100 rounded-lg"></div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Subtasks List */}
                {!isLoading && subtasks && subtasks.length > 0 ? (
                    <div className="space-y-3">
                        {subtasks.map((subtask) => (
                            <SubtaskCard key={subtask.$id} subtask={subtask} />
                        ))}
                    </div>
                ) : !isLoading && (

                    <div className="text-center py-8">
                        <div className="space-y-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                <Plus className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-medium text-gray-900">No subtasks yet</p>
                                <p className="text-sm text-gray-600">
                                    Break down this task into smaller subtasks
                                </p>
                            </div>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create first subtask
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};