import { Loader2, AlertTriangle } from "lucide-react";

/**
 * Reusable confirm modal.
 *
 * Props:
 *   open        boolean   — show/hide
 *   onClose     fn        — called on cancel or backdrop click
 *   onConfirm   fn        — called when user confirms
 *   isPending   boolean   — shows spinner on confirm button while mutation runs
 *   title       string    — modal heading
 *   message     string    — body text / description
 *   confirmText string    — confirm button label  (default "Confirm")
 *   variant     string    — "danger" | "warning" | "primary"  (default "danger")
 */
const VARIANTS = {
    danger: { icon: "bg-danger/10 text-danger", btn: "bg-danger hover:bg-danger/90 shadow-danger/20" },
    warning: { icon: "bg-warning/10 text-warning", btn: "bg-warning hover:bg-warning/90 shadow-warning/20" },
    primary: { icon: "bg-primary/10 text-primary", btn: "bg-primary hover:bg-primary/90 shadow-primary/20" },
};

const ConfirmModal = ({
    open,
    onClose,
    onConfirm,
    isPending = false,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Confirm",
    variant = "danger",
}) => {
    const v = VARIANTS[variant] ?? VARIANTS.danger;

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm h-dvh"
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm bg-bg border border-border rounded-2xl shadow-2xl overflow-hidden
                    animate-[confirmPop_0.18s_ease-out]"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${v.icon}`}>
                        <AlertTriangle size={22} />
                    </div>
                    <div>
                        <p className="text-base font-black text-text">{title}</p>
                        <p className="text-sm text-muted mt-1 leading-relaxed">{message}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 px-6 pb-6">
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="flex-1 py-2.5 text-sm font-bold text-muted border border-border rounded-xl
                            hover:bg-surface hover:text-text transition-all disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isPending}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold
                            text-white rounded-xl transition-all active:scale-[0.97]
                            shadow-md disabled:opacity-60 ${v.btn}`}
                    >
                        {isPending
                            ? <Loader2 size={15} className="animate-spin" />
                            : confirmText
                        }
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes confirmPop {
                    from { opacity: 0; transform: scale(0.95) translateY(6px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ConfirmModal;
