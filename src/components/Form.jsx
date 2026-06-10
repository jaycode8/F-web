export const Icon = ({ d, d2 }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        {d && <path d={d} />}{d2 && <path d={d2} />}
    </svg>
);

export const EyeOpen = () => <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8" d2="M12 9a3 3 0 100 6 3 3 0 000-6z" />;
export const EyeOff = () => <Icon d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" />;

export function Field({ label, error, icon, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold tracking-widest uppercase text-muted">
                {label}
            </label>
            <div className={`relative flex items-center rounded-lg border transition-all duration-200
                ${error
                    ? "border-danger bg-danger/5 shadow-[0_0_0_3px_rgba(220,38,38,0.1)]"
                    : "border-border bg-surface focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(39,174,96,0.1)]"
                }`}>
                {icon && (
                    <span className={`absolute left-3.5 transition-colors ${error ? "text-danger" : "text-muted"}`}>
                        {icon}
                    </span>
                )}
                {children}
            </div>
            {error && (
                <p className="flex items-center gap-1.5 text-xs text-danger animate-[fadeIn_0.2s_ease]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3 h-3 shrink-0">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

export function Input({ className = "", icon, ...props }) {
    return (
        <input
            className={`w-full bg-transparent ${icon ? "pl-10" : "pl-4"} pr-4 py-3 text-sm text-text
                placeholder:text-muted/50 outline-none rounded-lg ${className}`}
            {...props}
        />
    );
}

export function SelectInput({ className = "", children, ...props }) {
    return (
        <select
            className={`w-full bg-transparent pl-4 pr-8 py-3 text-sm text-text outline-none rounded-lg
                appearance-none cursor-pointer ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}

export function TextareaInput({ className = "", ...props }) {
    return (
        <textarea
            className={`w-full bg-transparent pl-4 pr-4 py-3 text-sm text-text
                placeholder:text-muted/50 outline-none rounded-lg resize-none ${className}`}
            {...props}
        />
    );
}
