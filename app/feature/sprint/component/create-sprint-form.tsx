import {  useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Task } from "../../tasks/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useForm } from "react-hook-form"; 
import { CreateSprintSchema, CreateSprintType } from "../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseCreateSprint } from "../api/use-create-sprint";
import { useGetMembers } from "../../members/api/use-get-members";
import { MemberTaskFilter } from "./member-filter";



export const CreateSprintPage = () => {
    const router = useRouter();
    const workspaceId = UseWorkspaceId();

    const { data: memberData } = useGetMembers({ workspaceId });
    const form = useForm<CreateSprintType>({
        resolver: zodResolver(CreateSprintSchema),
        defaultValues: {
            name: "",
            duration: "1_week",
            startDate: "",
            endDate: "",
            goal: "",
            // reviewerId: "",
            status: "draft",
            tasks: ""
        }
    })

    const watchedStartDate = form.watch("startDate");
    const watchedDuration = form.watch("duration");
    const { mutate, isPending: isLoading } = UseCreateSprint();

    const onsubmit = (values: CreateSprintType) => {
        console.log("📝 Raw form values:", values);
        console.log("📋 Tasks in form:", values.tasks);

        const finalSubmit = {
            workspaceId,
            duration: values.duration,
            name: values.name,
            startDate: values.startDate,
            endDate: values.endDate,
            goal: values.goal,
            status: values.status,
            tasks: JSON.stringify(selectedTasks.map(task => ({
                id: task.$id,
                name: task.name,
                description: task.description,
                projectId: task.projectId,
                assigneeId: task.assigneeId,
                status: task.status
            }))),
            sprintIdentifier: values.sprintIdentifier
        };

        mutate(
            {
                json: finalSubmit,
                param: { workspaceId }
            },
            {
                onSuccess: () => {
                    router.push(`/workspaces/${workspaceId}`)
                }
            }
        );
    };

    // Selected tasks state
    const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);


    useEffect(() => {
        const savedTasks = localStorage.getItem('selectedTasks');
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            setSelectedTasks(tasks);

            if (tasks.length > 0) {
                const firstTask = tasks[0];
                form.setValue("workspaceId", firstTask.workspaceId);


                const projectName = firstTask?.project?.name || "";
                if (projectName) {
                    const prefix = projectName.slice(0, 2).toUpperCase();
                    const timestamp = Date.now().toString().slice(-3);
                    const identifier = `${prefix}-Sprint-${timestamp}`;

                    form.setValue("sprintIdentifier", identifier);

                }


                const tasksJSON = JSON.stringify(tasks.map((task: Task) => ({
                    id: task.$id,
                    name: task.name,
                    description: task.description,
                    projectId: task.projectId,
                    assigneeId: task.assigneeId,
                    status: task.status
                })));
                form.setValue("tasks", tasksJSON);
                console.log("📋 Tasks set in form:", tasksJSON);
            }

            sessionStorage.removeItem('selectedTasks');
        }
    }, [form]);
    useEffect(() => {
        if (selectedTasks.length > 0) {
            console.log("🚀 Create Sprint Screen loaded:");
            console.log("📂 Project ID:", selectedTasks[0]?.projectId);
            console.log("🔢 Selected Task IDs:", selectedTasks.map(t => t.$id));
            console.log("📋 Selected tasks:", selectedTasks);
        }
    }, [selectedTasks]);

    useEffect(() => {
        if (watchedStartDate && watchedDuration !== 'custom') {
            const calculatedEndDate = calculateEndDate(watchedStartDate, watchedDuration);
            console.log("📅 Auto-calculating end date:");
            console.log("Start Date:", watchedStartDate);
            console.log("Duration:", watchedDuration);
            console.log("Calculated End Date:", calculatedEndDate);

            // Update the form field
            form.setValue("endDate", calculatedEndDate);
        }
    }, [watchedStartDate, watchedDuration, form]);



    // Calculate end date based on duration
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
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
                            <h1 className="text-2xl font-semibold text-gray-900">Create Sprint</h1>
                            <p className="text-sm text-gray-600">Add selected tasks to a new sprint</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Selected Tasks Preview - Left Column */}
                    <div className="lg:col-span-1">

                        <MemberTaskFilter
                            selectedTasks={selectedTasks}
                            setSelectedTasks={setSelectedTasks}
                            form={form}
                            members={memberData?.documents}
                        />
                    </div>

                    {/* Sprint Details Form - Right Column */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sprint Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-6">
                                        {/* Sprint Name - Documentation: "Sprint name" */}

                                        <div className="grid grid-cols-2 gap-4">
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

                                            <FormField
                                                control={form.control}
                                                name="sprintIdentifier"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Sprint Identifier</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                placeholder="Auto-generated sprint identifier"
                                                                readOnly
                                                                className="bg-gray-50"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                        <p className="text-xs text-gray-600">
                                                            Automatically generated unique identifier for this sprint
                                                        </p>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>


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
                                                </FormItem>
                                            )}
                                        />
                                        {/* Action Buttons */}
                                        <div className="flex items-center  justify-end pt-6 border-t">
                                            <Button
                                                type="submit"
                                                disabled={isLoading}
                                                onClick={() => {
                                                    console.log("🔴 Button clicked!");
                                                    console.log("📝 Form state:", form.getValues());
                                                    console.log("✅ Form valid:", form.formState.isValid);
                                                    console.log("❌ Form errors:", form.formState.errors);
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                {isLoading ? "Creating..." : `Create `}
                                            </Button>
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
