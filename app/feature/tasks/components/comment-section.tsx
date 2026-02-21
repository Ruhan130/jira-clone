import { PageLoader } from "@/components/page-loader";
import { useCurrent } from "../../auth/api/use-current";
import { useGetComments } from "../api/use-get-commets";
import { CommentCard } from "./ccomment-card";
import { CommentForm } from "./comment-form";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface CommentSectionProps {
    subtaskId: string;
}

export const CommentSection = ({ subtaskId }: CommentSectionProps) => {
    const { data: comments, isLoading } = useGetComments(subtaskId);
    const { data: currentUser } = useCurrent();
    const currentUserId = currentUser?.$id ?? "";

    if (isLoading) return <PageLoader />;

    const parentComments = comments?.filter((c) => !c.parentCommentId) ?? [];
    const repliesMap = new Map<string, typeof comments>();

    comments?.forEach((comment) => {
        if (comment.parentCommentId) {
            if (!repliesMap.has(comment.parentCommentId)) {
                repliesMap.set(comment.parentCommentId, []);
            }
            repliesMap.get(comment.parentCommentId)?.push(comment);
        }
    });

    const renderComment = (comment: any, level: number = 0) => {
        const commentReplies = repliesMap.get(comment.$id) || [];

        return (
            <div key={comment.$id}>
                <div
                    className={`${level > 0 ? 'ml-8 bg-gray-50 border-l-2 border-blue-200 pl-4' : ''}`}
                >
                    <CommentCard
                        comment={{
                            id: comment.$id,
                            userName: comment.userName,
                            userAvatar: comment.userAvatar,
                            content: comment.content,
                            createdAt: comment.$createdAt,
                            userId: comment.userId,
                            reactions: comment.reaction,
                            attachments: comment.attachments
                        }}
                        currentUserId={currentUserId}
                        onReply={() => { }}
                        subtaskId={subtaskId}
                    />

                    {/* Recursive replies */}
                    {commentReplies.length > 0 && (
                        <div className="mt-2">
                            {commentReplies.map((reply) =>
                                renderComment(reply, level + 1)
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="mt-6">
            <h3 className="font-semibold text-lg mb-4">
                Comments ({parentComments.length})
            </h3>

            <div className="border rounded-lg">
                {/*  Recursive rendering */}
                {parentComments.map((comment) =>
                    renderComment(comment, 0)
                )}

                <CommentForm subtaskId={subtaskId} />
            </div>
        </div>
    );
};