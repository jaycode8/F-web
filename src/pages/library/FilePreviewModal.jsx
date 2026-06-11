import { useEffect, useRef } from "react";
import { X, Download, FileText, FileArchive, FileAudio, File } from "lucide-react";

const BASE_URL = import.meta.env.VITE_STORAGE_URL ?? "http://localhost:9000/test";

export const fileUrl = (absolutePath) => `${BASE_URL}/${absolutePath}`;

const FilePreviewModal = ({ file, onClose }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    useEffect(() => {
        return () => { if (videoRef.current) videoRef.current.pause(); };
    }, []);

    if (!file) return null;

    const url = fileUrl(file.absolutePath);
    const isImage = file.mimeType?.startsWith("image/");
    const isVideo = file.mimeType?.startsWith("video/");
    const isAudio = file.mimeType?.startsWith("audio/");

    const renderPreview = () => {
        if (isImage) return (
            <img
                src={url}
                alt={file.name}
                className="max-h-[75vh] max-w-full object-contain rounded-xl"
            />
        );

        if (isVideo) return (
            <video
                ref={videoRef}
                src={url}
                controls
                autoPlay
                className="max-h-[75vh] max-w-full rounded-xl bg-black"
            />
        );

        if (isAudio) return (
            <div className="flex flex-col items-center gap-6 py-10 px-8">
                <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center">
                    <FileAudio size={32} className="text-primary" />
                </div>
                <p className="text-sm font-medium text-text text-center">{file.name}</p>
                <audio src={url} controls autoPlay className="w-full max-w-sm" />
            </div>
        );

        const icons = {
            document: <FileText size={36} className="text-primary" />,
            archive: <FileArchive size={36} className="text-primary" />,
        };

        return (
            <div className="flex flex-col items-center gap-5 py-12 px-10">
                <div className="w-20 h-20 rounded-2xl bg-surface border border-border flex items-center justify-center">
                    {icons[file.category] ?? <File size={36} className="text-muted" />}
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-text">{file.name}</p>
                    <p className="text-xs text-muted mt-1">{file.mimeType}</p>
                </div>
                <p className="text-xs text-muted">Preview not available for this file type</p>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative z-10 flex flex-col max-w-4xl w-full max-h-[90vh]">
                <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                        {file.mimeType && (
                            <span className="text-[11px] text-white/50 shrink-0">
                                {file.mimeType.split("/")[1]?.toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                        <a
                            href={url}
                            download={file.name}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20
                                text-white text-xs font-medium transition-colors"
                        >
                            <Download size={13} /> Download
                        </a>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                            <X size={15} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-center bg-black/40 rounded-2xl border border-white/10 overflow-hidden">
                    {renderPreview()}
                </div>
            </div>
        </div>
    );
};

export default FilePreviewModal;
