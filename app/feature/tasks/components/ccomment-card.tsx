import { AvatarImage } from "@/components/ui/avatar";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { formatDistanceToNow } from "date-fns";
import { useDeleteComment } from "../api/use-delete-comments";
import { useConform } from "@/hooks/use-confirm";
import ReplyEditor from "./reply-editor";
import { useState } from "react";
import { CommentViewer } from "./comment-viewer";
import { ReactionList } from "./reaction-list";

interface CommentCardProps {
    comment: {
        id: string;
        userName: string;
        userAvatar: string;
        content: string;
        createdAt: string;
        userId: string;
        reactions?: any;
        attachments?: string;
    };
    currentUserId: string;
    subtaskId: string;
    onReply: (commentId: string) => void;
}

export const CommentCard = ({ comment, currentUserId, onReply, subtaskId }: CommentCardProps) => {
    const { mutate: deleteComment, isPending } = useDeleteComment();
    const [showReply, setShowReply] = useState(false);

    const [DeleteDailogue, confirmDelete] = useConform(
        "Delete Project",
        "This action cannot be done",
        "destructive",
    );


    const handleDelete = async () => {
        const ok = await confirmDelete();
        if (!ok) return;

        deleteComment({
            param: {
                commentId: comment.id
            }
        });
    };
    return (
        <div className="flex gap-3 p-4 border-b">
            <DeleteDailogue />
            <Avatar className="h-8 w-8">
                <AvatarImage src={comment.userAvatar} />
                <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{comment.userName}</span>
                    <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt))} ago
                    </span>
                </div>  <div className="mt-1">
                    <CommentViewer content={comment.content} attachments={comment.attachments} />
                </div>

                <ReactionList
                    reactions={comment.reactions || []}
                    commentId={comment.id}
                    currentUserId={currentUserId}
                />

                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => setShowReply(!showReply)}
                        className="text-xs text-blue-600 hover:underline"
                    >
                        Reply
                    </button>
                    {comment.userId === currentUserId && (
                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="text-xs text-red-600 hover:underline disabled:opacity-50">
                            {isPending ? "Deleting..." : "Delete"}
                        </button>
                    )}

                </div>
                {showReply && (
                    <div className="mt-2 ml-6 w-full max-w-md">
                        <ReplyEditor
                            parentCommentId={comment.id}
                            subtaskId={subtaskId}
                            onReplySubmit={() => setShowReply(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};