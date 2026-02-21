"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { ReadOnlyImage } from "@/components/read-only-image";
import Mention from "@tiptap/extension-mention";

interface CommentViewerProps {
    content: string;
    attachments?: string;
}

export const CommentViewer = ({ content, attachments }: CommentViewerProps) => {
    let parsedAttachments = [];
    try {
        parsedAttachments = attachments ? JSON.parse(attachments) : [];
    } catch {
        parsedAttachments = [];
    }
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: true,
                HTMLAttributes: {
                    class: 'text-blue-600 underline hover:text-blue-800',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-sm h-auto rounded-lg',
                },
            }),
            ReadOnlyImage,
            Mention.configure({
                HTMLAttributes: {
                    class: 'mention bg-blue-100 text-blue-800 px-1 py-0.5 rounded font-medium cursor-pointer hover:bg-blue-200',
                },
                renderLabel({ options, node }) {
                    return `@${node.attrs.label}`;
                },

                suggestion: {
                    items: () => [],
                },
            }),
        ],
        content: content,
        editable: false,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none [&_p]:mb-2 [&_p]:mt-0 [&_img]:max-w-sm [&_img]:h-auto [&_img]:rounded-lg',
            },
        },
    });

    return (
        <div className="comment-viewer">
            <EditorContent editor={editor} />

            {parsedAttachments.length > 0 && (
                <div className="mt-3 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Attachments</h4>
                    <div className="space-y-2">
                        {parsedAttachments.map((attachment: any, index: number) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                                <span className="text-lg">
                                    {attachment.type?.includes('pdf') ? '📄' :
                                        attachment.type?.includes('doc') ? '📝' :
                                            attachment.type?.includes('excel') ? '📊' : '📎'}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {Math.round(attachment.size / 1024)} KB
                                    </p>
                                </div>
                                <button
                                    onClick={() => window.open(attachment.url, '_blank')}
                                    className="p-1 hover:bg-gray-200 rounded"
                                >
                                    📥
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};