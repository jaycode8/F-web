import { useState, useRef, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Sun, Moon, Folder, LogOut, User, X, Camera, Eye, EyeOff, Upload } from "lucide-react";
import axios from "axios";
import api from "../helpers/Api.jsx";
import { useToast } from "../context/Toast.jsx";

const BASE_URL = import.meta.env.VITE_STORAGE_URL;
const fileUrl = (path) => path ? `${BASE_URL}/${path}` : null;

const useTheme = () => {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") ?? "dark");
    useEffect(() => {
        document.body.className = theme === "dark" ? "dark" : "";
        localStorage.setItem("theme", theme);
    }, [theme]);
    return { theme, toggle: () => setTheme(t => t === "dark" ? "light" : "dark") };
};

const Avatar = ({ user, size = "md" }) => {
    const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm" };
    const avatarUrl = user?.avatar ? fileUrl(user.avatar) : null;
    const initials = user?.fullName?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "?";
    return avatarUrl ? (
        <img src={avatarUrl} alt={user.fullName} className={`${sizes[size]} rounded-full object-cover`} />
    ) : (
        <div className={`${sizes[size]} rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary`}>
            {initials}
        </div>
    );
};

const ProfileModal = ({ user, onClose }) => {
    const toast = useToast();
    const queryClient = useQueryClient();
    const inputRef = useRef(null);
    const [tab, setTab] = useState("profile");
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState({
        fullName: user?.fullName ?? "",
        email: user?.email ?? "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [saving, setSaving] = useState(false);
    const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleAvatarUpload = async (file) => {
        if (!file) return;
        setUploading(true);
        try {
            const tokenRes = await api.post("/files/upload-url", {
                originalName: file.name,
                mimeType: file.type,
            });
            const { uploadUrl, absolutePath } = tokenRes.data.data;
            await axios.put(uploadUrl, file, { headers: { "Content-Type": file.type } });
            await api.patch(`/users/${user.id}`, { avatar: absolutePath });
            queryClient.invalidateQueries({ queryKey: ["me"] });
            toast.success("Avatar updated");
        } catch {
            toast.error("Could not update avatar");
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!form.fullName.trim()) return toast.error("Full name is required");
        setSaving(true);
        try {
            await api.patch(`/users/${user.id}`, { fullName: form.fullName.trim(), email: form.email.trim() });
            queryClient.invalidateQueries({ queryKey: ["me"] });
            toast.success("Profile updated");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Could not update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (form.newPassword !== form.confirmPassword) return toast.error("Passwords do not match");
        setSaving(true);
        try {
            await api.patch(`/users/${user.id}`, {
                password: form.newPassword,
            });
            toast.success("Password changed");
            set("newPassword", ""); set("confirmPassword", "");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Could not change password");
        } finally {
            setSaving(false);
        }
    };

    const pwdInput = (field, placeholder) => (
        <div className="relative">
            <input
                type={showPwd[field] ? "text" : "password"}
                placeholder={placeholder}
                value={form[field]}
                onChange={e => set(field, e.target.value)}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm bg-surface border border-border text-text
                    placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <button type="button" onClick={() => setShowPwd(p => ({ ...p, [field]: !p[field] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors">
                {showPwd[field] ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        </div>
    );

    const tabs = [{ id: "profile", label: "Profile" }, { id: "password", label: "Password" }];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
                    <h2 className="text-base font-bold text-text">My account</h2>
                    <button onClick={onClose} className="text-muted hover:text-text transition-colors p-1 rounded-lg hover:bg-surface">
                        <X size={16} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Avatar user={user} size="md" />
                            <button
                                onClick={() => inputRef.current?.click()}
                                disabled={uploading}
                                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100
                                    flex items-center justify-center transition-opacity disabled:cursor-not-allowed">
                                {uploading
                                    ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    : <Camera size={12} className="text-white" />
                                }
                            </button>
                            <input ref={inputRef} type="file" accept="image/*" className="hidden"
                                onChange={e => handleAvatarUpload(e.target.files[0])} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-text">{user?.fullName}</p>
                            <p className="text-xs text-muted">{user?.email}</p>
                            <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/15 text-primary capitalize">
                                {user?.role}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-1 p-1 bg-surface rounded-xl border border-border">
                        {tabs.map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors
                                    ${tab === t.id ? "bg-card text-text shadow-sm" : "text-muted hover:text-text"}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {tab === "profile" && (
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-muted uppercase tracking-widest">Full name</label>
                                <input value={form.fullName} onChange={e => set("fullName", e.target.value)}
                                    placeholder="Jane Doe"
                                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-surface border border-border text-text
                                        placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-muted uppercase tracking-widest">Email</label>
                                <input value={form.email} onChange={e => set("email", e.target.value)}
                                    placeholder="jane@example.com"
                                    className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-surface border border-border text-text
                                        placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                            </div>
                            <div className="space-y-1 pt-1">
                                <p className="text-[11px] text-muted">Username: <span className="text-text font-medium">@{user?.username}</span></p>
                                <p className="text-[11px] text-muted">Member since: <span className="text-text font-medium">{new Date(user?.createdAt).toLocaleDateString()}</span></p>
                            </div>
                            <button onClick={handleSaveProfile} disabled={saving}
                                className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-secondary
                                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                Save changes
                            </button>
                        </div>
                    )}

                    {tab === "password" && (
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-muted uppercase tracking-widest">New password</label>
                                {pwdInput("newPassword", "••••••••")}
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-muted uppercase tracking-widest">Confirm password</label>
                                {pwdInput("confirmPassword", "••••••••")}
                            </div>
                            <button onClick={handleChangePassword} disabled={saving}
                                className="w-full py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-secondary
                                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                Change password
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Topbar = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { theme, toggle } = useTheme();
    const [menuOpen, setMenuOpen] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const menuRef = useRef(null);

    const { data: user } = useQuery({ queryKey: ["me"], enabled: false });

    useEffect(() => {
        const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = async () => {
        try {
            await api.post("/auth/logout");
            queryClient.clear();
            navigate("/signin", { replace: true });
        } catch {
            toast.error("Could not sign out");
        }
    };

    return (
        <>
            <header className="fixed top-0 inset-x-0 z-40 h-14 bg-card border-b border-border flex items-center px-5 gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
                        <Folder size={13} className="text-white" />
                    </div>
                    <span className="font-black text-lg text-text tracking-tight">F</span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <button onClick={toggle}
                        className="p-2 rounded-lg text-muted hover:bg-surface hover:text-text transition-colors">
                        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    <div ref={menuRef} className="relative">
                        <button onClick={() => setMenuOpen(p => !p)}
                            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-surface border border-transparent hover:border-border transition-all">
                            <Avatar user={user} size="sm" />
                            <span className="text-sm font-semibold text-text hidden sm:block">{user?.fullName?.split(" ")[0]}</span>
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl p-1.5 z-50">
                                <div className="px-3 py-2 mb-1 border-b border-border">
                                    <p className="text-xs font-bold text-text truncate">{user?.fullName}</p>
                                    <p className="text-[11px] text-muted truncate">{user?.email}</p>
                                </div>
                                <button onClick={() => { setShowProfile(true); setMenuOpen(false); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-text hover:bg-surface rounded-lg transition-colors">
                                    <User size={14} className="text-muted" /> Profile
                                </button>
                                <button onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-danger/10 rounded-lg transition-colors">
                                    <LogOut size={14} /> Sign out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
        </>
    );
};

export default Topbar;
