import { useEffect, useState } from "react";
import { Task } from "../../tasks/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CalendarDays, Plus, Trash2, UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useGetTeams } from "../../teams/api/use-get-teams";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateSprintSchema, CreateSprintType, EditSprintSchema, EditSprintType } from "../schemas";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Sprint } from "../type";
import { z } from "zod";
import { useGetTasks } from "../../tasks/api/use-get-tasks";
import { useUpdateSprint } from "../api/use-update-sprint";
import { UseSprintId } from "../hooks/use-sprint-id";
import { ResponsiveModal } from "@/components/responsive-modal";
import { TaskSelectModal } from "./task-select-modal";

interface EditSprintFormProps {
    initailValues: Sprint;
}

export const EditSprintForm = ({ initailValues }: EditSprintFormProps) => {
    const router = useRouter();
    const workspaceId = UseWorkspaceId();

    const [selectedTasks, setSelectedTasks] = useState<Task[]>(() =>
        JSON.parse(initailValues.tasks || "[]"));
    const [openTaskModal, setOpenTaskModal] = useState(false);

    const { data: taskData, isPending: isLoading } = useGetTasks({ workspaceId });

    const form = useForm<z.infer<typeof EditSprintSchema>>({
        resolver: zodResolver(EditSprintSchema),
        defaultValues: {
            ...initailValues,
            duration: initailValues.duration as "1_week" | "2_weeks" | "custom"

        }
    });

    const watchedStartDate = form.watch("startDate");
    const watchedDuration = form.watch("duration");



    const calculateEndDate = (startDate: string, duration: string) => {
        if (!startDate) return '';

        const start = new Date(startDate);
        let days = 14;

        switch (duration) {
            case '1_week': days = 7; break;
            case '2_weeks': days = 14; break;
            case 'custom': return '';
        }

        const end = new Date(start);
        end.setDate(start.getDate() + days);
        return end.toISOString().split('T')[0];
    }
    useEffect(() => {
        if (watchedStartDate && watchedDuration !== 'custom') {
            const calculatedEndDate = calculateEndDate(watchedStartDate, watchedDuration);
            console.log("📅 Auto-calculating end date:");
            console.log("Start Date:", watchedStartDate);
            console.log("Duration:", watchedDuration);
            console.log("Calculated End Date:", calculatedEndDate);

           
            form.setValue("endDate", calculatedEndDate);
        }
    }, [watchedStartDate, watchedDuration, form]);



    const { mutate: updateSprint, isPending } = useUpdateSprint();
    const sprintId = UseSprintId();

    const onSubmit = (values: EditSprintType) => {
        const finalTasks = JSON.stringify(selectedTasks);
        updateSprint({
            param: {
                workspaceId,
                sprintId,
            },
            json: {
                ...values,
                tasks: finalTasks,
            },
        }, {
            onSuccess: () => {
                router.push(`/workspaces/${workspaceId}/sprint`)
            }
        }
        )
    };


    // Selected tasks state






    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-6 py-4 ">
                    <div className="flex items-center gap-4 ">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/workspaces/${workspaceId}/backlog-tasks`)}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900 ">Edit Sprint</h1>

                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Selected Tasks Preview - Left Column */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Selected Tasks</span>
                                    {/* <Badge variant="secondary">{selectedTasks.length}</Badge> */}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {selectedTasks.length > 0 ? (
                                    <div className="space-y-3">
                                        {selectedTasks.map((task: Task) => (
                                            <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                                                        {task.name}
                                                    </h4>
                                                    {task.description && (
                                                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                                                            {task.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:bg-red-50"
                                                    onClick={() =>
                                                        setSelectedTasks((prev) => prev.filter((t) => t.id !== task.id))
                                                    }
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button variant="outline" onClick={() => setOpenTaskModal(true)}>
                                            Add Task
                                        </Button>
                                        <ResponsiveModal open={openTaskModal} onOpenChange={setOpenTaskModal}>
                                            <TaskSelectModal
                                                onSelect={(newTasks) => {
                                                    const unique = newTasks.filter(
                                                        (task) => !selectedTasks.some((t) => t.$id === task.$id || t.id === task.id)
                                                    );
                                                    setSelectedTasks([...selectedTasks, ...unique]);
                                                    setOpenTaskModal(false);
                                                }}
                                            />
                                        </ResponsiveModal>

                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Plus className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-sm">No tasks selected</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() => router.back()}
                                        >
                                            Add Tasks
                                        </Button>
                                    </div>
                                )}
                            </CardContent>

                        </Card>
                    </div>

                    {/* Sprint Details Form - Right Column */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sprint Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="space-y-6">

                                        {/* Sprint Name - Documentation: "Sprint name" */}
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sprint Name *</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            placeholder="Enter sprint name"
                                                            className="w-full"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Duration - Documentation: "Duration (1 week, 2 weeks, custom)" */}
                                        <FormField
                                            control={form.control}
                                            name="duration"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Duration *</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select duration" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="1_week">
                                                                <div className="flex items-center gap-2">
                                                                    <CalendarDays className="w-4 h-4" />
                                                                    1 Week (7 days)
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="2_weeks">
                                                                <div className="flex items-center gap-2">
                                                                    <CalendarDays className="w-4 h-4" />
                                                                    2 Weeks (14 days)
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="custom">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="w-4 h-4" />
                                                                    Custom Duration
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Dates - Documentation: "Start and end dates" */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="startDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Start Date *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="date"
                                                                min={new Date().toISOString().split('T')[0]}
                                                                className="w-full"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="endDate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>End Date *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="date"
                                                                disabled={watchedDuration !== 'custom'}
                                                                className="w-full"
                                                            />
                                                        </FormControl>
                                                        {watchedDuration !== 'custom' && (
                                                            <p className="text-xs text-gray-500">Automatically calculated based on duration</p>
                                                        )}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Sprint Goal - Documentation: "Sprint goal or objective" */}
                                        <FormField
                                            control={form.control}
                                            name="goal"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sprint Goal/Objective</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder="What do you want to achieve in this sprint? (e.g., Complete user authentication feature)"
                                                            className="w-full h-24 resize-none"
                                                        />
                                                    </FormControl>
                                                    <p className="text-xs text-gray-500">Optional: Describe the main objective of this sprint</p>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />






                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-between pt-6 border-t">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.back()}
                                            // disabled={isLoading}
                                            >
                                                Cancel
                                            </Button>

                                            <Button
                                                type="submit"
                                                disabled={isPending}
                                                onClick={() => {
                                                    console.log("🔴 Button clicked!");
                                                    console.log("📝 Form state:", form.getValues());
                                                    console.log("✅ Form valid:", form.formState.isValid);
                                                    console.log("❌ Form errors:", form.formState.errors);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >

                                                {isPending ? "Updating..." : "Update Sprint"}
                                            </Button>
                                        </div>

                                        {/* Validation Messages */}

                                        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                                            <p className="font-medium mb-1">Required to create sprint:</p>
                                            <ul className="space-y-1 text-xs">
                                                {!form.watch("name") && <li>• Sprint name</li>}
                                                {!form.watch("startDate") && <li>• Start date</li>}
                                                {!form.watch("endDate") && <li>• End date</li>}
                                                {/* {selectedTasks.length === 0 && <li>• At least one task</li>} */}
                                            </ul>
                                        </div>

                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}