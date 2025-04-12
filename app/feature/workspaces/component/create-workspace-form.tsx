"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createWrokspaceSchemas } from "../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspace";
interface CreateWorkSpaceForm {
    onCalled?: () => void;
};

export const CreateWorkSpaceForm = ({ onCalled }: CreateWorkSpaceForm) => {
    const { mutate, isPending } = useCreateWorkspace();
    const form = useForm<z.infer<typeof createWrokspaceSchemas>>({
        resolver: zodResolver(createWrokspaceSchemas),
        defaultValues: {
            name: "",
        }
    });

    const onsubmit = (values: z.infer<typeof createWrokspaceSchemas>) => {
        mutate({ json: values });
    }

    return (
        <div>
            <Card className="w-full h-full  border-none shadow-none">
                <CardHeader className=" flex p-7">
                    <CardTitle className="text-xl font-bold">
                        Create new Workspace
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
                                                Workspace Name
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
                                <Button type="button" variant="secondary" size="lg" onClick={onCalled}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="lg"   >
                                    Create Workspace
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )

}