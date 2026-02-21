import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Task } from '../../tasks/types';
import { Member } from '../../members/type';


interface MemberTaskFilterProps {
    selectedTasks: Task[];
    setSelectedTasks: (tasks: Task[]) => void;
    form: any;
    members?: Member[];
}

export const MemberTaskFilter = ({ selectedTasks, form, members }: MemberTaskFilterProps) => {
    const [selectedMemberId, setSelectedMemberId] = useState<string>("all");

    const uniqueMembers = useMemo(() => {
        const memberMap = new Map();

        selectedTasks.forEach(task => {
            if (task.assigneeId && !memberMap.has(task.assigneeId)) {
                memberMap.set(task.assigneeId, {
                    id: task.assigneeId,
                    name: task.assigneeName || "Unknown",
                    email: task.assigneeEmail,
                    image: task.assigneeProfileImage,
                    taskCount: 0
                });
            }
        });

        Array.from(memberMap.values()).forEach(member => {
            member.taskCount = selectedTasks.filter(task => task.assigneeId === member.id).length;
        });

        console.log("🔍 Unique members:", Array.from(memberMap.values()));
        return Array.from(memberMap.values());
    }, [selectedTasks]);


    const optionsMember = uniqueMembers.map((member) => ({
        label: `${member.name} (${member.taskCount} tasks)`,
        value: member.id,
    }));


    const getMemberName = (assigneeId: string | null | undefined) => {
        if (!assigneeId) return "Unassigned";

        const task = selectedTasks.find(t => t.assigneeId === assigneeId);
        return task?.assigneeName || "Unknown";
    };

    const filteredTasks = useMemo(() => {
        if (selectedMemberId === "all") return selectedTasks;

        return selectedTasks.filter(task => {
            return String(task.assigneeId || "") === selectedMemberId;
        });
    }, [selectedTasks, selectedMemberId]);

    const onMemberChange = (value: string) => {
        setSelectedMemberId(value === "all" ? "all" : value);
    };

    useEffect(() => {
        if (filteredTasks.length > 0) {
            const tasksJSON = JSON.stringify(
                filteredTasks.map((task: Task) => ({
                    id: task.id || task.$id,
                    name: task.name,
                    description: task.description,
                    projectId: task.projectId,
                    assigneeId: task.assigneeId,
                    status: task.status,
                }))
            );
            form.setValue("tasks", tasksJSON);
        }
    }, [filteredTasks, form]);

    return (
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Selected Tasks</span>
                        <Badge variant="secondary">{filteredTasks.length}</Badge>
                    </CardTitle>

                    {selectedTasks.length > 0 && (
                        <div className="mt-4">
                            <Select value={selectedMemberId} onValueChange={onMemberChange}>
                                <SelectTrigger className="w-full">
                                    <User className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Filter by member" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Members</SelectItem>
                                    <SelectSeparator />
                                    {optionsMember?.map((member) => (
                                        <SelectItem key={member.value} value={member.value}>
                                            {member.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </CardHeader>

                <CardContent>
                    {filteredTasks.length > 0 ? (
                        <div className="space-y-3">
                            {filteredTasks.map((task) => {
                                const memberName = getMemberName(task.assigneeId);

                                return (
                                    <div key={task.id || task.$id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                                {task.name}
                                            </h4>
                                            {task.description && (
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                                    {task.description}
                                                </p>
                                            )}
                                            <div className="flex items-center mt-2">
                                                {/* ✅ Show profile image if available */}
                                                {task.assigneeProfileImage ? (
                                                    <img
                                                        src={task.assigneeProfileImage}
                                                        alt={memberName}
                                                        className="w-4 h-4 rounded-full mr-1"
                                                    />
                                                ) : (
                                                    <div className="w-4 h-4 bg-gray-300 rounded-full mr-1 flex items-center justify-center">
                                                        <User className="w-2 h-2 text-gray-600" />
                                                    </div>
                                                )}
                                                <span className="text-xs text-gray-500">
                                                    {memberName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">No tasks found</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};