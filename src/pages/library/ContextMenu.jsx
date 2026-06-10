import { useEffect, useRef } from "react";
import { FolderPlus, Upload, RefreshCw } from "lucide-react";

const ContextMenu = ({ x, y, onClose, onNewFolder, onUpload, onRefresh }) => {
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [onClose]);

    const item = "flex items-center gap-3 px-3 py-2 text-sm text-text hover:bg-surface rounded-lg cursor-pointer transition-colors";

    return (
        <div ref={ref} style={{ top: y, left: x }}
            className="fixed z-50 w-52 bg-card border border-border rounded-xl shadow-2xl p-1.5">
            <div className={item} onClick={() => { onNewFolder(); onClose(); }}>
                <FolderPlus size={15} className="text-muted" /> New Folder
            </div>
            <div className={item} onClick={() => { onUpload(); onClose(); }}>
                <Upload size={15} className="text-muted" /> File Upload
            </div>
            <div className="my-1 border-t border-border" />
            <div className={item} onClick={() => { onRefresh(); onClose(); }}>
                <RefreshCw size={15} className="text-muted" /> Refresh
            </div>
        </div>
    );
};

export default ContextMenu;
