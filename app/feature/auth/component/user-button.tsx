"use client";
import { Loader, LogOut } from "lucide-react";
import { DottedSeperator } from "@/components/dotted-seperater.tsx/dotted-seperater";
import { useCurrent } from "../api/use-current";
import { useLogout } from "../api/use-logout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const UserButton = () => {
    const { data: user, isLoading } = useCurrent();
    const { mutate: logout } = useLogout();

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

    const { name, email, profileImage } = user;
    const avatarFallbackText = name
        ? name.charAt(0).toUpperCase()
        : email.charAt(0).toUpperCase() ?? "U";

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger className="outline-none relative">
                {/* Simple Image Approach */}
                <div className="size-10 rounded-full overflow-hidden border border-neutral-300 hover:opacity-75 bg-neutral-200 flex items-center justify-center">
                    {profileImage ? (
                        <img
                            src={profileImage}
                            alt={name || "User"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Image fail hone pe fallback
                                e.currentTarget.style.display = 'none';
                                // e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <span
                        className="font-medium text-neutral-500 text-sm"
                        style={{ display: profileImage ? 'none' : 'flex' }}
                    >
                        {avatarFallbackText}
                    </span>
                </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                side="bottom"
                className="w-60 bg-white border border-neutral-200 rounded-lg shadow-lg z-50"
                sideOffset={10}
            >
                <div className="flex flex-col items-center justify-center px-2.5 gap-2 py-4">
                    {/* Dropdown Image */}
                    <div className="size-12 rounded-full overflow-hidden border border-neutral-300 bg-neutral-200 flex items-center justify-center">
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt={name || "User"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    // e.currentTarget.nextElementSibling.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <span
                            className="font-medium text-neutral-500 text-lg"
                            style={{ display: profileImage ? 'none' : 'flex' }}
                        >
                            {avatarFallbackText}
                        </span>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-neutral-900">{name || "User"}</p>
                        <p className="text-xs text-neutral-600">{email}</p>
                    </div>
                </div>

                <DottedSeperator className="mb-1" />

                <DropdownMenuItem
                    className="flex justify-center items-center font-medium text-amber-700 h-10 cursor-pointer hover:bg-neutral-50"
                    onClick={() => logout()}
                >
                    <LogOut className="mr-2 size-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};