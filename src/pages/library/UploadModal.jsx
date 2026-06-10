import { useState, useEffect, useRef } from "react";
import { X, Upload, HardDrive, Camera, Link as LinkIcon, FileText, FileArchive, FileAudio, FileVideo, File, Image } from "lucide-react";
import api from "../helpers/Api.jsx";
import { useToast } from "../context/Toast.jsx";

const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const fileIcon = (type) => {
    const cls = "w-4 h-4";
    switch (type) {
        case "image": return <Image className={cls} />;
        case "video": return <FileVideo className={cls} />;
        case "audio": return <FileAudio className={cls} />;
        case "document": return <FileText className={cls} />;
        case "archive": return <FileArchive className={cls} />;
        default: return <File className={cls} />;
    }
};

const UploadModal = ({ open, onClose, parentId, onUploaded }) => {
    const toast = useToast();
    const inputRef = useRef(null);
    const cameraRef = useRef(null);
    const streamRef = useRef(null);

    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [source, setSource] = useState("device");
    const [cameraActive, setCameraActive] = useState(false);
    const [facingMode, setFacingMode] = useState("user");

    useEffect(() => {
        if (!open) { stopCamera(); setFiles([]); setSource("device"); }
    }, [open]);

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        setCameraActive(false);
    };

    const startCamera = async (mode = facingMode) => {
        stopCamera();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
            streamRef.current = stream;
            if (cameraRef.current) cameraRef.current.srcObject = stream;
            setCameraActive(true);
        } catch {
            toast.error("Camera not accessible");
        }
    };

    const capturePhoto = () => {
        const canvas = document.createElement("canvas");
        canvas.width = cameraRef.current.videoWidth;
        canvas.height = cameraRef.current.videoHeight;
        canvas.getContext("2d").drawImage(cameraRef.current, 0, 0);
        canvas.toBlob(blob => {
            const f = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
            setFiles(p => [...p, f]);
            stopCamera();
            setSource("device");
        }, "image/jpeg", 0.92);
    };

    const addFiles = (incoming) => {
        setFiles(p => {
            const existing = new Set(p.map(f => f.name + f.size));
            return [...p, ...[...incoming].filter(f => !existing.has(f.name + f.size))];
        });
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        addFiles(e.dataTransfer.files);
    };

    const handleUpload = async () => {
        if (!files.length) return;
        setUploading(true);
        try {
            const form = new FormData();
            files.forEach(f => form.append("files", f));
            if (parentId) form.append("folderId", parentId);
            await api.post("/files/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success(`${files.length} file${files.length > 1 ? "s" : ""} uploaded`);
            onUploaded();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    if (!open) return null;

    const sources = [
        { id: "device", label: "My Device", icon: <HardDrive size={22} />, active: true },
        { id: "camera", label: "Camera", icon: <Camera size={22} />, active: true },
        {
            id: "drive", label: "Google Drive", icon: (
                <svg viewBox="0 0 87.3 78" className="w-[22px] h-[22px]">
                    <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L28.95 50H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
                    <path d="M43.65 25L29.05 0c-1.35.8-2.5 1.9-3.3 3.3L1.2 45.5c-.8 1.4-1.2 2.95-1.2 4.5h28.95z" fill="#00ac47" />
                    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75L86.1 54.5c.8-1.4 1.2-2.95 1.2-4.5H58.35L73.55 76.8z" fill="#ea4335" />
                    <path d="M43.65 25L58.25 0H29.05z" fill="#00832d" />
                    <path d="M58.35 50H87.3c0-1.55-.4-3.1-1.2-4.5L62.2 3.3C61.4 1.9 60.25.8 58.9 0L43.65 25z" fill="#2684fc" />
                    <path d="M28.95 50L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.1-.45 4.5-1.2L58.35 50z" fill="#ffba00" />
                </svg>
            ), active: false
        },
        { id: "link", label: "Link", icon: <LinkIcon size={22} />, active: false },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                    <h2 className="text-base font-bold text-text">Upload files</h2>
                    <button onClick={onClose} className="text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-surface">
                        <X size={16} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    <div className="grid grid-cols-4 gap-2">
                        {sources.map(s => (
                            <button key={s.id}
                                onClick={() => {
                                    if (!s.active) return;
                                    setSource(s.id);
                                    if (s.id === "camera") startCamera();
                                    else stopCamera();
                                }}
                                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-150
                                    ${s.id === source && s.active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"}
                                    ${s.active ? "hover:border-primary/50 hover:text-text cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                            >
                                {s.icon}
                                <span className="text-[11px] font-medium leading-tight text-center">{s.label}</span>
                                {!s.active && (
                                    <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold bg-surface border border-border text-muted px-1 rounded-full">
                                        Soon
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {source === "camera" && (
                        <div className="space-y-3">
                            <div className="relative rounded-xl overflow-hidden bg-surface aspect-video">
                                <video ref={cameraRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                {!cameraActive && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <button onClick={() => startCamera()}
                                            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl">
                                            Start camera
                                        </button>
                                    </div>
                                )}
                            </div>
                            {cameraActive && (
                                <div className="flex items-center gap-2">
                                    <button onClick={capturePhoto}
                                        className="flex-1 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-secondary transition-colors">
                                        Capture
                                    </button>
                                    <button
                                        onClick={() => {
                                            const m = facingMode === "user" ? "environment" : "user";
                                            setFacingMode(m);
                                            startCamera(m);
                                        }}
                                        className="px-3 py-2.5 border border-border text-muted hover:text-text rounded-xl text-xs font-medium hover:bg-surface transition-colors">
                                        Flip
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {source === "device" && (
                        <div
                            onDragOver={e => { e.preventDefault(); setDragging(true); }}
                            onDragLeave={() => setDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-150
                                ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/40 hover:bg-surface"}`}
                        >
                            <Upload size={24} className="mx-auto mb-2 text-muted" />
                            <p className="text-sm text-text font-medium">Drop files here or <span className="text-primary">browse</span></p>
                            <p className="text-xs text-muted mt-1">Any file type, multiple at once</p>
                            <input ref={inputRef} type="file" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
                        </div>
                    )}

                    {files.length > 0 && (
                        <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                            {files.map((f, i) => (
                                <li key={i} className="group flex items-center gap-3 px-3 py-2 rounded-lg bg-surface border border-border">
                                    <span className="text-muted">{fileIcon(f.type.split("/")[0])}</span>
                                    <span className="flex-1 text-xs text-text truncate">{f.name}</span>
                                    <span className="text-xs text-muted shrink-0">{formatBytes(f.size)}</span>
                                    <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                                        className="opacity-0 group-hover:opacity-100 text-muted hover:text-danger transition-all">
                                        <X size={13} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    {files.length > 0 && (
                        <button onClick={handleUpload} disabled={uploading}
                            className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-secondary
                                transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {uploading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            {uploading ? "Uploading..." : `Upload ${files.length} file${files.length > 1 ? "s" : ""}`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
