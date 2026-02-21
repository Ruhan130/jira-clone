"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspace";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { WorkspaceRange, WorkspaceRangeLabels } from "../type";
import { createWorkspaceSchema } from "../schemas";

interface CreateWorkSpaceForm {
    onCancel?: () => void;
    mode?: 'onboarding' | 'dashboard';
    onSuccess?: (workspace: any) => void;
}

export const CreateWorkSpaceForm = ({ onCancel, mode = 'dashboard', onSuccess }: CreateWorkSpaceForm) => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const { mutate, isPending } = useCreateWorkspace();

    const [origin, setOrigin] = useState('');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setOrigin(window.location.origin);
    }, []);

    const form = useForm<z.infer<typeof createWorkspaceSchema>>({
        resolver: zodResolver(createWorkspaceSchema),
        defaultValues: {
            name: "",
            workspaceUrl: "",
            range: undefined,
        }
    });

    const onSubmit = (values: z.infer<typeof createWorkspaceSchema>) => {
        console.log(" Creating workspace with values:", values);
        if (!values.range) {
            form.setError("range", {
                type: "manual",
                message: "Please select a team size range"
            });
            return;
        }

        const formData = {
            name: values.name,
            workspaceUrl: values.workspaceUrl,
            range: values.range
        };

        mutate({ form: formData }, {
            onSuccess: (data) => {
                form.reset();
                if (mode === 'onboarding') {
                    if ("data" in data) {
                        const workspace = data.data;
                        router.replace(`/workspaces/${workspace.$id}/invite-coworkers`);
                    } else {
                        return
                    }
                } else {
                    if (onSuccess) {
                        onSuccess(data);
                    } else {
                        if ("data" in data) {
                            const workspace = data.data;
                            router.push(`/workspaces/${workspace.$id}`);
                        } else {
                            router.push(`/`);
                        }
                    }
                    onCancel?.();
                }
            },
        });
    };

    // ✅ Show loading until mounted
    if (!mounted) {
        return (
            <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                    Create a new workspace
                </h1>
                <p className="text-sm text-gray-600 leading-relaxed">
                    Workspaces are shared environments where teams can work on projects,
                    cycles and issues.
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4">

                    {/* Display root errors */}
                    {form.formState.errors.root && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                            {form.formState.errors.root.message}
                        </div>
                    )}

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Workspace Name <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Your workspace name"
                                        disabled={isPending}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="workspaceUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Workspace URL</FormLabel>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 z-10">
                                        {origin}/
                                    </span>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            className="pl-[175px]"
                                            onChange={(e) => {
                                                const value = e.target.value
                                                    .toLowerCase()
                                                    .replace(/[^a-z0-9-]/g, '')
                                                    .replace(/^-+|-+$/g, '')
                                                    .replace(/-{2,}/g, '-');
                                                field.onChange(value);
                                            }}
                                        />
                                    </FormControl>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Your workspace will be available at: {origin}/{field.value || "your-workspace"}
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="range"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    How many people will use this workspace? <span className="text-red-500">*</span>
                                </FormLabel>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                disabled={isPending}
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? WorkspaceRangeLabels[field.value as WorkspaceRange]
                                                    : "Select a range"
                                                }
                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-1">
                                        {Object.values(WorkspaceRange).map((rangeValue) => (
                                            <Button
                                                key={rangeValue}
                                                variant="ghost"
                                                className="w-full justify-start"
                                                onClick={() => {
                                                    field.onChange(rangeValue);
                                                    setOpen(false);
                                                }}
                                            >
                                                {WorkspaceRangeLabels[rangeValue]}
                                            </Button>
                                        ))}
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full"
                        >
                            {isPending ? "Creating workspace..." : "Create workspace"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};