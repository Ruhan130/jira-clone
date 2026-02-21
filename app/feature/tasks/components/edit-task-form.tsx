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
import { createTaskSchemaWithId } from "../schemas";
import { DatePicker } from "@/components/date-picker";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";

import { MemberAvatar } from "../../members/component/member-avatar";
import { PriorityType, Task, TaskType } from "../types";
import { ProjectAvatar } from "../../projects/component/create-project-avatar";
import { useUpdateTask } from "../api/use-update-task";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
interface EditTaskFormProps {

    projectOptions: { id: string; name: string; imageUrl?: string }[];
    memberOptions: { id: string; name: string; imageUrl?: string }[];
    initialValues: Task;
};

export const EditTaskForm = ({ projectOptions, memberOptions, initialValues }: EditTaskFormProps) => {
    const { mutate, isPending } = useUpdateTask();
    const workspaceId = initialValues.workspaceId;
    const router = useRouter();


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
                router.push(`/workspaces/${workspaceId}/projects/${initialValues.projectId}`);

            }
        });
    };

    const handleBack = () => {
        router.push(`/workspaces/${workspaceId}/projects/${initialValues.projectId}`);
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center  gap-x-4 space-y-0 px-4 py-6 sm:px-6">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleBack()}
                    >
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back
                    </Button>
                    <CardTitle className="text-xl font-bold ">
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
                                {/* Grid layout for better space utilization */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                        placeholder="Enter task name"
                                                        className="w-full"
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
                                                    <DatePicker {...field} className="w-full" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="assigneeId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Assignee
                                                </FormLabel>
                                                <Select
                                                    defaultValue={field.value}
                                                    onValueChange={field.onChange}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select assignee" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <FormMessage />
                                                    <SelectContent>
                                                        {memberOptions.map((member) => (
                                                            <SelectItem key={member.id} value={member.id}>
                                                                <div className="flex items-center gap-x-2">
                                                                    <MemberAvatar
                                                                        image={member.imageUrl}
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
                                        )}
                                    />

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
                                                        placeholder="Backlog"
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
                                            <FormItem className="">
                                                <FormLabel>Task Priority</FormLabel>
                                                <Select defaultValue={field.value} onValueChange={field.onChange}>
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

                                </div>
                            </div>

                            <DottedSeperator className="py-7" />

                            <div className="flex items-center justify-between pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="lg"
                                    onClick={() => router.back()}
                                    className="px-8"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={isPending}
                                    className="px-8"
                                >
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