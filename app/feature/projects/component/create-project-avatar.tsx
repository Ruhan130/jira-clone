// import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
interface ProjectAvatarProps {
    image?: string | null;
    name: string;
    className?: string;
    FallBackClassName?: string;
}

export const ProjectAvatar = ({ image, name, className, FallBackClassName }: ProjectAvatarProps) => {
    // ✅ FIXED: Proper validation for image
    const hasValidImage = image &&
        image !== "" &&
        image !== "undefined" &&
        image !== "null" &&
        image.trim() !== "";

    if (hasValidImage) {
        return (
            <div className={cn("size-5 relative overflow-hidden rounded-md", className)}>
                <Image
                    src={image} 
                    alt={name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                        console.log("ProjectAvatar image error:", image);
                       
                        e.currentTarget.style.display = 'none';
                    }}
                />
            </div>
        );
    }

    return (
        <Avatar className={cn("size-5 rounded-md", className)}>
            <AvatarFallback className={cn("text-white bg-blue-600 font-semibold text-sm uppercase rounded-md", FallBackClassName)}>
                {name[0]}
            </AvatarFallback>
        </Avatar>
    );
};