"use client";

import {
    Paperclip,
} from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useCallback, useEffect, useRef, useState } from "react";
import { FcGallery } from "react-icons/fc";
import { CustomImage } from "@/components/custom-image";
import { toast } from "sonner";
import { FileAttachment } from "@/components/file-attachment";


interface FileAttachmentType {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
}
interface Props {
    value: string;
    onChange: (value: string) => void;
    attachments?: FileAttachmentType[];
    onAttachmentsChange?: (attachments: FileAttachmentType[]) => void;
}

export default function TiptapEditor({ value, onChange, attachments: attachmentsProp = [], onAttachmentsChange }: Props) {
    const [attachments, setAttachments] = useState<FileAttachmentType[]>(attachmentsProp);


    const useDebounce = (callback: Function, delay: number) => {
        const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout>();

        return useCallback((...args: any[]) => {
            if (debounceTimer) clearTimeout(debounceTimer);
            setDebounceTimer(setTimeout(() => callback(...args), delay));
        }, [callback, delay, debounceTimer]);
    };
    const debouncedOnChange = useDebounce((html: string) => {
        onChange(html);
    }, 500);


    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            CustomImage,
        ],
        content: value,
        onUpdate: ({ editor }) => {
            const htmlContent = editor.getHTML();
            debouncedOnChange(htmlContent);
        },


        editorProps: {
            attributes: {
                class: "prose min-h-[120px] focus:outline-none [&_img]:max-w-[300px] [&_img]:h-auto [&_img]:rounded-lg",
                // style: "max-width: 100%; height: auto;"
            },
        },

        autofocus: false,
        injectCSS: false,
        editable: true,
        immediatelyRender: false,
        parseOptions: {
            preserveWhitespace: "full"
        }
    });

    const handlePasteImage = useCallback((event: ClipboardEvent) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        Array.from(items).forEach((item) => {
            if (item.type.indexOf("image") === 0) {
                const file = item.getAsFile();
                if (!file) return;

                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result;
                    editor?.chain().focus().setImage({ src: base64 as string }).run();
                };
                reader.readAsDataURL(file);
            }
        });
    }, [editor]);

    useEffect(() => {
        if (!editor) return;

        const dom = editor.view.dom;
        dom.addEventListener("paste", handlePasteImage);

        return () => {
            dom.removeEventListener("paste", handlePasteImage);
        };
    }, [editor, handlePasteImage]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileAttachmentRef = useRef<HTMLInputElement>(null);


    const handleImageUpload = (file: File) => {
        console.log("Image upload started:", file.name);

        const reader = new FileReader();
        reader.onload = () => {
            const imageUrl = reader.result as string;
            console.log("Image converted to base64");

            if (editor) {
                editor.chain().focus().setImage({ src: imageUrl }).run();
                console.log("Image added to editor");
            }
        };
        reader.readAsDataURL(file);
    };



    const handleFileUpload = async (files: FileList | null) => {
        if (!files) return;

        for (const file of Array.from(files)) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`File ${file.name} is too large (max 10MB)`);
                continue;
            }

            // Convert each file to base64
            const reader = new FileReader();
            reader.onload = () => {
                const base64Data = reader.result as string;

                const newAttachment = {
                    id: Date.now().toString() + Math.random().toString(),
                    name: file.name,
                    url: base64Data,
                    type: file.type,
                    size: file.size,
                };

                const updatedAttachments = [...attachments, newAttachment];
                setAttachments(updatedAttachments);
                onAttachmentsChange?.(updatedAttachments);

                console.log("File uploaded:", file.name);
            };

            // Start reading file as base64
            reader.readAsDataURL(file);
        }
    };


    const handleRemoveAttachment = (id: string) => {
        const updatedAttachments = attachments.filter(att => att.id !== id);
        setAttachments(prev => prev.filter(att => att.id !== id));
        onAttachmentsChange?.(attachments.filter(att => att.id !== id));
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <FcGallery size={30} />
                </button>
                <button
                    type="button"
                    onClick={() => fileAttachmentRef.current?.click()}
                    className="p-1 hover:bg-gray-100 rounded"
                >
                    <Paperclip size={20} />
                </button>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                            Array.from(files).forEach((file) => {
                                handleImageUpload(file);
                            });
                        }
                        e.target.value = "";
                    }}
                />


                <input
                    type="file"
                    className="hidden"
                    multiple
                    ref={fileAttachmentRef}
                    onChange={(e) => {
                        if (e.target.files) {
                            handleFileUpload(e.target.files);
                        }
                    }}
                />
            </div>
            <EditorContent editor={editor} />
            <div className="space-y-2">
                {attachments.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Attachments</h4>
                        <div className="space-y-1">
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
    );
}