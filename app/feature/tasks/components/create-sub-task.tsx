"use client"
import { DatePicker } from "@/components/date-picker";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { json } from "stream/consumers";
import { MemberAvatar } from "../../members/component/member-avatar";
import { Button } from "@/components/ui/button";
import { ProjectAvatar } from "../../projects/component/create-project-avatar";
import { LabelType, PriorityType, TaskType } from "../types";
import { useForm } from "react-hook-form";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { createSubTaskSchema, } from "../schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTaskId } from "../hooks/use-task-id";
import { useCreateSubTask } from "../api/create-sub-task";
import { useProjectId } from "../../projects/hooks/use-project-id";


interface SubTaskProps {
    projectOptions: { id: string; name: string; imageUrl?: string }[];
    memberOptions: { id: string; name: string; profileImage: string }[];
}

export const SubTaskForm = ({ projectOptions, memberOptions }: SubTaskProps) => {
    const router = useRouter();
    const parentTaskId = useTaskId();
    const workspaceId = UseWorkspaceId();
    const projectId = useProjectId();
    const { mutate, isPending: ispending } = useCreateSubTask();

    const form = useForm<z.infer<typeof createSubTaskSchema>>({
        resolver: zodResolver(createSubTaskSchema),
        defaultValues: {
            workspaceId,
            parentTaskId,
            status: TaskType.TODO,
            name: "",
            description: "",
            assigneeId: "",
            projectId: projectId,
            priority: PriorityType.LOW,
            label: LabelType.BUG,
            position: 0,
        }
    });

    const onSubmit = (values: z.infer<typeof createSubTaskSchema>) => {
        console.log("Form validation passed!", values);
        console.log("parentTaskId:", parentTaskId);
        console.log("workspaceId:", workspaceId);
        mutate({
            json: {
                ...values,
                workspaceId,
                parentTaskId,
            },
            param: {
                workspaceId: workspaceId,
                taskId: parentTaskId
            }
        }, {
            onSuccess: () => {
                router.push(`/workspaces/${workspaceId}/tasks/${parentTaskId}`)
            }
        }
        );
    };

    const handleBack = () => {
        router.push(`/workspaces/${workspaceId}/tasks/${parentTaskId}`)
    }

    return (
        <Card className="w-full max-w-2xl mx-auto h-full border-none shadow-none">
            <CardHeader className="flex flex-row items-center gap-x-4 space-y-0 px-4 py-6 sm:px-6">
                <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleBack()}
                >
                    <ArrowLeftIcon className="size-4 mr-2" />
                    Back
                </Button>
                <CardTitle className="text-xl font-bold">Create Sub Task</CardTitle>
            </CardHeader>

            <div className="px-4 sm:px-6">
                <DottedSeperator />
            </div>

            <div className="px-4 sm:px-6">
                <DottedSeperator />
            </div>

            <CardContent className="px-4 py-6 sm:px-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-y-4">
                            {/* Task Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Task Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Enter task name" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-sm font-medium text-gray-700">
                                            Task Description
                                        </FormLabel>
                                        <FormControl>
                                            <textarea
                                                {...field}
                                                placeholder="Write a brief description for your task"
                                                className="w-full h-24 px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-primary/20 focus:outline-none resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Due Date */}
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select due date"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Status & Priority Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-x-4 gap-2">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Default Issue Status
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    readOnly
                                                    value="TODO"
                                                    className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Task Priority</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <FormMessage />
                                                <SelectContent>
                                                    <SelectItem value={PriorityType.HIGH}>
                                                        HIGH
                                                    </SelectItem>
                                                    <SelectItem value={PriorityType.MEDIUM}>
                                                        MEDIUM
                                                    </SelectItem>
                                                    <SelectItem value={PriorityType.LOW}>
                                                        LOW
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="label"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Task Label</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select label" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <FormMessage />
                                                <SelectContent>
                                                    <SelectItem value={LabelType.BUG}>
                                                        BUG
                                                    </SelectItem>
                                                    <SelectItem value={LabelType.FEATURE}>
                                                        FEATURE
                                                    </SelectItem>
                                                    <SelectItem value={LabelType.IMPROVEMENT}>
                                                        IMPROVEMENT
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Project & Assignee Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-x-4 gap-2">
                                <FormField
                                    control={form.control}
                                    name="projectId"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Project</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select project" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <FormMessage />
                                                <SelectContent>
                                                    {projectOptions.map((project) => (
                                                        <SelectItem key={project.id} value={project.id}>
                                                            <div className="flex items-center gap-x-2">
                                                                <ProjectAvatar
                                                                    className="size-6"
                                                                    name={project.name}
                                                                    image={project.imageUrl}
                                                                />
                                                                {project.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="assigneeId"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Assignee</FormLabel>
                                            <Select value={field.value} onValueChange={field.onChange}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select assignee" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <FormMessage />
                                                <SelectContent>
                                                    {memberOptions.map((member) => (
                                                        <SelectItem key={member.id} value={member.id}>
                                                            <div className="flex items-center gap-x-2">
                                                                <MemberAvatar
                                                                    className="size-6"
                                                                    image={member.profileImage}
                                                                    name={member.name}
                                                                />
                                                                {member.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DottedSeperator className="py-7" />

                        {/* Submit Button */}
                        <div className="pt-6 flex justify-end">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={ispending}
                                onClick={() => {
                                    console.log("🔘 Button clicked!");
                                    console.log("Form state:", form.formState);
                                    console.log("Form errors:", form.formState.errors);
                                }}
                            >
                                {ispending ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}