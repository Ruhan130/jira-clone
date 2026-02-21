"use client";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { MemberAvatar } from "../../members/component/member-avatar";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeftIcon, ChevronDownIcon, ImageIcon, X } from "lucide-react";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import createTeamSchema from "../schemas";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTeam } from "../api/use-create-team";
import { Textarea } from "@/components/ui/textarea";
import { handle } from "hono/vercel";


interface CreateTeamsFormProps {
    onCancel?: () => void;
    memberOptions: { id: string; name: string; image?: string }[];
    workspaceId: string;
}

type SelectedMember = { id: string; name: string; image?: string };

export const CreateTeamForm = ({ onCancel, memberOptions, workspaceId }: CreateTeamsFormProps) => {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const { mutate: createTeam, isPending } = useCreateTeam();

    const form = useForm<z.infer<typeof createTeamSchema>>({
        resolver: zodResolver(createTeamSchema),
        defaultValues: {
            name: "",
            workspaceId: workspaceId,
            image: undefined,
            members: [],
            description: "",
            team_lead: "",
        },
    });

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

    // const rouster = useRout

    const onSubmit = async (values: z.infer<typeof createTeamSchema>) => {
        console.log("Form values:", values);


        const selectedTeamLead = memberOptions.find(member => member.id === values.team_lead);

        const formPayload = {
            name: values.name,
            workspaceId: values.workspaceId,
            description: values.description || "",
            team_lead: JSON.stringify({
                id: values.team_lead,
                name: selectedTeamLead?.name || "",
                image: selectedTeamLead?.image || ""
            }),
            image: values.image,
            members: JSON.stringify(values.members),
        };

        console.log("Form payload being sent:", formPayload);

        createTeam(
            {
                form: formPayload,
                param: { workspaceId }
            },
            {
                onSuccess: () => {
                    router.push(`/workspaces/${workspaceId}/view-teams`)
                },
            }
        );
    };

    const handleBack = () => {
        router.push(`/workspaces/${workspaceId}`);
    }

    return (
        <Card className="w-full h-full border-none shadow-none">
            <CardHeader className="flex flex-row items-center gap-x-4 space-y-0 p-7">
                <Button size="sm" variant="secondary" onClick={onCancel ? onCancel : () => handleBack()}>
                    <ArrowLeftIcon className="size-4 mr-2" />
                    Back
                </Button>
                <CardTitle className="text-xl font-bold">Create Team</CardTitle>
            </CardHeader>

            <div className="px-7">
                <DottedSeperator />
            </div>

            <CardContent className="p-7">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Hidden WorkspaceId Field */}
                        <FormField
                            control={form.control}
                            name="workspaceId"
                            render={({ field }) => (
                                <FormControl>
                                    <input type="hidden" {...field} value={workspaceId} />
                                </FormControl>
                            )}
                        />

                        {/* Team Name Field */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Enter team name" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description Field - NEW */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Enter team description"
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Image Upload Field */}
                        <FormField
                            name="image"
                            control={form.control}
                            render={({ field }) => (
                                <div className="flex flex-col gap-y-2">
                                    <div className="flex items-center gap-x-5">
                                        {field.value ? (
                                            <div className="size-[72px] relative rounded-md overflow-hidden">
                                                <Image
                                                    alt="Logo"
                                                    fill
                                                    className="object-cover"
                                                    src={
                                                        field.value instanceof File
                                                            ? URL.createObjectURL(field.value)
                                                            : field.value
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
                                            <p className="text-sm">Team Icon</p>
                                            <p className="text-sm text-muted-foreground">JPG, PNG, SVG or JPEG, max 1mb</p>
                                            <input
                                                className="hidden"
                                                type="file"
                                                accept=".jpg, .png, .jpeg, .svg"
                                                ref={inputRef}
                                                onChange={handleImageInput}
                                            />
                                            {field.value ? (
                                                <Button
                                                    className="w-fit mt-2"
                                                    type="button"
                                                    variant="destructive"
                                                    size="xs"
                                                    onClick={() => {
                                                        field.onChange(null);
                                                        if (inputRef.current) {
                                                            inputRef.current.value = "";
                                                        }
                                                    }}
                                                >
                                                    Remove Image
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="w-fit mt-2"
                                                    type="button"
                                                    variant="teritery"
                                                    size="xs"
                                                    onClick={() => inputRef.current?.click()}
                                                >
                                                    Upload Image
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        />

                        {/* Team Lead Field */}
                        <FormField
                            control={form.control}
                            name="team_lead"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Lead</FormLabel>
                                    <Select
                                        defaultValue={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select team lead" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <FormMessage />
                                        <SelectContent>
                                            {memberOptions.map((member) => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    <div className="flex items-center gap-x-2">
                                                        <MemberAvatar
                                                            image={member.image}
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

                        {/* Multi-Select for Members */}
                        <FormField
                            control={form.control}
                            name="members"
                            render={({ field }) => {
                                const selected = (field.value as SelectedMember[]) ?? [];

                                return (
                                    <FormItem>
                                        <FormLabel>Team Members</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full justify-between text-sm text-muted-foreground"
                                                        type="button"
                                                    >
                                                        {selected.length > 0
                                                            ? `${selected.length} member${selected.length > 1 ? 's' : ''} selected`
                                                            : "Select Team Members"}
                                                        <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search members..." />
                                                    <CommandList>
                                                        <CommandEmpty>No members found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {memberOptions.map((member) => {
                                                                const isSelected = selected.some((sel: SelectedMember) => sel.id === member.id);
                                                                return (
                                                                    <CommandItem
                                                                        key={member.id}
                                                                        onSelect={() => {
                                                                            const newValue = isSelected
                                                                                ? selected.filter((m: SelectedMember) => m.id !== member.id)
                                                                                : [...selected, { id: member.id, name: member.name, image: member.image }];
                                                                            field.onChange(newValue);
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-x-2 w-full">
                                                                            <Checkbox checked={isSelected} />
                                                                            <MemberAvatar name={member.name} image={member.image} className="size-6" />
                                                                            <span className="flex-1">{member.name}</span>
                                                                        </div>
                                                                    </CommandItem>
                                                                );
                                                            })}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />

                                        {/* Selected Members Display */}
                                        {selected.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {selected.map((member) => (
                                                    <div key={member.id} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm">
                                                        <MemberAvatar name={member.name} className="size-4" />
                                                        <span>{member.name}</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-4 w-4 p-0 hover:bg-destructive/20"
                                                            onClick={() => {
                                                                const newValue = selected.filter((m) => m.id !== member.id);
                                                                field.onChange(newValue);
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </FormItem>
                                );
                            }}
                        />

                        <DottedSeperator className="py-7" />
                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                size="lg"
                                variant="primary"
                                disabled={isPending || !form.formState.isValid} // 👈 Sirf isPending check karo
                            >
                                {isPending ? "Creating..." : "Create Team"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card >
    );
};