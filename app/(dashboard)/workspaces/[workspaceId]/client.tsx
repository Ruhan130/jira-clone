"use client";


import { useGetMembers } from "@/app/feature/members/api/use-get-members";
import { MemberAvatar } from "@/app/feature/members/component/member-avatar";
import { Member } from "@/app/feature/members/type";
import { useGetProjects } from "@/app/feature/projects/api/use-get-projects";
import { ProjectAvatar } from "@/app/feature/projects/component/create-project-avatar";
import { UseCreateProjectModal } from "@/app/feature/projects/hooks/use-create-project-modal";
import { Project } from "@/app/feature/projects/types";
import { useGetTasks } from "@/app/feature/tasks/api/use-get-tasks";
import { UseCreateTaskModal } from "@/app/feature/tasks/hooks/use-create-task-modal";
import { Task } from "@/app/feature/tasks/types";
import { useGetWorkspaceAnalytics } from "@/app/feature/workspaces/api/use-get-workspace-analytics";
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { Analytics } from "@/components/analytics";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { CalendarIcon, PencilIcon, PlusIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";

export const WorkspaceIdClient = () => {
    const workspaceId = UseWorkspaceId();
    const { data: analytics, isLoading: isWorkspaceLoading } = useGetWorkspaceAnalytics({ workspaceId });
    const { data: members, isLoading: isMemberLoading } = useGetMembers({ workspaceId });
    const { data: tasks, isLoading: isTaskLoading } = useGetTasks({ workspaceId });
    const { data: projects, isLoading: isProjectLoading } = useGetProjects({ workspaceId });

    const isLoading = isWorkspaceLoading || isMemberLoading || isTaskLoading || isProjectLoading;

    if (isLoading) {
        return <PageLoader />
    }

    if (!analytics || !members || !tasks || !projects) {
        return <PageError message="Field to find workspace" />
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            <Analytics data={analytics} />
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <TaskList data={tasks.documents} total={tasks.total} />
                <ProjectList data={projects.documents} total={projects.total} />
                <MemberList data={members.documents} total={members.total} />
            </div>
        </div>
    );
}

interface TaskListProps {
    data: Task[];
    total: number
}

export const TaskList = ({ data, total }: TaskListProps) => {
    const workspaceId = UseWorkspaceId();
    const { open: createTask } = UseCreateTaskModal();
    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Task ({total})
                    </p>
                    <Button variant="muted" size="icon" onClick={createTask} >
                        <PlusIcon className="size-4 text-neutral-400" />
                    </Button>
                </div>
                <DottedSeperator className="my-4" />
                <ul className=" flex flex-col gap-y-4">
                    {data.map((task) => (
                        <li key={task.$id}>
                            <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                                    <CardContent className="p-4">
                                        <p className="text-lg font-medium truncate">
                                            {task.name}
                                        </p>
                                        <div className="flex items-center gap-x-2">
                                            <p>
                                                {task.project?.name}
                                            </p>
                                            <div className="size-1 rounded-full bg-neutral-300" />
                                            <div className="text-sm text-muted-foreground flex items-center ">
                                                <CalendarIcon className="size-3 mr-3" />
                                                <span className="turncate">
                                                    {formatDistanceToNow(new Date(task.dueDate))}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </li>
                    ))}
                    <li className="text-sm to-muted-foreground text-center hidden first-of-type:block">
                        No Tasks Found
                    </li>
                    <Button variant="muted" className="mt-4 w-full" asChild>
                        <Link href={`/workspaces/${workspaceId}/tasks`}>
                            Show All
                        </Link>
                    </Button>
                </ul>
            </div>
        </div>
    )
}



interface ProjectListProps {
    data: Project[];
    total: number
}

export const ProjectList = ({ data, total }: ProjectListProps) => {
    const workspaceId = UseWorkspaceId();
    const { open: createProject } = UseCreateProjectModal();
    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Project ({total})
                    </p>
                    <Button variant="secondary" size="icon" onClick={createProject} >
                        <PlusIcon className="size-4 text-neutral-400" />
                    </Button>
                </div>
                <DottedSeperator className="my-4" />
                <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {data.map((project) => (
                        <li key={project.$id}>
                            <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                                    <CardContent className="p-4 flex items-center gap-x-2.5">
                                        <ProjectAvatar
                                            name={project.name}
                                            image={project.imageUrl}
                                            className="size-12"
                                            FallBackClassName="text-lg"
                                        />
                                        <p className="text-lg font-medium truncate">
                                            {project.name}
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                        </li>
                    ))}
                    <li className="text-sm to-muted-foreground text-center hidden first-of-type:block">
                        No Tasks Found
                    </li>

                </ul>
            </div>
        </div>
    )
}





interface MemberListProps {
    data: Member[];
    total: number
}

export const MemberList = ({ data, total }: MemberListProps) => {
    const workspaceId = UseWorkspaceId();
    return (
        <div className="flex flex-col gap-y-4 col-span-1">
            <div className="bg-white border rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold">
                        Members ({total})
                    </p>
                    <Button variant="secondary" size="icon" asChild >
                        <Link href={`/workspaces/${workspaceId}/members`} >
                            <SettingsIcon className="size-4 text-neutral-400" />
                        </Link>
                    </Button>
                </div>
                <DottedSeperator className="my-4" />
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.map((member) => (
                        <li key={member.$id}>
                            <Card className="shadow-none rounded-lg overflow-hidden">
                                <CardContent className="p-3 flex flex-col items-center gap-x-2">
                                    <MemberAvatar
                                        name={member.name}
                                        className="size-12"
                                    />
                                    <div className="flex flex-col items-center overflow-hidden">
                                        <p className="text-lg font-medium line-clamp-1">
                                            {member.name}
                                        </p>
                                        <p className="text-lg text-muted-foreground line-clamp-1">
                                            {member.email}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </li>
                    ))}
                    <li className="text-sm to-muted-foreground text-center hidden first-of-type:block">
                        No Member Found
                    </li>

                </ul>
            </div>
        </div>
    )
} 