import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const delta = 2;
    const left = Math.max(1, page - delta);
    const right = Math.min(totalPages, page + delta);

    if (left > 1) {
        pages.push(1);
        if (left > 2) pages.push("...");
    }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) {
        if (right < totalPages - 1) pages.push("...");
        pages.push(totalPages);
    }

    const btn = "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150";

    return (
        <div className="flex items-center gap-1">
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className={`${btn} text-muted hover:bg-surface hover:text-text disabled:opacity-30 disabled:cursor-not-allowed`}
            >
                <ChevronLeft size={15} />
            </button>

            {pages.map((p, i) =>
                p === "..." ? (
                    <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-muted text-sm">
                        ···
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`${btn} ${p === page
                            ? "bg-primary text-white"
                            : "text-muted hover:bg-surface hover:text-text"
                            }`}
                    >
                        {p}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className={`${btn} text-muted hover:bg-surface hover:text-text disabled:opacity-30 disabled:cursor-not-allowed`}
            >
                <ChevronRight size={15} />
            </button>
        </div>
    );
};

export default Pagination;
