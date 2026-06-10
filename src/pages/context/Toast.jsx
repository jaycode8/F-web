import { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

const ICONS = {
    success: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M20 6L9 17l-5-5" />
        </svg>
    ),
    error: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
    ),
    warning: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    info: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
};

const STYLES = {
    success: {
        bar: "bg-success",
        icon: "bg-success/15 text-success",
        title: "text-success",
    },
    error: {
        bar: "bg-danger",
        icon: "bg-danger/15 text-danger",
        title: "text-danger",
    },
    warning: {
        bar: "bg-warning",
        icon: "bg-warning/15 text-warning",
        title: "text-warning",
    },
    info: {
        bar: "bg-secondary",
        icon: "bg-secondary/15 text-secondary",
        title: "text-secondary",
    },
};

const LABELS = { success: "Success", error: "Error", warning: "Warning", info: "Info" };

let idCounter = 0;

function Toast({ toast, onRemove }) {
    const style = STYLES[toast.type] || STYLES.info;

    return (
        <div className={`
            relative flex items-start gap-3 w-80 max-w-[calc(100vw-2rem)]
            bg-card border border-border
            rounded-xl shadow-lg overflow-hidden
            animate-[slideIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)_both]
        `}>
            <div className={`absolute top-0 left-0 h-0.5 ${style.bar} animate-[shrink_4s_linear_forwards]`}
                style={{ width: "100%" }} />

            <div className="flex items-start gap-3 p-4 w-full">
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 ${style.icon}`}>
                    {ICONS[toast.type] || ICONS.info}
                </div>

                <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${style.title}`}>
                        {LABELS[toast.type] || "Notice"}
                    </p>
                    <p className="text-sm text-text leading-snug">
                        {toast.message}
                    </p>
                </div>

                <button
                    onClick={() => onRemove(toast.id)}
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-muted hover:text-text hover:bg-border transition-colors"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="w-3 h-3">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const remove = useCallback((id) => {
        clearTimeout(timers.current[id]);
        delete timers.current[id];
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = useCallback(
        (type, message, duration = 4000) => {
            const id = ++idCounter;
            setToasts((prev) => [...prev, { id, type, message }]);
            timers.current[id] = setTimeout(() => remove(id), duration);
        },
        [remove]
    );

    const api = {
        success: (msg, dur) => toast("success", msg, dur),
        error: (msg, dur) => toast("error", msg, dur),
        warning: (msg, dur) => toast("warning", msg, dur),
        info: (msg, dur) => toast("info", msg, dur),
    };

    return (
        <ToastContext.Provider value={api}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                {toasts.map((t) => (
                    <div key={t.id} className="pointer-events-auto">
                        <Toast toast={t} onRemove={remove} />
                    </div>
                ))}
            </div>
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(120%) scale(0.8); }
                    to   { opacity: 1; transform: translateX(0)   scale(1);   }
                }
                @keyframes shrink {
                    from { width: 100%; }
                    to   { width: 0%; }
                }
            `}</style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}
