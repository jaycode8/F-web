import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, ChevronDown, LogOut, User, Building2, Sun, Moon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../helpers/Api";
import { useToast } from "../contex/Toast";
import ProfileModal from "../users/ProfileModal.jsx";

const fetchMe = () => api.get("/auth").then(r => r.data.data);

const useTheme = () => {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") ?? "dark");

    useEffect(() => {
        document.body.className = theme === "dark" ? "dark" : "";
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggle = () => setTheme(t => t === "dark" ? "light" : "dark");

    return { theme, toggle };
};

const pageLabel = (pathname) => {
    const seg = pathname.split("/")[1];
    return seg ? seg.charAt(0).toUpperCase() + seg.slice(1) : "Dashboard";
};

const Avatar = ({ name }) => {
    const initials = name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    return (
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black shrink-0">
            {initials}
        </div>
    );
};

const TopBar = ({ toggleSideBar, collapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();
    const [open, setOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const dropdownRef = useRef(null);
    const { theme, toggle } = useTheme();

    const { data: user = {} } = useQuery({
        queryKey: ["me"],
        queryFn: fetchMe,
        staleTime: 5 * 60_000,
    });

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const logOut = async () => {
        try {
            await api.post("/auth/logout");
            navigate("/signin");
        } catch {
            toast.error("Unable to complete action. Try again later");
        }
    };

    return (
        <>
            <nav className="fixed top-0 z-40 w-full bg-bg border-b border-border transition-all duration-300">
                <div className={`flex items-center justify-between h-14 px-4 sm:px-6
                    ${collapsed ? "lg:pl-20" : "lg:pl-64"} transition-all duration-300`}>

                    <div className="flex items-center gap-3">
                        <button onClick={toggleSideBar}
                            className="lg:hidden p-2 rounded-lg text-muted hover:bg-surface transition-colors">
                            <Menu size={18} />
                        </button>
                        <h1 className="text-sm font-bold text-text uppercase tracking-wider">
                            {pageLabel(location.pathname)}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {user?.organization && (
                            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted border border-dashed border-border rounded-lg px-3 py-1.5">
                                <Building2 size={13} />
                                <span className="font-medium">{user.organization.name}</span>
                                {user.organization.address && (
                                    <>
                                        <span className="text-border">|</span>
                                        <span>{user.organization.address}</span>
                                    </>
                                )}
                            </div>
                        )}

                        <button onClick={toggle}
                            className="p-2 rounded-lg text-muted hover:bg-surface hover:text-text transition-colors">
                            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                        </button>

                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setOpen(p => !p)}
                                className="flex items-center gap-2 cursor-pointer rounded-xl px-2 py-1.5 hover:bg-surface transition-colors">
                                {user?.avatar
                                    ? <img src={user.avatar} alt={user.username} className="w-8 h-8 rounded-full" />
                                    : <Avatar name={user?.fullName} />
                                }
                                <span className="hidden md:block text-sm font-semibold text-text">
                                    {user.username}
                                </span>
                                <ChevronDown size={14} className={`text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                            </button>

                            {open && (
                                <div className="absolute right-0 top-12 w-52 bg-bg border border-border rounded-xl shadow-lg overflow-hidden animate-[fadeIn_0.15s_ease]">
                                    <div className="px-4 py-3 bg-surface border-b border-border">
                                        <p className="text-sm font-bold text-text">{user.fullName}</p>
                                        <p className="text-xs text-muted truncate">{user.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={() => { setProfileOpen(true); setOpen(false); }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text hover:bg-surface transition-colors">
                                            <User size={15} className="text-muted" />
                                            Profile
                                        </button>
                                        <button onClick={logOut}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-surface transition-colors">
                                            <LogOut size={15} />
                                            Logout
                                        </button>
                                    </div>
                                    <div className="border-t border-border py-1">
                                        <a href="https://qwin.co.ke" target="_blank"
                                            className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-muted hover:bg-surface transition-colors">
                                            About Qwin
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(-6px); }
                        to   { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </nav>

            <ProfileModal
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                user={user}
            />
        </>
    );
};

export default TopBar;
