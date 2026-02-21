// components/file-attachment.tsx
import { Paperclip, Download, X } from "lucide-react";

interface FileAttachmentProps {
    file: {
        id: string;
        name: string;
        url: string;
        type: string;
        size: number;
    };
    onRemove: (id: string) => void;
}

export const FileAttachment = ({ file, onRemove }: FileAttachmentProps) => {
    const getFileIcon = (type: string) => {
        if (type.includes('pdf')) return '📄';
        if (type.includes('doc')) return '📝';
        if (type.includes('excel')) return '📊';
        return '📎';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

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
                >
                    <Download size={14} />
                </button>
                <button
                    onClick={() => onRemove(file.id)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};