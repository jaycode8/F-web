import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Folder, FolderPlus, ChevronRight, Home, Image, FileText, FileArchive, FileAudio, FileVideo, File, Download, Eye } from "lucide-react";
import api from "../helpers/Api.jsx";
import { useToast } from "../context/Toast.jsx";
import Pagination from "../../components/Pagination.jsx";
import LibraryHeader from "../partials/LibraryHeader.jsx";
import ContextMenu from "./ContextMenu.jsx";
import NewFolderModal from "./NewFolderModal.jsx";
import UploadModal from "./UploadModal.jsx";
import FilePreviewModal, { fileUrl } from "./FilePreviewModal.jsx";

const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const fileIcon = (mimeType) => {
    const cls = "w-5 h-5";
    if (mimeType?.startsWith("image/")) return <Image className={cls} />;
    if (mimeType?.startsWith("video/")) return <FileVideo className={cls} />;
    if (mimeType?.startsWith("audio/")) return <FileAudio className={cls} />;
    if (mimeType?.startsWith("application/") || mimeType?.startsWith("text/")) return <FileText className={cls} />;
    if (mimeType?.includes("zip") || mimeType?.includes("tar") || mimeType?.includes("rar")) return <FileArchive className={cls} />;
    return <File className={cls} />;
};

const Library = () => {
    const toast = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const parentId = searchParams.get("parentId") ?? null;

    const [items, setItems] = useState([]);
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [contextMenu, setContextMenu] = useState(null);
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [preview, setPreview] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (parentId) params.parentId = parentId;
            if (search.trim()) params.search = search.trim();
            const res = await api.get("/resources", { params });
            setItems(res.data.data);
            setPagination(res.data.pagination);
            setBreadcrumbs(res.data.breadcrumbs ?? []);
        } catch {
            toast.error("Could not load resources");
        } finally {
            setLoading(false);
        }
    }, [parentId, page, search]);

    useEffect(() => {
        setPage(1);
        setSearch("");
    }, [parentId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const folders = items.filter(i => i.type === "folder");
    const files = items.filter(i => i.type === "file");

    const navigateTo = (id) => {
        setSearchParams(id ? { parentId: id } : {});
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const currentFolderName = breadcrumbs.at(-1)?.name ?? null;

    return (
        <div className="min-h-dvh bg-bg flex flex-col" onContextMenu={handleContextMenu}>
            <LibraryHeader
                search={search}
                onSearchChange={(v) => { setSearch(v); setPage(1); }}
                onRefresh={fetchData}
                onUpload={() => setShowUpload(true)}
                onNewFolder={() => setShowNewFolder(true)}
            />

            <div className="flex items-center gap-1.5 px-5 py-3 text-xs text-muted border-b border-border bg-card">
                <button onClick={() => navigateTo(null)}
                    className="flex items-center gap-1 hover:text-text transition-colors">
                    <Home size={12} />
                    <span className={!parentId ? "text-text font-medium" : ""}>Home</span>
                </button>
                {breadcrumbs.map((crumb, i) => (
                    <span key={crumb.id} className="flex items-center gap-1.5">
                        <ChevronRight size={11} className="shrink-0" />
                        <button
                            onClick={() => navigateTo(crumb.id)}
                            className={`hover:text-text transition-colors ${i === breadcrumbs.length - 1 ? "text-text font-medium" : ""}`}
                        >
                            {crumb.name}
                        </button>
                    </span>
                ))}
            </div>

            <main className="flex-1 px-5 py-6 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <span className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {folders.length > 0 && (
                            <section>
                                <h2 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Folders</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                                    {folders.map(folder => (
                                        <button key={folder.id} onClick={() => navigateTo(folder.id)}
                                            className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border bg-card
                                                hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 text-left w-full">
                                            <Folder size={16} className="text-primary shrink-0" />
                                            <span className="text-sm text-text font-medium truncate flex-1">{folder.name}</span>
                                            <ChevronRight size={12} className="text-muted opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                                        </button>
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
                                            {file.mimeType?.startsWith("image/") ? (
                                                <div className="aspect-square overflow-hidden bg-surface relative">
                                                    <img src={fileUrl(file.absolutePath)} alt={file.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-150 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                                        <button onClick={() => setPreview(file)}
                                                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors">
                                                            <Eye size={14} />
                                                        </button>
                                                        <a href={fileUrl(file.absolutePath)} download={file.name}
                                                            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-colors">
                                                            <Download size={14} />
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="aspect-square flex items-center justify-center bg-surface text-muted relative">
                                                    {fileIcon(file.mimeType)}
                                                    <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => setPreview(file)}
                                                            className="p-2 rounded-lg bg-card border border-border hover:border-primary/40 text-muted hover:text-primary transition-colors">
                                                            <Eye size={14} />
                                                        </button>
                                                        <a href={fileUrl(file.absolutePath)} download={file.name}
                                                            className="p-2 rounded-lg bg-card border border-border hover:border-primary/40 text-muted hover:text-primary transition-colors">
                                                            <Download size={14} />
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="px-2.5 py-2">
                                                <p className="text-xs font-medium text-text truncate">{file.name}</p>
                                                <p className="text-[11px] text-muted mt-0.5">
                                                    {file.mimeType?.split("/")[1]?.toUpperCase()} · {formatBytes(file.size)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {folders.length === 0 && files.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
                                    <Folder size={20} className="text-muted" />
                                </div>
                                <p className="text-sm font-semibold text-text mb-1">
                                    {parentId ? "This folder is empty" : "Nothing here yet"}
                                </p>
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

            {pagination.totalPages > 1 && (
                <footer className="h-12 border-t border-border bg-card flex items-center justify-between px-5">
                    <span className="text-xs text-muted">Page {pagination.currentPage} of {pagination.totalPages}</span>
                    <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
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
                parentId={parentId}
                parentName={currentFolderName}
                onCreated={fetchData}
            />

            <UploadModal
                open={showUpload}
                onClose={() => setShowUpload(false)}
                parentId={parentId}
                onUploaded={fetchData}
            />

            <FilePreviewModal file={preview} onClose={() => setPreview(null)} />
        </div>
    );
};

export default Library;
