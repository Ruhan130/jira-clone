"use client" ;
import { cn } from "@/lib/utils";
import { Settings, SettingsIcon, UserIcon } from "lucide-react"
import Link from "next/link";
import { GoCheckCircle, GoCheckCircleFill, GoHome, GoHomeFill } from "react-icons/go"
import { NavBar } from "./navBar";
import { usePathname } from "next/navigation";
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";

export const NavigationBar = () => {
    const pathname = usePathname();
    const workspaceId = UseWorkspaceId();
    const routes = [
        {
            label: "Home",
            href: "",
            icon: GoHome,
            activeIcon: GoHomeFill
        },
        {
            label: "My Task",
            href: "/task",
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
    ]

    return (
        <ul className="flex flex-col">
            {routes.map((item) => {
                const fullHref = `/workspaces/${workspaceId}${item.href}`
                const isActive = pathname === fullHref;
                const Icon = isActive ? item.activeIcon : item.icon;
                return (
                    <div>
                        <Link key={item.href} href={fullHref}>
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
