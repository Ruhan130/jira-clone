"use client";
import { UserButton } from "@/app/feature/auth/component/user-button"
import { ModleSidebar } from "./mobile-sidebar"
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { CreateChoiceDialog } from "./dialoguebox-options";
import { useRouter } from "next/navigation";
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { useGetProjects } from "@/app/feature/projects/api/use-get-projects";
import { useGetProject } from "@/app/feature/projects/api/use-get-project";

export const NavBar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const workspaceId = UseWorkspaceId();

    const pathnameParts = pathname.split("/");
    const section = pathnameParts[3];
    const projectId = pathnameParts[4];

    const isOnProjectPage = section === "projects" && !!projectId;
    const { data: project } = useGetProject({ projectId });

    let title = "Home";
    let description = "Monitor all your projects and tasks here";

    if (section === "tasks") {
        title = "My Tasks";
        description = "View all of your tasks here";
    } else if (section === "backlog-tasks") {
        title = "Backlog Tasks";
        description = "View your backlog tasks";
    } else if (section === "sprint") {
        title = "Active Sprint";
        description = "This is your current sprint";
    } else if (section === "projects") {
        title = project?.name || "Projects";
        description = "View tasks of your project";
    }


    const configDailogue = (() => {
        if (pathname === `/workspaces/${workspaceId}`) {
            return {
                firstButtonTittle: "Create Workpsace",
                onFirstButtonClick: () => router.push(`/workspaces/create`),
                secondButtonTittle: "Create Team",
                onSecondButtonClick: () => router.push(`/workspaces/${workspaceId}/create-teams`)
            }
        } if (section === "tasks") {
            return {
                firstButtonTittle: "Create Task",
                onFirstButtonClick: () => router.push(`/workspaces/${workspaceId}/create-task`),
                secondButtonTittle: "Create Project",
                onSecondButtonClick: () => router.push(`/workspaces/${workspaceId}/create-new-project`)
            }
        } if (section === "projects") {
            return {
                firstButtonTittle: "Create project",
                onFirstButtonClick: () => router.push(`/workspaces/${workspaceId}/create-new-project`),
                secondButtonTittle: "Create task",
                onSecondButtonClick: () => router.push(`/workspaces/${workspaceId}/create-task`)
            }
        }
        if (section === "sprint") {
            return {
                firstButtonTittle: "Create Sprint",
                onFirstButtonClick: () => router.push(`/workspaces/${workspaceId}/backlog-tasks`),
                secondButtonTittle: "Create task",
                onSecondButtonClick: () => router.push(`/workspaces/${workspaceId}/create-task`)
            }
        }
        return null;
    })();

    return (
        <nav className="pt-4 px-6 flex items-center justify-between">
            <div className="flex-col hidden lg:flex">
                <h1 className="text-2xl font-semibold">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>

            <div className="flex items-center space-x-3">
                {configDailogue && (
                    <CreateChoiceDialog
                        firstButtonTittle={configDailogue.firstButtonTittle}
                        onFirstButtonClick={configDailogue.onFirstButtonClick}
                        secondButtonTittle={configDailogue.secondButtonTittle}
                        onSecondButtonClick={configDailogue.onSecondButtonClick} trigger={<Button size="sm">Create</Button>} />
                )
                }
                <UserButton />
            </div>
        </nav>
    );
};