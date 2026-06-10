import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import api from "../helpers/Api.jsx";
import { useToast } from "../context/Toast.jsx";

const NewFolderModal = ({ open, onClose, parentId, parentName, onCreated }) => {
    const toast = useToast();
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) { setName(""); setTimeout(() => inputRef.current?.focus(), 80); }
    }, [open]);

    if (!open) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setSubmitting(true);
        try {
            await api.post("/folders", { name: name.trim(), parentId: parentId ?? null });
            toast.success("Folder created");
            onCreated();
            onClose();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Could not create folder");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                    <h2 className="text-base font-bold text-text">New folder</h2>
                    <button onClick={onClose} className="text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-surface">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
                    <p className="text-xs text-muted">
                        Creating inside <span className="text-text font-medium">{parentName ?? "Home"}/</span>
                    </p>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-muted uppercase tracking-widest">Name</label>
                        <input
                            ref={inputRef}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="my-folder"
                            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-surface border border-border text-text
                                placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-1">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-muted hover:text-text rounded-xl border border-border hover:bg-surface transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting || !name.trim()}
                            className="px-4 py-2 text-sm font-bold bg-primary text-white rounded-xl
                                hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {submitting && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewFolderModal;
