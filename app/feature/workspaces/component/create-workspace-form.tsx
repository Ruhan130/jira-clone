"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createWrokspaceSchemas } from "../schemas";
import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCreateWorkspace } from "../api/use-create-workspace";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
interface CreateWorkSpaceForm {
    onCancel?: () => void;
};

export const CreateWorkSpaceForm = ({ onCancel }: CreateWorkSpaceForm) => {
    const router = useRouter();
    const { mutate, isPending } = useCreateWorkspace();
    const form = useForm<z.infer<typeof createWrokspaceSchemas>>({
        resolver: zodResolver(createWrokspaceSchemas),
        defaultValues: {
            name: "",
        }
    });

    const inputRef = useRef<HTMLInputElement>(null);

    const onsubmit = (values: z.infer<typeof createWrokspaceSchemas>) => {
        const finalSubmit = {
            ...values,
            image: values.image instanceof File ? values.image : "",
        }
        mutate({ form: finalSubmit }, {
            onSuccess: ({ data }) => {
                form.reset();
                // onCancel?.();
                router.push(`/workspaces/${data.$id}`);
            }
        });
    };

    const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1_000_000) {
                toast.error("Image size should be less than 1MB");
                return;
            }
            form.setValue("image", file);
        }
    };

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
                                <FormField
                                    name="image"
                                    control={form.control}
                                    render={
                                        ({ field }) =>
                                        (
                                            <div className="flex flex-col gap-y-2">
                                                <div className="flex items-center gap-x-5">
                                                    {field.value ? (
                                                        <div className="size-[72px] relative rounded-md overflow-hidden">
                                                            <Image
                                                                alt="Logo"
                                                                fill
                                                                className="object-cover"
                                                                src={
                                                                    field.value instanceof File ? URL.createObjectURL(field.value) : field.value
                                                                }
                                                            />
                                                        </div>
                                                    ) : (
                                                        <Avatar className="size-[72px]">
                                                            <AvatarFallback>
                                                                <ImageIcon className="size-[36px] text-neutral-400" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <p className="text-sm">Workspace Icon</p>
                                                        <p className="text-sm text-muted-foreground">JPG, PNG, SVG or JPEG, max 1mb</p>
                                                        <input
                                                            className="hidden"
                                                            type="file"
                                                            accept=".jpg, .png, .jpeg, .svg"
                                                            ref={inputRef}
                                                            onChange={handleImageInput}
                                                            disabled={isPending}

                                                        />
                                                        {field.value ?
                                                            (
                                                                <Button className="w-fit mt-2"
                                                                    type="button"
                                                                    disabled={isPending}
                                                                    variant="destructive"
                                                                    size="xs"
                                                                    onClick={
                                                                        () => {
                                                                            field.onChange(null);
                                                                            if (inputRef.current) {
                                                                                inputRef.current.value = "";
                                                                            }
                                                                        }}>
                                                                    Remove Image
                                                                </Button>
                                                            ) : (
                                                                <Button className="w-fit mt-2"
                                                                    type="button"
                                                                    disabled={isPending}
                                                                    variant="teritery"
                                                                    size="xs"
                                                                    onClick={() => inputRef.current?.click()}>
                                                                    Upload Image
                                                                </Button>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        )

                                    }
                                />
                            </div>
                            <DottedSeperator className="py-7" />
                            <div className="flex items-center justify-between pt-10">
                                <Button type="button" variant="secondary" size="lg" onClick={onCancel} className={cn(!onCancel && "invisible")}>
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