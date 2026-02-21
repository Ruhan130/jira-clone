
"use client";
import { useMemo } from "react";
import { useReactToComment } from "../api/use-react-comment";
import { EmojiPicker } from "@/components/emoji-picker";
import { ReactionButton } from "@/components/reaction-button";

interface Reaction {
    emoji: string;
    userId: string;
    userName: string;
    createdAt: string;
}

interface ReactionListProps {
    reactions: Reaction[] | string;
    commentId: string;
    currentUserId: string;
}

export const ReactionList = ({ reactions, commentId, currentUserId }: ReactionListProps) => {
    const { mutate: reactToComment, isPending } = useReactToComment();

    console.log("=== REACTION DEBUG ===");
    console.log("Raw reactions:", reactions);
    console.log("Reactions type:", typeof reactions);
    console.log("Comment ID:", commentId);
    console.log("Current User ID:", currentUserId); 

    const parsedReactions = useMemo(() => {
        if (typeof reactions === 'string') {
            try {
                return JSON.parse(reactions) as Reaction[];
            } catch {
                return [];
            }
        }
        return reactions || [];
    }, [reactions]);


    const groupedReactions = useMemo(() => {
        const groups: Record<string, { count: number; users: string[]; hasReacted: boolean }> = {};

        parsedReactions.forEach((reaction) => {
            if (!groups[reaction.emoji]) {
                groups[reaction.emoji] = {
                    count: 0,
                    users: [],
                    hasReacted: false
                };
            }

            groups[reaction.emoji].count++;
            groups[reaction.emoji].users.push(reaction.userName);

            if (reaction.userId === currentUserId) {
                groups[reaction.emoji].hasReacted = true;
            }
        });

        return groups;
    }, [parsedReactions, currentUserId]);

    const handleReactionClick = (emoji: string, hasReacted: boolean) => {
        reactToComment({
            json: {
                emoji,
                action: hasReacted ? "remove" : "add"
            },
            param: { commentId }
        });
    };

    const handleEmojiSelect = (emoji: string) => {
        reactToComment({
            json: { emoji, action: "add" },
            param: { commentId }
        });
    };

    if (Object.keys(groupedReactions).length === 0) {
        return (
            <div className="flex items-center gap-1 mt-2">
                <EmojiPicker onEmojiSelect={handleEmojiSelect} disabled={isPending} />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-1 mt-2 flex-wrap">
            {Object.entries(groupedReactions).map(([emoji, data]) => (
                <ReactionButton
                    key={emoji}
                    emoji={emoji}
                    count={data.count}
                    hasReacted={data.hasReacted}
                    onClick={() => handleReactionClick(emoji, data.hasReacted)}
                    disabled={isPending}
                />
            ))}
            <EmojiPicker onEmojiSelect={handleEmojiSelect} disabled={isPending} />
        </div>
    );
};