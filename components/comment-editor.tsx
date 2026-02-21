"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";


import { Paperclip, Download, X, Image as ImageIcon } from "lucide-react";
import { CustomImage } from "@/components/custom-image";
import { useCallback, useRef, useState } from "react";

import { createMentionExtension } from "@/components/mention-setup";
import { cn } from "@/lib/utils";
import { useCreateComment } from "@/app/feature/tasks/api/use-create-comment";
import { UseWorkspaceId } from "@/app/feature/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/app/feature/members/api/use-get-members";

interface RichCommentEditorProps {
    mode: 'comment' | 'reply';
    targetId: string; // subtaskId for comments, parentCommentId for replies
    subtaskId: string; // Always needed for API call
    onSubmit?: () => void;
    onCancel?: () => void;
    placeholder?: string;
    autoFocus?: boolean;
    className?: string;
}

export default function RichCommentEditor({
    mode,
    targetId,
    subtaskId,
    onSubmit,
    onCancel,
    placeholder,
    autoFocus = false,
    className
}: RichCommentEditorProps) {
    const { mutate: createComment, isPending } = useCreateComment();
    const workspaceId = UseWorkspaceId();
    const { data: getMembersResponse } = useGetMembers({ workspaceId });
    const members = getMembersResponse?.documents || [];
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [attachments, setAttachments] = useState<Array<{
        id: string;
        name: string;
        url: string;
        type: string;
        size: number;
        file: File;
    }>>([]);

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
        autofocus: autoFocus,
    });


    const handleImageUpload = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const imageUrl = reader.result as string;
            if (editor) {
                editor.chain().focus().setImage({ src: imageUrl }).run();
            }

            if (imageInputRef.current) {
                imageInputRef.current.value = "";
            }
        };
        reader.readAsDataURL(file);
    }, [editor]);


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
                size: file.size,
                file: file
            };

            setAttachments(prev => [...prev, newAttachment]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        };
        reader.readAsDataURL(file);
    };


    const FileAttachment = ({ file, onRemove }: {
        file: { id: string; name: string; url: string; type: string; size: number; };
        onRemove: (id: string) => void;
    }) => {
        return (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                <span className="text-lg">{getFileIcon(file.type)}</span>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => window.open(file.url, '_blank')}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Download"
                    >
                        <Download size={14} />
                    </button>
                    <button
                        onClick={() => onRemove(file.id)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                        title="Remove"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        );
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


        const submitData = {
            content: html,
            attachments: JSON.stringify(attachments.map(att => ({
                name: att.name,
                url: att.url,
                type: att.type,
                size: att.size
            })))
        };


        if (mode === 'comment') {
            createComment({
                json: submitData,
                param: { subtaskId: targetId }
            });
        } else {

            createComment({
                json: {
                    ...submitData,
                    parentCommentId: targetId
                },
                param: { subtaskId }
            });
        }
        editor?.commands.clearContent();
        setAttachments([]);
        onSubmit?.();
    };


    const getSubmitButtonText = () => {
        if (isPending) {
            return mode === 'comment' ? 'Adding...' : 'Replying...';
        }
        return mode === 'comment' ? 'Add Comment' : 'Reply';
    };


    const handleRemoveAttachment = (id: string) => {

        setAttachments(prev => prev.filter(att => att.id !== id));

    };
    return (
        <div className={cn("w-full", className)}>
            <h3 className="py-0.5 text-sm font-medium text-gray-500">Add a comment</h3>
            <div className="border rounded-lg bg-white">
                {/*  Toolbar */}
                <div className="flex items-center justify-end gap-1 ">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => imageInputRef.current?.click()}
                        title="Add image"
                        className="h-8 w-8 p-0"
                    >
                        <ImageIcon size={16} />
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach file"
                        className="h-8 w-8 p-0"
                    >
                        <Paperclip size={16} />
                    </Button>
                </div>

                {/*  Editor */}
                <div className="min-h-[80px]">
                    <EditorContent
                        editor={editor}
                        placeholder={placeholder || (mode === 'comment' ? 'Add a comment...' : 'Reply to comment...')}
                    />
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

                {/*  Attachments Display Area */}
                <div className="px-2 pb-3">
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
            {/*  Action buttons */}
            <div className="flex justify-end gap-2 mt-3">
                {onCancel && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={isPending}
                    className="min-w-[100px]"
                >
                    {getSubmitButtonText()}
                </Button>
            </div>
        </div>
    );
}