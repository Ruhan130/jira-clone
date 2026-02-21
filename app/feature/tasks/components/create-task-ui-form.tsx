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
import { PriorityType, TaskType } from "../types";
import { useForm } from "react-hook-form";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useCreateTask } from "../api/use-create-task";
import { createTaskSchemaWithId, createTaskSchenma } from "../schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";


interface CreateTaskUiFormProps {
    onCancel?: () => void;
    projectOptions: { id: string; name: string; imageUrl?: string }[];
    memberOptions: { id: string; name: string; profileImage: string }[];
}
export const CreateTaskUiForm = ({ projectOptions, memberOptions, onCancel, }: CreateTaskUiFormProps) => {

    const workspaceId = UseWorkspaceId();
    const { mutate, isPending } = useCreateTask();
    const router = useRouter();

    const form = useForm<z.infer<typeof createTaskSchenma>>({
        resolver: zodResolver(createTaskSchenma),
        defaultValues: {
            workspaceId,
            status: "BACKLOG",
        }
    });
    const onsubmit = (values: z.infer<typeof createTaskSchemaWithId>) => {
        mutate({ json: { ...values, workspaceId } }, {
            onSuccess: () => {
                router.push(`/workspaces/${workspaceId}`);

            }
        },
        );
    };

    const handleBack = () => {
        router.push(`/workspaces/${workspaceId}`);
    }

    return (
        <Card className="w-full max-w-2xl mx-auto h-full border-none shadow-none">
            <CardHeader className="flex flex-row items-center gap-x-4 space-y-0 px-4 py-6 sm:px-6">
                <Button
                    size="sm"
                    variant="secondary"
                    onClick={onCancel ? onCancel : () => handleBack()}
                >
                    <ArrowLeftIcon className="size-4 mr-2" />
                    Back
                </Button>
                <CardTitle className="text-xl font-bold">Create Task</CardTitle>
            </CardHeader>

            <div className="px-4 sm:px-6">
                <DottedSeperator />
            </div>

            <div className="px-4 sm:px-6">
                <DottedSeperator />
            </div>

            <CardContent className="px-4 py-6 sm:px-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onsubmit)}>
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

                            {/* Due Date */}
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <FormControl>
                                            <DatePicker {...field} value={field.value} onChange={field.onChange} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Assignee */}
                            <FormField
                                control={form.control}
                                name="assigneeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assignee</FormLabel>
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
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
                                                            <MemberAvatar className="size-6"
                                                                image={member.profileImage}
                                                                name={member.name} />
                                                            {member.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            {/* Status & Priority */}
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
                                        <FormItem className="flex-1">
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

                            {/* Project */}
                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project</FormLabel>
                                        <Select defaultValue={field.value} onValueChange={field.onChange}>
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
                        </div>

                        <DottedSeperator className="py-7" />

                        {/* Submit */}
                        <div className="pt-6 flex justify-end">
                            <Button type="submit" variant="primary" size="lg" disabled={isPending}>
                                Create Task
                            </Button>
                        </div>

                    </form>
                </Form>
            </CardContent>
        </Card>
    )
} 