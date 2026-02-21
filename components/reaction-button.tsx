"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReactionButtonProps {
    emoji: string;
    count: number;
    hasReacted: boolean;
    onClick: () => void;
    disabled?: boolean;
}

export const ReactionButton = ({ 
    emoji, 
    count, 
    hasReacted, 
    onClick, 
    disabled = false 
}: ReactionButtonProps) => {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "h-6 px-2 py-1 text-xs font-medium transition-all duration-200",
                "border border-gray-200 rounded-full",
                "hover:border-gray-300 hover:bg-gray-50",
                hasReacted && "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            <span className="mr-1">{emoji}</span>
            <span>{count}</span>
        </Button>
    );
};