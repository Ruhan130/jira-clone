"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
// import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { createTaskSchenma } from "../schemas";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useCreateTask } from "../api/use-create-task";
interface CreateTaskFormProps {
    onCancel?: () => void;
    projectOptions: { id: string; name: string; imageUrl?: string }[];
    memberOptions: { id: string; name: string }[];
};

export const CreateTaskForm = ({ onCancel, projectOptions, memberOptions }: CreateTaskFormProps) => {
    const workspaceId = UseWorkspaceId();
    // const router = useRouter();
    const { mutate, isPending } = useCreateTask();

    const form = useForm<z.infer<typeof createTaskSchenma>>({
        resolver: zodResolver(createTaskSchenma),
        defaultValues: {
            name: "",
        }
    });


    const inputRef = useRef<HTMLInputElement>(null);

    const onsubmit = (values: z.infer<typeof createTaskSchenma>) => {
        mutate({ json: { ...values, workspaceId } }, {
            onSuccess: () => {
                form.reset();
            }
        });
    };

    return (
        <div>
            <Card className="w-full h-full  border-none shadow-none">
                <CardHeader className=" flex p-7">
                    <CardTitle className="text-xl font-bold">
                        Create new Project
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
                            </div>
                            <DottedSeperator className="py-7" />
                            <div className="flex items-center justify-between pt-10">
                                <Button type="button" variant="secondary" size="lg" onClick={onCancel} className={cn(!onCancel && "invisible")}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="lg"   >
                                    Task Workspace
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )

}