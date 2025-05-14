// import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
interface MemberAvatarProps {
    name: string;
    className?: string;
    FallbackClassName?: string;
}

export const MemberAvatar = ({ name, className, FallbackClassName }: MemberAvatarProps) => {

    return (
        <Avatar className={cn("size-6 transition border border-neutral-300 rounded-full", className)}>
            <AvatarFallback className={cn("bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center ", FallbackClassName)} >
                {name.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    )
}