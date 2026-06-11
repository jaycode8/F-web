import { Search, Plus, Upload, RefreshCw, Folder } from "lucide-react";

const LibraryHeader = ({ search, onSearchChange, onRefresh, onUpload, onNewFolder }) => (
    <header className="md:h-14 border-b border-border bg-card md:flex items-center gap-4 px-5 py-3 md:py-0 shrink-0">
        <div className="flex-1 max-w-md relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-4 py-1.5 rounded-lg text-sm bg-surface border border-border text-text
                    placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
        </div>

        <div className="ml-auto flex items-center gap-2 mt-2 md:mt-0">
            <button onClick={onRefresh}
                className="p-2 rounded-lg text-muted hover:bg-surface hover:text-text transition-colors">
                <RefreshCw size={15} />
            </button>
            <button onClick={onUpload}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold
                    bg-surface border border-border text-text hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors">
                <Upload size={14} /> Upload
            </button>
            <button onClick={onNewFolder}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-bold
                    bg-primary text-white hover:bg-secondary transition-colors shadow-sm shadow-primary/20">
                <Plus size={14} /> New
            </button>
        </div>
    </header>
);

export default LibraryHeader;
