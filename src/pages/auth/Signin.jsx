import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/Toast.jsx";
import { Field, Input, Icon, EyeOpen, EyeOff } from "../../components/Form.jsx";
import api from "../helpers/Api.jsx";
import { Sun, Moon } from "lucide-react";

const iUser = { d: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", d2: "M12 3a4 4 0 100 8 4 4 0 000-8z" };
const iLock = { d: "M19 11H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2z", d2: "M7 11V7a5 5 0 0110 0v4" };

const useTheme = () => {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") ?? "dark");

    useEffect(() => {
        document.body.className = theme === "dark" ? "dark" : "";
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggle = () => setTheme(t => t === "dark" ? "light" : "dark");

    return { theme, toggle };
};

const Toggle = ({ checked, onChange, label, hint }) => (
    <div className="flex items-center justify-between gap-3">
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none
                ${checked ? "bg-primary" : "bg-border"}`}
        >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200
                ${checked ? "left-5" : "left-1"}`}
            />
        </button>
        <div>
            <p className="text-sm font-semibold text-text">{label}</p>
            {hint && <p className="text-xs text-muted mt-0.5">{hint}</p>}
        </div>
    </div>
);

const SignIn = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const { theme, toggle } = useTheme();

    const [form, setForm] = useState({ identifier: "", password: "" });
    const [errors, setErrors] = useState({});
    const [showPwd, setShowPwd] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [remember, setRemember] = useState(false);

    const set = (k, v) => {
        setForm(p => ({ ...p, [k]: v }));
        setErrors(p => ({ ...p, [k]: "" }));
    };

    const validate = () => {
        const e = {};
        if (!form.identifier.trim()) e.identifier = "Email or username is required";
        if (!form.password) e.password = "Password is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const res = await api.post("auth", { ...form, remember });
            toast.success(res.data.message || "Welcome back!");

            const urlParams = new URLSearchParams(window.location.search);
            const callbackUrl = urlParams.get("callback");

            setTimeout(() => {
                navigate("/library");
            }, 1000);

        } catch (err) {
            toast.error(err?.response?.data?.detail || "Invalid credentials. Try again.");
            if (err?.response?.status === 403) setTimeout(() => navigate(`/verify/${err?.response?.data?.userId}`), 1000);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-dvh flex bg-bg">
            <div className="hidden lg:flex lg:w-[65%] relative overflow-hidden shrink-0">
                <img
                    src={`/imgs/signin.jpeg`}
                    alt="signin cover"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-bg/65 transition-colors duration-300" />
                <div className="absolute inset-0 bg-linear-to-r from-transparent to-bg transition-colors duration-300" />

                <div className="relative z-10 flex flex-col h-full p-10">
                    <div className="mt-auto">
                        <h2 className="text-4xl xl:text-[2.6rem] font-black text-text leading-[1.1] mb-4">
                            Your files.<br />Your network.<br />
                            <span className="text-primary">Your control.</span>
                        </h2>
                        <p className="text-sm text-muted leading-relaxed max-w-xs">
                            Upload, share and access files across every device on your local network — fast, private, no cloud needed.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="absolute top-4 right-4">
                    <button onClick={toggle}
                        className="p-2 rounded-lg text-muted cursor-pointer hover:bg-surface hover:text-text transition-colors">
                        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>
                <div className="min-h-full flex items-center justify-center p-6 sm:p-10">
                    <div className="w-full max-w-sm">
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-black text-text mb-1.5">Sign in 👋</h1>
                            <p className="text-sm text-muted">
                                Pick up right where you left off. Your data is safe and waiting.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Field label="Email or Username" error={errors.identifier} icon={<Icon {...iUser} />}>
                                <Input
                                    icon
                                    placeholder="jane@example.com or janedoe"
                                    value={form.identifier}
                                    onChange={e => set("identifier", e.target.value.trim())}
                                />
                            </Field>

                            <Field label="Password" error={errors.password} icon={<Icon {...iLock} />}>
                                <Input
                                    icon
                                    type={showPwd ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pr-11"
                                    value={form.password}
                                    onChange={e => set("password", e.target.value)}
                                />
                                <button type="button" onClick={() => setShowPwd(p => !p)}
                                    className="absolute right-3 text-muted hover:text-text transition-colors">
                                    {showPwd ? <EyeOff /> : <EyeOpen />}
                                </button>
                            </Field>

                            <div className="flex items-center justify-between">
                                <Toggle
                                    checked={remember}
                                    onChange={setRemember}
                                    label="Remember me"
                                />
                                <Link to="#" className="text-xs text-muted hover:text-primary transition-colors font-medium shrink-0 ml-4">
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full cursor-pointer bg-primary/90 text-white font-bold py-3 rounded-xl
                                    hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]
                                    hover:shadow-lg hover:shadow-primary/20
                                    disabled:opacity-60 disabled:cursor-not-allowed
                                    flex items-center justify-center gap-2">
                                {submitting
                                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                                    : "Take Me In →"
                                }
                            </button>
                        </form>

                        <p className="text-sm text-muted mt-6 text-center hidden">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-primary font-semibold hover:underline">Create one</Link>
                        </p>
                        <p className="mt-2 text-center text-xs text-muted/50 hidden">
                            By signing in you agree to our{" "}
                            <a href="#" className="hover:text-primary transition-colors">Terms</a>{" "}&{" "}
                            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SignIn;
