import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Check, ChevronDown, ImageIcon, Users, FolderPlus, Settings, Shield, ArrowLeftIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { MemberAvatar } from "../../members/component/member-avatar";
// import {  createProjectFormSchema } from "../schemas";
import { useCreateProject } from "../api/use-create-project";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { useGetTeams } from "../../teams/api/use-get-teams";
import { useGetMembers } from "../../members/api/use-get-members";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
// import { CreateProjectFormData, createProjectFormSchema } from "../schemas";
import { useGetProjects } from "../api/use-get-projects";
import { createProjectFormSchemaWithCheck } from "../schemas";

interface CreateProjectFormProps {
    onCancel?: () => void;
    memberOptions: { id: string; name: string; image?: string }[];
}

export const CreateProjectForm = ({ onCancel, memberOptions }: CreateProjectFormProps) => {
    const workspaceId = UseWorkspaceId();
    const router = useRouter();
    const { data: projectData } = useGetProjects({ workspaceId });
    const { mutate, isPending } = useCreateProject();
    const { data: teamData } = useGetTeams({ workspaceId });

    const existingProjectNames = useMemo(() => {
        return projectData?.documents.map(p => p.name.toLowerCase()) || []
    }, [projectData])

    console.log("🚨 Existing:", existingProjectNames);

    const schema = useMemo(() => createProjectFormSchemaWithCheck(existingProjectNames), [existingProjectNames]);

    const form = useForm<z.infer<typeof schema>>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            identifier: "",
            description: "",
            owners: "",
            members: [],
            icon: "folder",
            default_issue_status: "Backlog",
            default_assignee: "",
            is_private: false,
            auto_join: false,
            imageUrl: undefined,
        }
    });
    const [open, setOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const onsubmit = async (values: z.infer<typeof schema>) => {
        console.log("📝 Raw form values:", values);
        console.log("🖼️ ImageUrl direct:", values.imageUrl);
        console.log("🖼️ ImageUrl type:", typeof values.imageUrl);
        console.log("🖼️ Is File?:", values.imageUrl instanceof File);

        let imageBase64 = null;

        if (values.imageUrl instanceof File) {
            console.log("🔄 Converting file to Base64...");
            try {
                imageBase64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(values.imageUrl);
                });
                // console.log("✅ Base64 conversion successful, length:", imageBase64.length);
            } catch (error) {
                console.error("❌ Base64 conversion failed:", error);
            }
        }

        const teamMembers = values.members.filter(id => id.startsWith("team_"));
        const individualMembers = values.members.filter(id => id.startsWith("user_"));
        const allTeamIds = values.members.filter(id => id.startsWith("team_")).map(id => id.replace("team_", ""));

        const finalSubmit = {
            workspaceId: workspaceId,
            name: values.name,
            identifier: values.identifier || `PROJ-${Date.now()}`,
            owners: values.owners,
            description: values.description || "",
            default_assignee: values.default_assignee || "",
            icon: values.icon || "folder",
            default_issue_status: values.default_issue_status || "Backlog",
            teamId: allTeamIds[0] ?? null,
            members: [
                ...teamMembers,
                ...individualMembers
            ],
            is_private: values.is_private || false,
            auto_join: values.auto_join || false,
            imageUrl: imageBase64,
        };
        // console.log("📦 Final submit data:", finalSubmit);
        // console.log("🖼️ ImageUrl type in finalSubmit:", typeof finalSubmit.imageUrl);
        // console.log("🗂️ Members array contains:", finalSubmit.members);

        mutate(finalSubmit);
    };

    const handleImageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1_000_000) {
                toast.error("Image size should be less than 1MB");
                return;
            }
            form.setValue("imageUrl", file);
        }
    };

    const { data: existingProjects } = useGetProjects({ workspaceId });
    const projectCount = existingProjects?.documents?.length || 0;
    useEffect(() => {
        const projectName = form.watch("name");

        if (projectName && projectName.trim() !== "") {
            const cleanName = projectName.replace(/[^a-zA-Z0-9]/g, '');
            const prefix = cleanName.slice(0, 2).toLowerCase();
            const number = String(projectCount + 1).padStart(2, '0');
            const identifier = `${prefix}-${number}`;

            form.setValue("identifier", identifier);
        }
    }, [form.watch("name"), projectCount, form]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <Card className="w-full border shadow-lg bg-white/95 backdrop-blur">
                        <CardHeader className="p-8 pb-6 ">
                            <div className="flex items-center gap-6 ">
                                <Button size="sm" variant="secondary" onClick={onCancel ? onCancel : () => router.push(`/`)}>
                                    <ArrowLeftIcon className="size-4 mr-2" />
                                    Back
                                </Button>

                                <div>
                                    <CardTitle className="text-3xl font-bold text-gray-900">
                                        Create Project
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
                            <Form {...form}>
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
                                                            Project Name
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
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-8 bg-primary rounded-full"></div>
                                            <div className="flex items-center gap-2">
                                                <ImageIcon className="size-5 text-primary" />
                                                <h3 className="text-xl font-semibold text-gray-900">Project Icon</h3>
                                            </div>
                                        </div>

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
                                                                src={field.value instanceof File ? URL.createObjectURL(field.value) : field.value}
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
                                                            onChange={handleImageInput}
                                                            disabled={isPending}
                                                        />
                                                        {field.value ? (
                                                            <Button
                                                                type="button"
                                                                disabled={isPending}
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => {
                                                                    field.onChange(null);
                                                                    if (inputRef.current) {
                                                                        inputRef.current.value = "";
                                                                    }
                                                                }}
                                                            >
                                                                Remove Icon
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                type="button"
                                                                disabled={isPending}
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => inputRef.current?.click()}
                                                            >
                                                                Upload Icon
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        />
                                    </div>

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
                                                            defaultValue={field.value}
                                                            onValueChange={field.onChange}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-12 border-gray-200 focus:border-primary">
                                                                    <SelectValue placeholder="Select assignee" />
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
                                                name="members" // Single field for both teams and individuals
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
                                                                            {field.value?.length > 0
                                                                                ? `${field.value.length} teams & members selected`
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
                                                                                                // image={member.image}
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

                                                        {/* Selected Items Display */}
                                                        {field.value && field.value.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-3">
                                                                {field.value.map((id) => {
                                                                    if (id.startsWith('team_')) {
                                                                        const teamId = id.replace('team_', '');
                                                                        const team = teamData?.documents?.find(t => t.$id === teamId);
                                                                        return team ? (
                                                                            <Badge key={id} variant="secondary" className="gap-2 py-1">
                                                                                <Avatar className="size-4">
                                                                                    {team.image ? (
                                                                                        <AvatarImage src={team.image} alt={team.name} />
                                                                                    ) : (
                                                                                        <AvatarFallback className="text-xs bg-blue-100">
                                                                                            <Users className="size-2 text-blue-600" />
                                                                                        </AvatarFallback>
                                                                                    )}
                                                                                </Avatar>
                                                                                {team.name}
                                                                                <span className="text-xs text-blue-600">Team</span>
                                                                            </Badge>
                                                                        ) : null;
                                                                    } else if (id.startsWith('user_')) {
                                                                        const userId = id.replace('user_', '');
                                                                        const member = memberOptions?.find(m => m.id === userId);
                                                                        return member ? (
                                                                            <Badge key={id} variant="outline" className="gap-2 py-1 border-green-200">
                                                                                <MemberAvatar
                                                                                    className="size-4"
                                                                                    name={member.name}
                                                                                    image={member.image}
                                                                                />
                                                                                {member.name}
                                                                                <span className="text-xs text-green-600">Member</span>
                                                                            </Badge>
                                                                        ) : null;
                                                                    }
                                                                    return null;
                                                                })}
                                                            </div>
                                                        )}
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>



                                    {/* Privacy Settings Section */}
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-8 bg-primary rounded-full"></div>
                                            <div className="flex items-center gap-2">
                                                <Shield className="size-5 text-primary" />
                                                <h3 className="text-xl font-semibold text-gray-900">Privacy & Access</h3>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="is_private"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between p-6 border border-gray-200 rounded-xl bg-white">
                                                        <div className="space-y-2">
                                                            <FormLabel className="text-base font-medium text-gray-900">
                                                                Make Private
                                                            </FormLabel>
                                                            <p className="text-sm text-muted-foreground">
                                                                Only selected team members can access this project
                                                            </p>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={(value) => {
                                                                    field.onChange(value);
                                                                    form.setValue('auto_join', false);
                                                                    console.log('Make Private:', value);
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="auto_join"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between p-6 border border-gray-200 rounded-xl bg-white">
                                                        <div className="space-y-2">
                                                            <FormLabel className="text-base font-medium text-gray-900">
                                                                Auto Join
                                                            </FormLabel>
                                                            <p className="text-sm text-muted-foreground">
                                                                Automatically add new workspace members to this project
                                                            </p>
                                                        </div>
                                                        <FormControl>
                                                            <Switch
                                                                checked={field.value}
                                                                onCheckedChange={(value) => {
                                                                    field.onChange(value);
                                                                    form.setValue('is_private', false);
                                                                    console.log('Auto Join:', value);
                                                                }}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <DottedSeperator className="my-8" />

                                    <div className="flex items-center justify-between pt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="lg"
                                            onClick={onCancel}
                                            className={cn("px-8", !onCancel && "invisible")}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={isPending}
                                            className="px-8 bg-primary hover:bg-primary/90"
                                        >
                                            {isPending ? "Creating Project..." : "Create Project"}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};