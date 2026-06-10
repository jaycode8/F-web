import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useToast } from "../contex/Toast.jsx";

const apiUrl = import.meta.env.VITE_API_URL;
const mediaUrl = import.meta.env.VITE_MEDIA_URL;

const EyeOpen = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
const EyeOff = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const getStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
        { label: "Too short", color: "bg-red-500" },
        { label: "Weak", color: "bg-red-400" },
        { label: "Fair", color: "bg-yellow-400" },
        { label: "Good", color: "bg-blue-400" },
        { label: "Strong", color: "bg-primary" },
    ];
    return { score, ...map[score] };
};

const PwdField = ({ label, value, onChange, show, onToggle, error, placeholder }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold tracking-widest uppercase text-muted">
            {label}
        </label>
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`w-full bg-surface border rounded-xl px-4 py-3 pr-11
                    text-sm text-text placeholder:text-muted/50 outline-none
                    transition-all duration-200
                    ${error
                        ? "border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
                        : "border-border focus:border-primary focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                    }`}
            />
            <button type="button" onClick={onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors">
                {show ? <EyeOff /> : <EyeOpen />}
            </button>
        </div>
        {error && <p className="text-xs text-red-500 pt-0.5">{error}</p>}
    </div>
);

const ResetPassword = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputs = useRef([]);

    const [phase, setPhase] = useState("otp");
    const [verifiedOtp, setVerifiedOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pwdErrors, setPwdErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const strength = getStrength(password);
    const filled = otp.filter(Boolean).length;

    useEffect(() => { inputs.current[0]?.focus(); }, []);

    useEffect(() => {
        if (canResend) return;
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) { clearInterval(timer); setCanResend(true); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [canResend]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        if (value && index < 5) inputs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) inputs.current[index - 1]?.focus();
        if (e.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
        if (e.key === "ArrowRight" && index < 5) inputs.current[index + 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        const next = ["", "", "", "", "", ""];
        pasted.split("").forEach((char, i) => { next[i] = char; });
        setOtp(next);
        inputs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length < 6) { toast.warning("Please enter the full 6-digit code."); return; }

        setVerifying(true);
        try {
            await axios.post(`${apiUrl}/auth/forgot-password/verify`, { id, otp: code });
            setVerifiedOtp(code);
            setPhase("password");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Invalid or expired code. Try again.");
            setOtp(["", "", "", "", "", ""]);
            inputs.current[0]?.focus();
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setResending(true);
        try {
            await axios.post(`${apiUrl}/auth/forgot-password/otp`, { userId: id, transporter: "email" });
            toast.success("A new code has been sent.");
            setCountdown(60);
            setCanResend(false);
            setOtp(["", "", "", "", "", ""]);
            inputs.current[0]?.focus();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Could not resend code. Try again.");
        } finally {
            setResending(false);
        }
    };

    const validatePwd = () => {
        const e = {};
        if (!password) e.password = "Password is required";
        else if (password.length < 8) e.password = "Must be at least 8 characters";
        if (!confirm) e.confirm = "Please confirm your password";
        else if (password !== confirm) e.confirm = "Passwords do not match";
        setPwdErrors(e);
        return Object.keys(e).length === 0;
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!validatePwd()) return;
        setSaving(true);
        try {
            await axios.post(`${apiUrl}/auth/reset-password`, {
                id,
                otp: verifiedOtp,
                password,
            });
            toast.success("Password reset! You can now sign in.");
            setTimeout(() => navigate("/signin"), 1500);
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Failed to reset password. Try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-dvh flex bg-bg">

            <div className="hidden lg:flex lg:w-[65%] relative overflow-hidden shrink-0">
                <img
                    src={`${mediaUrl}/imgs/signin.avif`}
                    alt="Reset password"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/55 to-black/15" />
                <div className="relative z-10 flex flex-col h-full p-10">
                    <div className="mt-auto">
                        <span className="inline-flex items-center gap-1.5 bg-primary/20 backdrop-blur-sm
                            border border-primary/30 text-primary text-xs font-semibold
                            px-3 py-1.5 rounded-full mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            {phase === "otp" ? "Account Recovery" : "Almost there"}
                        </span>
                        <h2 className="text-4xl xl:text-[2.6rem] font-black text-white leading-[1.1] mb-4">
                            {phase === "otp"
                                ? <>"Enter your<br /><span className="text-primary">code.</span>"</>
                                : <>"Set a new<br /><span className="text-primary">password.</span>"</>
                            }
                        </h2>
                        <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                            {phase === "otp"
                                ? "We sent a 6-digit code to your inbox. Enter it to continue."
                                : "Choose a strong password you haven't used before."
                            }
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="min-h-full flex items-center justify-center p-6 sm:p-10">
                    <div className="w-full max-w-sm">

                        <div className="flex items-center gap-2 mb-8">
                            {[1, 2].map(n => (
                                <div key={n} className="flex items-center gap-2">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center
                                        text-xs font-bold transition-all duration-300
                                        ${(n === 1 && phase === "otp") || (n === 2 && phase === "password")
                                            ? "bg-primary text-white"
                                            : phase === "password" && n === 1
                                                ? "bg-primary/30 text-primary"
                                                : "bg-surface text-muted border border-border"
                                        }`}>
                                        {phase === "password" && n === 1 ? "✓" : n}
                                    </span>
                                    {n < 2 && (
                                        <div className={`h-px w-8 transition-all duration-500
                                            ${phase === "password" ? "bg-primary" : "bg-border"}`} />
                                    )}
                                </div>
                            ))}
                            <span className="ml-1 text-xs text-muted">
                                {phase === "otp" ? "Verify code" : "New password"}
                            </span>
                        </div>

                        {phase === "otp" && (
                            <div className="animate-fadeIn">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20
                                    flex items-center justify-center mb-6">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                                        strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-primary">
                                        <rect x="5" y="11" width="14" height="10" rx="2" />
                                        <path d="M8 11V7a4 4 0 018 0v4" />
                                        <circle cx="12" cy="16" r="1" fill="currentColor" />
                                    </svg>
                                </div>

                                <div className="mb-8">
                                    <h1 className="text-2xl sm:text-3xl font-black text-text mb-2">
                                        Enter your code
                                    </h1>
                                    <p className="text-sm text-muted leading-relaxed">
                                        We sent a 6-digit code to your email. Enter it below to continue.
                                    </p>
                                </div>

                                <form onSubmit={handleOtpSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold tracking-widest uppercase text-muted">
                                            Verification Code
                                        </label>
                                        <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                                            {otp.map((digit, i) => (
                                                <input
                                                    key={i}
                                                    ref={el => inputs.current[i] = el}
                                                    type="text"
                                                    inputMode="numeric"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChange={e => handleChange(i, e.target.value)}
                                                    onKeyDown={e => handleKeyDown(i, e)}
                                                    className={`w-12 h-12 text-center text-xl font-bold rounded-xl border
                                                        bg-surface text-text outline-none transition-all duration-200
                                                        ${digit
                                                            ? "border-primary shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
                                                            : "border-border focus:border-primary focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex gap-1 pt-1">
                                            {otp.map((d, i) => (
                                                <div key={i} className={`flex-1 h-0.5 rounded-full transition-all duration-200
                                                    ${d ? "bg-primary" : "bg-border"}`} />
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={verifying || filled < 6}
                                        className="w-full cursor-pointer bg-primary text-white font-bold py-3 rounded-xl
                                            hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]
                                            hover:shadow-lg hover:shadow-primary/20
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                            flex items-center justify-center gap-2">
                                        {verifying
                                            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                                            : "Verify Code →"
                                        }
                                    </button>
                                </form>

                                <div className="mt-6 text-center space-y-1">
                                    <p className="text-sm text-muted">Didn't receive the code?</p>
                                    {canResend ? (
                                        <button onClick={handleResend} disabled={resending}
                                            className="text-sm cursor-pointer font-semibold text-primary hover:underline
                                                disabled:opacity-50 disabled:cursor-not-allowed
                                                flex items-center gap-1.5 mx-auto">
                                            {resending
                                                ? <><span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> Sending...</>
                                                : "Resend code"
                                            }
                                        </button>
                                    ) : (
                                        <p className="text-sm text-muted">
                                            Resend in{" "}
                                            <span className="font-bold text-text tabular-nums">
                                                0:{countdown.toString().padStart(2, "0")}
                                            </span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {phase === "password" && (
                            <div className="animate-fadeIn">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20
                                    flex items-center justify-center mb-6">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                                        strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-primary">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                </div>

                                <div className="mb-8">
                                    <h1 className="text-2xl sm:text-3xl font-black text-text mb-2">
                                        New password 🔑
                                    </h1>
                                    <p className="text-sm text-muted leading-relaxed">
                                        Choose a strong password you haven't used before.
                                    </p>
                                </div>

                                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                    <PwdField
                                        label="New Password"
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); setPwdErrors(p => ({ ...p, password: "" })); }}
                                        show={showPwd}
                                        onToggle={() => setShowPwd(p => !p)}
                                        error={pwdErrors.password}
                                        placeholder="••••••••"
                                    />

                                    {password.length > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4].map(n => (
                                                    <div key={n} className={`flex-1 h-1 rounded-full transition-all duration-300
                                                        ${n <= strength.score ? strength.color : "bg-border"}`} />
                                                ))}
                                            </div>
                                            <p className="text-xs text-muted">{strength.label}</p>
                                        </div>
                                    )}

                                    <PwdField
                                        label="Confirm Password"
                                        value={confirm}
                                        onChange={e => { setConfirm(e.target.value); setPwdErrors(p => ({ ...p, confirm: "" })); }}
                                        show={showConfirm}
                                        onToggle={() => setShowConfirm(p => !p)}
                                        error={pwdErrors.confirm}
                                        placeholder="••••••••"
                                    />

                                    <div className="pt-1">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full cursor-pointer bg-primary text-white font-bold py-3 rounded-xl
                                                hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]
                                                hover:shadow-lg hover:shadow-primary/20
                                                disabled:opacity-60 disabled:cursor-not-allowed
                                                flex items-center justify-center gap-2">
                                            {saving
                                                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                                                : "Reset Password →"
                                            }
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <p className="text-sm text-muted mt-8 text-center">
                            Remember your password?{" "}
                            <Link to="/signin" className="text-primary font-semibold hover:underline">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.25s ease both; }
            `}</style>
        </div>
    );
};

export default ResetPassword;
