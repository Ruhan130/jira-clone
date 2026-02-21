"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { useCreateComment } from "../api/use-create-comment";

import {
    Link as LinkIcon,
    Image as ImageIcon,
    Paperclip
} from "lucide-react";
import { CustomImage } from "@/components/custom-image";
import { useCallback, useRef, useState } from "react";
import { useGetMembers } from "../../members/api/use-get-members";
import { UseWorkspaceId } from "../../workspaces/hooks/use-workspace-id";
import { createMentionExtension } from "@/components/mention-setup";
import { FileAttachment } from "@/components/file-attachment";

interface ReplyEditorProps {
    parentCommentId: string;
    subtaskId: string;
    onReplySubmit?: () => void;
}

export default function ReplyEditor({ parentCommentId, subtaskId, onReplySubmit }: ReplyEditorProps) {
    const { mutate: createComment, isPending } = useCreateComment();
    const workspaceId = UseWorkspaceId();
    const { data: getMembersResponse } = useGetMembers({ workspaceId });
    const members = getMembersResponse?.documents || [];
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline hover:text-blue-800',
                },
            }),
            Image,
            CustomImage,
            createMentionExtension(members)

        ],
        content: "",
        editorProps: {
            attributes: {
                class: "prose prose-sm min-h-[80px] focus:outline-none [&_img]:max-w-[200px] [&_img]:h-auto [&_img]:rounded-lg p-3",
            },
        },
    });

    // Image upload handler (same as description)
    const handleImageUpload = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const imageUrl = reader.result as string;
            if (editor) {
                editor.chain().focus().setImage({ src: imageUrl }).run();
            }
        };
        reader.readAsDataURL(file);
    }, [editor]);


    const [attachments, setAttachments] = useState<Array<{
        id: string;
        name: string;
        url: string;
        type: string;
        size: number;
    }>>([]);

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64Data = reader.result as string;
            const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            const newAttachment = {
                id: fileId,
                name: file.name,
                url: base64Data,
                type: file.type,
                size: file.size
            };
            setAttachments(prev => [...prev, newAttachment]);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        };
        reader.readAsDataURL(file);
    };


    const handleRemoveAttachment = (id: string) => {
        setAttachments(prev => prev.filter(att => att.id !== id));
    };


    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return '📄';
        if (type.includes('doc')) return '📝';
        if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
        return '📎';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = () => {
        const html = editor?.getHTML();
        if (!html || html === '<p></p>') return;

        createComment({
            json: {
                content: html,
                parentCommentId: parentCommentId,
                attachments: JSON.stringify(attachments)
            },
            param: { subtaskId }
        });

        editor?.commands.clearContent();
        setAttachments([]);
        onReplySubmit?.();
    };

    return (
        <div>
            <div className="border rounded-lg bg-white">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => imageInputRef.current?.click()}
                >
                    <ImageIcon size={16} />
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Paperclip size={16} />
                </Button>


                {/* Editor */}
                <div className="min-h-[80px]">
                    <EditorContent editor={editor} />
                </div>




                {/* Hidden file inputs */}
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={imageInputRef}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                    }}
                />

                <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                    }}
                />

              <div className="px-2 pb-4">
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Attachments</h4>
                        <div className="space-y-2">
                            {attachments.map((attachment) => (
                                <FileAttachment
                                    key={attachment.id}
                                    file={attachment}
                                    onRemove={handleRemoveAttachment}
                                />
                            ))}
                        </div>
                    </div>
                )}
              </div>

            </div>
            <div className="flex justify-end mt-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReplySubmit}
                    disabled={isPending}
                >
                    Cancel
                </Button>
                <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={isPending}
                >
                    {isPending ? "Replying..." : "Reply"}
                </Button>
            </div>


        </div>

    );
}