"use client";
import { cn } from "@/lib/utils";
import { ListTodo, Rocket, Settings, SettingsIcon, TreePalmIcon, UserIcon } from "lucide-react"
import Link from "next/link";
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from "react-icons/go"
import { usePathname } from "next/navigation";
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { useGetTeams } from "@/app/feature/teams/api/use-get-teams";
import { UseGetSprints } from "@/app/feature/sprint/api/use-get-sprints";
import { useGetSprint } from "@/app/feature/sprint/api/use-get-sprint";


export const NavigationBar = () => {
    const pathname = usePathname();
    const workspaceId = UseWorkspaceId();
    const { data: sprintData } = UseGetSprints({ workspaceId });
    const currentSprintId = sprintData?.documents?.[0]?.$id;
    const { data: teamsData } = useGetTeams({ workspaceId });

    const hasTeams = teamsData?.documents?.length && teamsData.documents.length > 0;
    const hasSprint = sprintData?.documents?.length && sprintData.documents.length > 0;
    const routes = [
        {
            label: "Home",
            href: "",
            icon: GoHome,
            activeIcon: GoHomeFill
        },
        {
            label: "My Task",
            href: "/tasks",
            icon: GoCheckCircle,
            activeIcon: GoCheckCircleFill,
        },
        {
            label: "Setting",
            href: "/settings",
            icon: Settings,
            activeIcon: SettingsIcon,
        },
        {
            label: "Member",
            href: "/members",
            icon: UserIcon,
            activeIcon: UserIcon,
        },
        ...(hasTeams ? [{
            label: "Team",
            href: "/view-teams",
            icon: TreePalmIcon,
            activeIcon: UserIcon,
        }] : []),
        {
            label: "Backlog",
            href: "/backlog-tasks",
            icon: ListTodo,
            activeIcon: ListTodo,
        },
        ...(hasSprint ? [{
            label: "Sprint",
            href: currentSprintId ? `/sprint` : "/sprint",
            icon: Rocket,
            activeIcon: Rocket,
        }] : [])

    ]

    return (
        <ul className="flex flex-col">
            {routes.map((item) => {
                const fullHref = `/workspaces/${workspaceId}${item.href}`
                const isActive = pathname === fullHref;
                const Icon = isActive ? item.activeIcon : item.icon;
                return (
                    <div key={item.href}>
                        <Link href={fullHref}>
                            <div className={cn("flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500", isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
                            )}>

                                <Icon className="size-5 text-neutral-500" /> {item.label}
                            </div>
                        </Link>
                    </div>
                );
            })
            }
        </ul>
    );

}
