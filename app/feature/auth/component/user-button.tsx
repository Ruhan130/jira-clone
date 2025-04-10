"use client";
import { Loader, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger }
    from "@radix-ui/react-dropdown-menu";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { useCurrent } from "../api/use-current";
import { useLogout } from "../api/use-logout";

export const UserButton = () => {
    const { data: user, isLoading } = useCurrent();
    const { mutate : logout } = useLogout();

    if (isLoading) {
        return (
            <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
                <Loader className="size-4 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return null;
    }
    const { name, email } = user;
    const avatarFallbackText = name
        ? name.charAt(0).toUpperCase()
        : email.charAt(0).toUpperCase() ?? "U";
    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="outline-none relative">
                <Avatar className="size-10 hover:opacity-75  rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
                    <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 ">
                        {avatarFallbackText}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger >
            <DropdownMenuContent align="end" side="bottom" className="w-60 border border-r-neutral-200 rounded-lg shadow-2xl " sideOffset={10} >
                <div className="flex flex-col items-center justify-center px-2.5 gap-2 py-4 " >
                    <Avatar className="size-10 hover:opacity-75  rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
                        <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
                            {avatarFallbackText}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-neutral-900" >{name || "User"}</p>
                        <p className="text-xs">
                            {email}
                        </p>
                    </div>
                </div>
                <DottedSeperator className="mb-1"/>
                <DropdownMenuItem className="flex justify-center items-center font-medium text-amber-700 h-10 cursor-pointer" onClick={()=> logout()}>
                    <LogOut className="mr-2 size-4"/>Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}