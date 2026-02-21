import { useState } from "react";
import { useCreateComment } from "../api/use-create-comment";
import { Button } from "@/components/ui/button";
import RichCommentEditor from "@/components/comment-editor";
interface CommentFormProps {
    subtaskId: string;
    parentCommentId?: string;
}

export const CommentForm = ({ subtaskId }: CommentFormProps) => {
    const [content, setContent] = useState("");
    const { mutate: createComment, isPending } = useCreateComment();

    const handleSubmit = (e: any) => {
        e.preventDefault();
        if (!content.trim()) return;

        createComment({
            json: { content },
            param: { subtaskId }
        });
        setContent("");
    };

    return (
    <div className="border-t p-4">
            {/*  */}
            <RichCommentEditor
                mode="comment"                          // ✅ Comment mode
                targetId={subtaskId}                    // ✅ subtaskId for comments
                subtaskId={subtaskId}                   // ✅ Always needed for API
                placeholder="Add a comment..."          // ✅ Same placeholder
                autoFocus={false}                       // ✅ Don't auto-focus
                className="w-full"                      // ✅ Full width
            />
        </div>
    );
};