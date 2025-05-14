"use client";
import { UserButton } from "@/app/feature/auth/component/user-button"
import { ModleSidebar } from "./mobile-sidebar"
import { usePathname } from "next/navigation";

const pathnameMap = {
    "tasks": {
        title: "My Tasks",
        description: "View all of your tasks here",
    },
    "projects": {
        title: "My Project",
        description: "View tasks of your project"
    },
};

const defaultMap = {
    title: "Home",
    descriptiom: "Monitor all your project and tasks here"
}

export const NavBar = () => {
    const pathname = usePathname();
    const pathnameParts = pathname.split("/");
    const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

    const { title, description } = pathnameMap[pathnameKey] || defaultMap;
    return (
        <nav className="pt-4 px-6 flex items-center justify-between">
            <div className="flex-col hidden lg:flex">
                <h1 className="text-2xl font-semibold">
                    {title}
                </h1>
                <p className="text-muted-foreground and tasks here">
                    {description}   
                </p>
            </div>
            <ModleSidebar />
            <UserButton />
        </nav>
    )
}