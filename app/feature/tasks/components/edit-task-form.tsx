"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createTaskSchemaWithId, createTaskSchenma } from "../schemas";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { DatePicker } from "@/components/date-picker";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";

import { MemberAvatar } from "../../members/component/member-avatar";
import { Task, TaskType } from "../types";
import { ProjectAvatar } from "../../projects/component/create-project-avatar";
import { useUpdateTask } from "../api/use-update-task";
interface EditTaskFormProps {
    onCancel?: () => void;
    projectOptions: { id: string; name: string; imageUrl?: string }[];
    memberOptions: { id: string; name: string }[];
    initialValues: Task;
};

export const EditTaskForm = ({ onCancel, projectOptions, memberOptions, initialValues }: EditTaskFormProps) => {
    const { mutate, isPending } = useUpdateTask();

    const form = useForm<z.infer<typeof createTaskSchemaWithId>>({
        resolver: zodResolver(createTaskSchemaWithId),
        defaultValues: {
            ...initialValues,
            dueDate: initialValues.dueDate ? new Date(initialValues.dueDate) : undefined,
        }
    });

    const onsubmit = (values: z.infer<typeof createTaskSchemaWithId>) => {
        console.log("Form Submitted with values:", values);
        mutate({ json: values, param: { taskId: initialValues.$id } }, {
            onSuccess: () => {
                form.reset();
                onCancel?.();
            }
        });
    };

    return (
        <div>
            <Card className="w-full h-full  border-none shadow-none">
                <CardHeader className=" flex p-7">
                    <CardTitle className="text-xl font-bold">
                        Edit a Task
                    </CardTitle>
                </CardHeader>
                <div className="px-7">
                    <DottedSeperator />
                </div>
                <CardContent className="p-7">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onsubmit)}>
                            <div className="flex flex-col gap-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Task Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    placeholder="Enter workspace name"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Due Date
                                            </FormLabel>
                                            <FormControl>
                                                <DatePicker {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="assigneeId"
                                    render={
                                        ({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Assignee
                                                </FormLabel>
                                                <Select
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}>
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
                                                                        name={member.name}
                                                                    />
                                                                    {member.name}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>

                                        )
                                    }

                                />

                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={
                                        ({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Status
                                                </FormLabel>
                                                <Select
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <FormMessage />
                                                    <SelectContent>
                                                        <SelectItem value={TaskType.BACKLOG}>
                                                            Backlog
                                                        </SelectItem>
                                                        <SelectItem value={TaskType.IN_PROGRESS}>
                                                            In Progress
                                                        </SelectItem>
                                                        <SelectItem value={TaskType.IN_REVIEW}>
                                                            In Review
                                                        </SelectItem>
                                                        <SelectItem value={TaskType.TODO}>
                                                            Todo
                                                        </SelectItem>
                                                        <SelectItem value={TaskType.DONE}>
                                                            Done
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )
                                    }
                                />

                                <FormField
                                    control={form.control}
                                    name="projectId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Task ID
                                            </FormLabel>
                                            <Select defaultValue={field.value}
                                                onValueChange={field.onChange} >
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
                                                    )
                                                    )}
                                                </SelectContent>

                                            </Select>
                                        </FormItem>
                                    )}
                                />


                            </div>
                            <DottedSeperator className="py-7" />
                            <div className="flex items-center justify-between pt-10">
                                <Button type="button" variant="secondary" size="lg" onClick={onCancel} className={cn(!onCancel && "invisible")}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="lg" disabled={isPending}  >
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )

}