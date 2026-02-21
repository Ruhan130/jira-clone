
"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    disabled?: boolean;
}

const REACTIONS = ['👍', '👎', '😄', '❤️', '🔥', '🎉'];

export const EmojiPicker = ({ onEmojiSelect, disabled = false }: EmojiPickerProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleEmojiClick = (emoji: string) => {
        onEmojiSelect(emoji);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className="h-6 w-6 p-0 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            >
                <Plus size={12} />
            </Button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute bottom-8 left-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                        <div className="flex gap-1">
                            {REACTIONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleEmojiClick(emoji)}
                                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
                                >
                                    <span className="text-lg">{emoji}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};