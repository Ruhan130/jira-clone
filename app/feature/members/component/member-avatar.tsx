import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberAvatarProps {
    name: string;
    className?: string;
    image?: string;
    FallbackClassName?: string;
}

export const MemberAvatar = ({ 
    name, 
    className, 
    FallbackClassName, 
    image 
}: MemberAvatarProps) => {

    return (
        <Avatar className={cn("size-6 transition border border-neutral-300 rounded-full", className)}>
            {/* Image component - agar image URL hai to show karo */}
            {image && (
                <AvatarImage 
                    src={image} 
                    alt={name}
                    className="object-cover"
                />
            )}
            
            {/* Fallback - agar image nahi load hui to letter show karo */}
            <AvatarFallback className={cn("bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center", FallbackClassName)}>
                {name.charAt(0).toUpperCase()}
            </AvatarFallback>
        </Avatar>
    );
};