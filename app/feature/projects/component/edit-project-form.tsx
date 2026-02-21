"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { updateProjectFormSchema } from "../schemas";
import { useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeftIcon, Check, ChevronDown, Edit2, FileImage, FolderPlus, Globe, ImageIcon, Settings, Shield, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Project } from "../types";
import { useUpdateProject } from "../api/use-update-project";
import { useConform } from "@/hooks/use-confirm";
import { useDeleteProject } from "../api/use-delete-project";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { MemberAvatar } from "../../members/component/member-avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetProject } from "../api/use-get-project";
import { useGetTeams } from "../../teams/api/use-get-teams";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useGetProjects } from "../api/use-get-projects";

interface EditProjectForm {
    initialValues: Project;
    memberOptions: { id: string; name: string; image?: string }[];
}

export const EditProjectForm = ({ initialValues, memberOptions }: EditProjectForm) => {

    const [DeleteDailogue, confirmDelete] = useConform(
        "Delete Project",
        "This action cannot be done",
        "destructive",
    );


    const {
        mutate: deleteProject,
        isPending: isDeletingProject
    } = useDeleteProject();

    const router = useRouter();
    const { mutate, isPending } = useUpdateProject();
    const workspaceId = UseWorkspaceId();
    const { data: teamData } = useGetTeams({ workspaceId });
    const { data: projectData } = useGetProject({ projectId: initialValues.$id });
    const project = projectData;

    const { data: allProjects } = useGetProjects({ workspaceId });

    const existingNames = allProjects?.documents.map(p => p.name.toLowerCase()) || [];
    const currentName = project?.name.toLowerCase() || "";

    const schema = useMemo(
        () => updateProjectFormSchema(existingNames, currentName),
        [existingNames, currentName]
    );



    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: project?.name || "",
            identifier: project?.identifier || "",
            description: project?.description || "",
            owners: project?.owners || "",
            members: project?.members || [],
            icon: project?.icon || "folder",
            default_issue_status: project?.default_issue_status || "Backlog",
            default_assignee: project?.default_assignee || "",
            imageUrl: project?.imageUrl || undefined,
        }
    });

    const handleDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;

        deleteProject({
            param: {
                projectId: initialValues.$id,
            }
        }, {
            onSuccess: () => {
                window.location.href = `/workspaces/${initialValues.workspaceId}`;
            }
        }
        )

    }
    const [open, setOpen] = useState(false);


    const inputRef = useRef<HTMLInputElement>(null);
    const onsubmit = async (values: z.infer<typeof schema>) => {
        const teamMembers = values.members?.filter(id => id.startsWith("team_")) || [];
        const individualMembers = values.members?.filter(id => id.startsWith("user_")) || [];
        const allTeamIds = teamMembers.map(id => id.replace("team_", ""));

        // ✅ Convert File to Base64 or keep existing string
        let processedImageUrl: string | undefined = undefined;

        if (values.imageUrl instanceof File) {
            console.log("🔄 Converting file to Base64...");
            try {
                processedImageUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(values.imageUrl);
                });
                console.log("✅ Base64 conversion successful");
            } catch (error) {
                console.error("❌ Base64 conversion failed:", error);
            }
        } else if (typeof values.imageUrl === "string") {
            processedImageUrl = values.imageUrl; 
        }

        const finalSubmit = {
            name: values.name,
            identifier: values.identifier,
            description: values.description,
            owners: values.owners,
            icon: values.icon,
            default_assignee: values.default_assignee,
            default_issue_status: values.default_issue_status,
            teamId: allTeamIds[0] || undefined,
            members: [...teamMembers, ...individualMembers],
            imageUrl: processedImageUrl, 
        };

        console.log("📦 Final edit submit:", finalSubmit);
        console.log("🖼️ ImageUrl type:", typeof finalSubmit.imageUrl);

        mutate({
            json: finalSubmit,
            param: { projectId: initialValues.$id }
        }, {
            onSuccess: () => {
                router.push(`/workspaces/${workspaceId}`);
            }
        }
        );
    };

    const handleImageInput = (
        e: React.ChangeEvent<HTMLInputElement>,
        onChange: (value: File) => void
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1_000_000) {
            toast.error("Image size should be less than 1MB");
            return;
        }

        console.log("📁 File selected:", file.name, file.size);
        onChange(file);
    };





    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 mw-100">
            <DeleteDailogue />
            <div className="container mx-auto px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <Card className="flex-1 lg:flex-[6] border shadow-lg bg-white/95 backdrop-blur mw-100">
                            <CardHeader className="p-8 pb-6 ">
                                <div className="flex items-center gap-6 ">
                                    <Button size="sm" variant="secondary" onClick={() => router.push('/')}>
                                        <ArrowLeftIcon className="size-4 mr-2" />
                                        Back
                                    </Button>

                                    <div>
                                        <CardTitle className="text-3xl font-bold text-gray-900">
                                            Edit Project
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Set up a new project for your workspace with team collaboration
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>


                            <div className="px-8">
                                <DottedSeperator />
                            </div>

                            <CardContent className="p-8 pt-6">
                                <Form {...form} >
                                    <form onSubmit={form.handleSubmit(onsubmit)} className="space-y-8">

                                        {/* Project Details Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-1 h-8 bg-primary rounded-full"></div>
                                                <div className="flex items-center gap-2">
                                                    <FolderPlus className="size-5 text-primary" />
                                                    <h3 className="text-xl font-semibold text-gray-900">Project Details</h3>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                Project Name *
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    {...field}
                                                                    placeholder="Enter project name"
                                                                    className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="identifier"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                Project Identifier
                                                            </FormLabel>
                                                            <FormControl>
                                                                <div className="flex gap-2">
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="Auto-generated from project name"
                                                                        readOnly
                                                                        className="h-12 border-gray-200 focus:border-primary focus:ring-primary/20 bg-gray-50"
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                            <p className="text-xs text-gray-600">
                                                                Generated from project name • Pattern: prefix-number (e.g., my-01)
                                                            </p>
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium text-gray-700">
                                                            Project Description
                                                        </FormLabel>
                                                        <FormControl>
                                                            <textarea
                                                                {...field}
                                                                placeholder="Write a brief description for your project"
                                                                className="w-full h-24 px-4 py-3 border border-gray-200 rounded-lg focus:border-primary focus:ring-primary/20 focus:outline-none resize-none"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* Project Icon Section */}
                                        <FormField
                                            name="imageUrl"
                                            control={form.control}
                                            render={({ field }) => (
                                                <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                                                    {field.value ? (
                                                        <div className="size-20 relative rounded-xl overflow-hidden border-2 border-white shadow-lg">
                                                            <Image
                                                                alt="Project Icon"
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
                                                        <Avatar className="size-20 border-2 border-dashed border-gray-300">
                                                            <AvatarFallback className="bg-gray-100">
                                                                <ImageIcon className="size-10 text-gray-400" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    )}

                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900 text-lg">Project Icon</p>
                                                        <p className="text-sm text-muted-foreground mb-4">
                                                            JPG, PNG, SVG or JPEG, max 1MB
                                                        </p>

                                                        <input
                                                            className="hidden"
                                                            type="file"
                                                            accept=".jpg, .png, .jpeg, .svg"
                                                            ref={inputRef}
                                                            disabled={isPending}
                                                            onChange={(e) => handleImageInput(e, field.onChange)} // ✅ use external handler
                                                        />

                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                disabled={isPending}
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => inputRef.current?.click()}
                                                            >
                                                                {field.value ? "Change Icon" : "Upload Icon"}
                                                            </Button>

                                                            {field.value && (
                                                                <Button
                                                                    type="button"
                                                                    disabled={isPending}
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        field.onChange(""); // send empty string
                                                                        if (inputRef.current) inputRef.current.value = "";
                                                                        console.log("🗑️ Image removed, field value cleared");
                                                                    }}
                                                                >
                                                                    Remove Icon
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        />


                                        {/* Project Settings Section */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1 h-8 bg-primary rounded-full"></div>
                                                <div className="flex items-center gap-2">
                                                    <Settings className="size-5 text-primary" />
                                                    <h3 className="text-xl font-semibold text-gray-900">Project Configuration</h3>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="default_issue_status"
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
                                                    name="default_assignee"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                Default Assignee for Issues
                                                            </FormLabel>
                                                            <Select
                                                                value={field.value || undefined}
                                                                onValueChange={(value) => {
                                                                    field.onChange(value || "");
                                                                }}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger className="h-12 border-gray-200 focus:border-primary">
                                                                        <SelectValue placeholder="Select assignee" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {/* ✅ REMOVED: No SelectItem with empty value - let placeholder handle it */}
                                                                    {memberOptions.map((member) => (
                                                                        <SelectItem key={member.id} value={member.id}>
                                                                            <div className="flex items-center gap-x-2">
                                                                                <MemberAvatar
                                                                                    className="size-6"
                                                                                    name={member.name}
                                                                                    image={member.image}
                                                                                />
                                                                                {member.name}
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />

                                                            {/* ✅ ADDED: Clear button outside Select */}
                                                            {field.value && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => field.onChange("")}
                                                                    className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                                                >
                                                                    <X className="size-3 mr-1" />
                                                                    Clear default assignee
                                                                </Button>
                                                            )}
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="owners"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium text-gray-700">
                                                            Project Owner
                                                        </FormLabel>
                                                        <Select
                                                            defaultValue={field.value}
                                                            onValueChange={field.onChange}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 border-gray-200 focus:border-primary">
                                                                    <SelectValue placeholder="Select project owner" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {memberOptions.map((member) => (
                                                                    <SelectItem key={member.id} value={member.id}>
                                                                        <div className="flex items-center gap-x-2">
                                                                            <MemberAvatar
                                                                                className="size-6"
                                                                                name={member.name}
                                                                                image={member.image}
                                                                            />
                                                                            {member.name}
                                                                        </div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {/* // Single field mein Teams + Individual Members */}
                                        <div className="space-y-6">
                                            <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                                <FormField
                                                    control={form.control}
                                                    name="members"
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                Select Teams & Individual Members
                                                            </FormLabel>
                                                            <Popover open={open} onOpenChange={setOpen}>
                                                                <PopoverTrigger asChild>
                                                                    <FormControl>
                                                                        <Button
                                                                            variant="outline"
                                                                            role="combobox"
                                                                            aria-expanded={open}
                                                                            className="justify-between h-12 px-4 bg-white border-gray-200 focus:border-primary"
                                                                        >
                                                                            <span className="text-gray-600">
                                                                                {(field.value?.length ?? 0) > 0
                                                                                    ? `${(field.value?.length ?? 0)} teams & members selected`
                                                                                    : "Select teams and members..."
                                                                                }
                                                                            </span>
                                                                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                        </Button>
                                                                    </FormControl>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-[500px] p-0 max-h-[400px] overflow-hidden" align="start">
                                                                    <Command>
                                                                        <CommandInput placeholder="Search teams and members..." className="h-12" />
                                                                        <div className="max-h-[320px] overflow-y-auto">
                                                                            <CommandEmpty>No teams or members found.</CommandEmpty>

                                                                            {/* Teams Section */}
                                                                            {teamData?.documents && teamData.documents.length > 0 && (
                                                                                <CommandGroup heading="🏢 Teams">
                                                                                    {teamData.documents.map((team) => {
                                                                                        const teamId = `team_${team.$id}`; // Prefix to distinguish
                                                                                        const isSelected = field.value?.includes(teamId);
                                                                                        return (
                                                                                            <CommandItem
                                                                                                key={teamId}
                                                                                                onSelect={() => {
                                                                                                    console.log("Team selected:", team.name);
                                                                                                    const currentValue = field.value || [];
                                                                                                    const newValue = isSelected
                                                                                                        ? currentValue.filter((id) => id !== teamId)
                                                                                                        : [...currentValue, teamId];

                                                                                                    console.log("New value:", newValue);
                                                                                                    field.onChange(newValue);
                                                                                                }}
                                                                                                className="p-3"
                                                                                            >
                                                                                                <div className="flex items-center gap-3 w-full">
                                                                                                    <div
                                                                                                        className={cn(
                                                                                                            "flex h-5 w-5 items-center justify-center rounded border-2 border-primary",
                                                                                                            isSelected
                                                                                                                ? "bg-primary text-primary-foreground"
                                                                                                                : "opacity-50"
                                                                                                        )}
                                                                                                    >
                                                                                                        {isSelected && <Check className="h-3 w-3" />}
                                                                                                    </div>

                                                                                                    <Avatar className="size-8">
                                                                                                        {team.image ? (
                                                                                                            <AvatarImage src={team.image} alt={team.name} />
                                                                                                        ) : (
                                                                                                            <AvatarFallback className="text-xs bg-blue-100">
                                                                                                                <Users className="size-4 text-blue-600" />
                                                                                                            </AvatarFallback>
                                                                                                        )}
                                                                                                    </Avatar>

                                                                                                    <div className="flex-1">
                                                                                                        <div className="flex items-center gap-2">
                                                                                                            <span className="font-medium">{team.name}</span>
                                                                                                            <Badge variant="secondary" className="text-xs">Team</Badge>
                                                                                                        </div>
                                                                                                        {team.description && (
                                                                                                            <p className="text-xs text-muted-foreground truncate">
                                                                                                                {team.description}
                                                                                                            </p>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </CommandItem>
                                                                                        );
                                                                                    })}
                                                                                </CommandGroup>
                                                                            )}

                                                                            {/* Individual Members Section */}
                                                                            {memberOptions && memberOptions.length > 0 && (
                                                                                <CommandGroup heading="👤 Individual Members">
                                                                                    {memberOptions.map((member) => {
                                                                                        const memberId = `user_${member.id}`; // Prefix to distinguish
                                                                                        const isSelected = field.value?.includes(memberId);
                                                                                        return (
                                                                                            <CommandItem
                                                                                                key={memberId}
                                                                                                onSelect={() => {
                                                                                                    console.log("Member selected:", member.name);
                                                                                                    const currentValue = field.value || [];
                                                                                                    const newValue = isSelected
                                                                                                        ? currentValue.filter((id) => id !== memberId)
                                                                                                        : [...currentValue, memberId];

                                                                                                    console.log("New value:", newValue);
                                                                                                    field.onChange(newValue);
                                                                                                }}
                                                                                                className="p-3"
                                                                                            >
                                                                                                <div className="flex items-center gap-3 w-full">
                                                                                                    <div
                                                                                                        className={cn(
                                                                                                            "flex h-5 w-5 items-center justify-center rounded border-2 border-green-500",
                                                                                                            isSelected
                                                                                                                ? "bg-green-500 text-white"
                                                                                                                : "opacity-50"
                                                                                                        )}
                                                                                                    >
                                                                                                        {isSelected && <Check className="h-3 w-3" />}
                                                                                                    </div>

                                                                                                    <MemberAvatar
                                                                                                        className="size-8"
                                                                                                        name={member.name}
                                                                                                        image={member.image}
                                                                                                    />

                                                                                                    <div className="flex-1">
                                                                                                        <div className="flex items-center gap-2">
                                                                                                            <span className="font-medium">{member.name}</span>
                                                                                                            <Badge variant="outline" className="text-xs border-green-200">Member</Badge>
                                                                                                        </div>
                                                                                                        <p className="text-xs text-muted-foreground">
                                                                                                            Individual Member
                                                                                                        </p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </CommandItem>
                                                                                        );
                                                                                    })}
                                                                                </CommandGroup>
                                                                            )}
                                                                        </div>
                                                                    </Command>
                                                                </PopoverContent>
                                                            </Popover>
                                                            <FormMessage />

                                                            {/* ✅ EDIT FEATURE: Enhanced Selected Items Display with Remove Option */}
                                                            {field.value && field.value.length > 0 && (
                                                                <div className="space-y-3 mt-4">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="text-sm font-medium text-gray-700">
                                                                            Selected ({field.value.length})
                                                                        </p>
                                                                        {/* ✅ EDIT FEATURE: Clear All Button */}
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => field.onChange([])}
                                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                                                                        >
                                                                            <X className="size-3 mr-1" />
                                                                            Clear All
                                                                        </Button>
                                                                    </div>

                                                                    <div className="flex flex-wrap gap-2">
                                                                        {field.value.map((id) => {
                                                                            if (id.startsWith('team_')) {
                                                                                const teamId = id.replace('team_', '');
                                                                                const team = teamData?.documents?.find(t => t.$id === teamId);
                                                                                return team ? (
                                                                                    <Badge
                                                                                        key={id}
                                                                                        variant="secondary"
                                                                                        className="gap-2 py-1 pr-1 group hover:bg-red-50 hover:border-red-200 transition-colors"
                                                                                    >
                                                                                        <Avatar className="size-4">
                                                                                            {team.image ? (
                                                                                                <AvatarImage src={team.image} alt={team.name} />
                                                                                            ) : (
                                                                                                <AvatarFallback className="text-xs bg-blue-100">
                                                                                                    <Users className="size-2 text-blue-600" />
                                                                                                </AvatarFallback>
                                                                                            )}
                                                                                        </Avatar>
                                                                                        <span>{team.name}</span>
                                                                                        <span className="text-xs text-blue-600">Team</span>

                                                                                        {/* ✅ EDIT FEATURE: Individual Remove Button */}
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                const newValue = field.value?.filter((selectedId) => selectedId !== id) || [];
                                                                                                field.onChange(newValue);
                                                                                            }}
                                                                                            className="h-4 w-4 p-0 ml-1 opacity-60 hover:opacity-100 hover:bg-red-100 rounded-full group-hover:opacity-100"
                                                                                        >
                                                                                            <X className="size-3 text-red-600" />
                                                                                        </Button>
                                                                                    </Badge>
                                                                                ) : null;
                                                                            } else if (id.startsWith('user_')) {
                                                                                const userId = id.replace('user_', '');
                                                                                const member = memberOptions?.find(m => m.id === userId);
                                                                                return member ? (
                                                                                    <Badge
                                                                                        key={id}
                                                                                        variant="outline"
                                                                                        className="gap-2 py-1 pr-1 border-green-200 group hover:bg-red-50 hover:border-red-200 transition-colors"
                                                                                    >
                                                                                        <MemberAvatar
                                                                                            className="size-4"
                                                                                            name={member.name}
                                                                                            image={member.image}
                                                                                        />
                                                                                        <span>{member.name}</span>
                                                                                        <span className="text-xs text-green-600">Member</span>

                                                                                        {/* ✅ EDIT FEATURE: Individual Remove Button */}
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="ghost"
                                                                                            size="sm"
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                const newValue = field.value?.filter((selectedId) => selectedId !== id) || [];
                                                                                                field.onChange(newValue);
                                                                                            }}
                                                                                            className="h-4 w-4 p-0 ml-1 opacity-60 hover:opacity-100 hover:bg-red-100 rounded-full group-hover:opacity-100"
                                                                                        >
                                                                                            <X className="size-3 text-red-600" />
                                                                                        </Button>
                                                                                    </Badge>
                                                                                ) : null;
                                                                            }
                                                                            return null;
                                                                        })}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 mt-2 p-2 bg-white rounded border">
                                                                        <div className="flex gap-4">
                                                                            <span>
                                                                                Teams: {field.value.filter(id => id.startsWith('team_')).length}
                                                                            </span>
                                                                            <span>
                                                                                Members: {field.value.filter(id => id.startsWith('user_')).length}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex  justify-end pt-6">
                                            <Button
                                                type="submit"
                                                size="lg"
                                                disabled={isPending}
                                                className="px-8 bg-primary hover:bg-primary/90"
                                            >
                                                {isPending ? "Updating Project..." : "Update Project"}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>



                    </div>
                </div>

                <Card className="min-w-96 mt-7 h-fit border border-red-200 shadow-lg bg-red-50/50 backdrop-blur">
                    <CardContent className="p-7">
                        <div className="flex flex-col">
                            <h3 className="font-bold">
                                Danger Zone
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Deleting a Project is iireversible and will remove all associate
                            </p>
                            <DottedSeperator className="py-7" />
                            <Button variant="destructive" size="sm" className="mt-6 w-fit ml-auto" onClick={handleDelete} disabled={isPending || isDeletingProject}>
                                Delete Project
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );

}