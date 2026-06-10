import { useState, useEffect, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Search, Plus, Upload, RefreshCw, Folder, FolderPlus, ChevronRight, Home, Image, FileText, FileArchive, FileAudio, FileVideo, File } from "lucide-react";
import api from "../helpers/Api.jsx";
import { useToast } from "../context/Toast.jsx";
import Pagination from "../../components/Pagination.jsx";
import ContextMenu from "./ContextMenu.jsx";
import NewFolderModal from "./NewFolderModal.jsx";
import UploadModal from "./UploadModal.jsx";

const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const fileIcon = (category) => {
    const cls = "w-5 h-5";
    switch (category) {
        case "image": return <Image className={cls} />;
        case "video": return <FileVideo className={cls} />;
        case "audio": return <FileAudio className={cls} />;
        case "document": return <FileText className={cls} />;
        case "archive": return <FileArchive className={cls} />;
        default: return <File className={cls} />;
    }
};

const FolderDetails = () => {
    const { id } = useParams();
    const toast = useToast();

    const [folder, setFolder] = useState(null);
    const [files, setFiles] = useState([]);
    const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [contextMenu, setContextMenu] = useState(null);
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [showUpload, setShowUpload] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (search.trim()) params.search = search.trim();
            const res = await api.get(`/folders/${id}`, { params });
            const d = res.data.data;
            setFolder(d);
        } catch {
            toast.error("Could not load folder");
        } finally {
            setLoading(false);
        }
    }, [id, page, search]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const subfolders = folder?.subfolders ?? [];

    return (
        <div className="min-h-dvh bg-bg flex flex-col" onContextMenu={handleContextMenu}>
            <header className="h-14 border-b border-border bg-card flex items-center gap-4 px-5 shrink-0">
                <div className="flex items-center gap-2 mr-2">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
                        <Folder size={13} className="text-white" />
                    </div>
                    <span className="font-black text-lg text-text tracking-tight">F</span>
                </div>

                <div className="flex-1 max-w-md relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search in folder..."
                        className="w-full pl-8 pr-4 py-1.5 rounded-lg text-sm bg-surface border border-border text-text
                            placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <button onClick={fetchData}
                        className="p-2 rounded-lg text-muted hover:bg-surface hover:text-text transition-colors">
                        <RefreshCw size={15} />
                    </button>
                    <button onClick={() => setShowUpload(true)}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold
                            bg-surface border border-border text-text hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors">
                        <Upload size={14} /> Upload
                    </button>
                    <button onClick={() => setShowNewFolder(true)}
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-bold
                            bg-primary text-white hover:bg-secondary transition-colors shadow-sm shadow-primary/20">
                        <Plus size={14} /> New
                    </button>
                </div>
            </header>

            <div className="flex items-center gap-1.5 px-5 py-3 text-xs text-muted border-b border-border bg-card">
                <Link to="/library" className="hover:text-text transition-colors flex items-center gap-1">
                    <Home size={12} /> Home
                </Link>
                <ChevronRight size={11} className="shrink-0" />
                {folder?.parentId && (
                    <>
                        <Link to={`/folder/${folder.parentId}`} className="hover:text-text transition-colors">
                            ...
                        </Link>
                        <ChevronRight size={11} className="shrink-0" />
                    </>
                )}
                <span className="text-text font-medium">{folder?.name ?? "..."}</span>
            </div>

            <main className="flex-1 px-5 py-6 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <span className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {subfolders.length > 0 && (
                            <section>
                                <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Folders</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                                    {subfolders.map(sub => (
                                        <Link key={sub.id} to={`/folder/${sub.id}`}
                                            className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border bg-card
                                                hover:border-primary/40 hover:bg-primary/5 transition-all duration-150">
                                            <Folder size={16} className="text-primary shrink-0" />
                                            <span className="text-sm text-text font-medium truncate flex-1">{sub.name}</span>
                                            <ChevronRight size={12} className="text-muted opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}

                        {files.length > 0 && (
                            <section>
                                <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Files</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                    {files.map(file => (
                                        <div key={file.id}
                                            className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all duration-150">
                                            {file.category === "image" ? (
                                                <div className="aspect-square overflow-hidden bg-surface">
                                                    <img src={file.absolutePath} alt={file.originalName}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                                </div>
                                            ) : (
                                                <div className="aspect-square flex items-center justify-center bg-surface text-muted">
                                                    {fileIcon(file.category)}
                                                </div>
                                            )}
                                            <div className="px-2.5 py-2">
                                                <p className="text-xs font-medium text-text truncate">{file.originalName}</p>
                                                <p className="text-[11px] text-muted mt-0.5">
                                                    {file.mimeType?.split("/")[1]?.toUpperCase()} · {formatBytes(file.fileSizeBytes)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {subfolders.length === 0 && files.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
                                    <Folder size={20} className="text-muted" />
                                </div>
                                <p className="text-sm font-semibold text-text mb-1">This folder is empty</p>
                                <p className="text-xs text-muted mb-4">Right-click anywhere or use the buttons above</p>
                                <button onClick={() => setShowNewFolder(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-secondary transition-colors">
                                    <FolderPlus size={14} /> New Folder
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {meta.totalPages > 1 && (
                <footer className="h-12 border-t border-border bg-card flex items-center justify-between px-5">
                    <span className="text-xs text-muted">Page {meta.page} of {meta.totalPages}</span>
                    <Pagination page={page} totalPages={meta.totalPages} onPageChange={setPage} />
                </footer>
            )}

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x} y={contextMenu.y}
                    onClose={() => setContextMenu(null)}
                    onNewFolder={() => setShowNewFolder(true)}
                    onUpload={() => setShowUpload(true)}
                    onRefresh={fetchData}
                />
            )}

            <NewFolderModal
                open={showNewFolder}
                onClose={() => setShowNewFolder(false)}
                parentId={id}
                parentName={folder?.name}
                onCreated={fetchData}
            />

            <UploadModal
                open={showUpload}
                onClose={() => setShowUpload(false)}
                parentId={id}
                onUploaded={fetchData}
            />
        </div>
    );
};

export default FolderDetails;
