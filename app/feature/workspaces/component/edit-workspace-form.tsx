"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateWorkSpaceSchema } from "../schemas";
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
import { ArrowLeftIcon, CopyIcon, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Workspace } from "../type";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import { useConform } from "@/hooks/use-confirm";
import { useDeleteWorkspace } from "../api/use-delete-workspace";
import { useResetWorkspace } from "../api/use-reset-workspace";
interface EditWorkSpaceForm {
    onCancel?: () => void;
    initialValues: Workspace;
}

export const EditWorkSpaceForm = ({ onCancel, initialValues }: EditWorkSpaceForm) => {

    const [DeleteDailogue, confirmDelete] = useConform(
        "Delete workspace",
        "This action cannot be done",
        "destructive",
    );

    const [ResetDailogue, setResetDailogue] = useConform(
        "Reset Invite Link",
        "This will invalidate the current invite link",
        "destructive"
    )

    const {
        mutate: deleteWorkspace,
        isPending: isDeletingWorkspace
    } = useDeleteWorkspace();

    const {
        mutate: resetInviteCode,
        isPending: isResettingInviteCode
    } = useResetWorkspace();

    const router = useRouter();
    const { mutate, isPending } = useUpdateWorkspace();
    const form = useForm<z.infer<typeof updateWorkSpaceSchema>>({
        resolver: zodResolver(updateWorkSpaceSchema),
        defaultValues: {
            ...initialValues,
            image: initialValues.imageUrl ?? "",
        }
    });

    const handleDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;

        deleteWorkspace({
            param: {
                workspaceId: initialValues.$id,
            }
        }, {
            onSuccess: () => {
                window.location.href = "/";
            }
        }
        )

    }

    const handleResetInviteCode = async () => {
        const ok = await setResetDailogue();
        if (!ok) return;

        resetInviteCode({
            param: {
                workspaceId: initialValues.$id,
            }
        });


    }

    const inputRef = useRef<HTMLInputElement>(null);

    const onsubmit = (values: z.infer<typeof updateWorkSpaceSchema>) => {
        const finalSubmit = {
            ...values,
            image: values.image instanceof File ? values.image : "",
        }
        mutate({
            form: finalSubmit,
            param: { workspaceId: initialValues.$id }
        },);
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

    const iniviteFullLink = `${window.location.origin}/workspaces/${initialValues.$id}/join/${initialValues.inviteCode}`;

    const handleInviteLink = () => {
        navigator.clipboard.writeText(iniviteFullLink).then(() => toast.success("Invite Link copied to the clipborad"));
    }

    return (
        <div className="flex flex-col gap-y-4">
            <DeleteDailogue />
            <ResetDailogue />
            <Card className="w-full h-full  border-none shadow-none">
                <CardHeader className=" flex flex-row items-center gap-x-4 space-y-0 p-7">
                    <Button size="sm" variant="secondary" onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.$id}`)}>
                        <ArrowLeftIcon className="size-4 mr-2" />
                        Back
                    </Button>
                    <CardTitle className="text-xl font-bold">
                        {initialValues.name}
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
                                <Button type="button" variant="secondary" size="lg" onClick={onCancel ? onCancel : () => router.push(`/workspaces/${initialValues.$id}`)} className={cn(!onCancel && "invisible")}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="lg"   >
                                    Update Workspace
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>


            <Card className="w-full h-full  border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">
                            Invite Zone
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Use invite link to add members to your worksapce.
                        </p>
                        <div className="mt-4">
                            <div className="flex items-center gap-x-2">
                                <Input disabled value={iniviteFullLink} />
                                <Button variant="secondary" onClick={handleInviteLink} className="size-12">
                                    <CopyIcon className="size-5" />
                                </Button>
                            </div>
                        </div>
                        <DottedSeperator className="py-7" />
                        <Button variant="destructive" size="sm" className="mt-6 w-fit ml-auto" onClick={handleResetInviteCode} disabled={isPending || isResettingInviteCode}>
                            Reset Invite code
                        </Button>
                    </div>
                </CardContent>
            </Card>


            <Card className="w-full h-full  border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">
                            Danger Zone
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Deleting a workspace is iireversible and will remove all associate
                        </p>
                        <DottedSeperator className="py-7" />
                        <Button variant="destructive" size="sm" className="mt-6 w-fit ml-auto" onClick={handleDelete} disabled={isPending || isDeletingWorkspace}>
                            Delete Workspace
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )

}