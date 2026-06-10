import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../contex/Toast.jsx";

const apiUrl = import.meta.env.VITE_API_URL;
const mediaUrl = import.meta.env.VITE_MEDIA_URL;

const VerifyEmail = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const { id } = useParams();

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputs = useRef([]);

    useEffect(() => {
        inputs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (canResend) return;
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanResend(true);
                    return 0;
                }
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
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
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
        const focusIndex = Math.min(pasted.length, 5);
        inputs.current[focusIndex]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length < 6) {
            toast.warning("Please enter the full 6-digit code.");
            return;
        }
        setSubmitting(true);
        try {
            await axios.post(`${apiUrl}/users/${id}/verify`, { otp: code });
            toast.success("Email verified! Welcome to Qwin.");
            setTimeout(() => navigate("/signin"), 1800);
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Invalid or expired code. Try again.");
            setOtp(["", "", "", "", "", ""]);
            inputs.current[0]?.focus();
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setResending(true);
        try {
            await axios.post(`${apiUrl}/auth/resend-otp?userId=${id}`);
            toast.success("A new code has been sent to your email.");
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

    const filled = otp.filter(Boolean).length;

    return (
        <div className="min-h-screen flex bg-bg">
            <div className="hidden lg:flex lg:w-[65%] relative overflow-hidden shrink-0">
                <img
                    src={`${mediaUrl}/imgs/verify.avif`}
                    alt="Email verification"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/55 to-black/15" />
                <div className="relative z-10 flex flex-col h-full p-10">
                    <div className="mt-auto">
                        <span className="inline-flex items-center gap-1.5 bg-primary/20 backdrop-blur-sm
                            border border-primary/30 text-primary text-xs font-semibold
                            px-3 py-1.5 rounded-full mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            One last step
                        </span>
                        <h2 className="text-4xl xl:text-[2.6rem] font-black text-white leading-[1.1] mb-4">
                            Verify your<br />
                            <span className="text-primary">identity.</span>
                        </h2>
                        <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xs">
                            We sent a 6-digit code to your email. Enter it to activate your Qwin account.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="min-h-full flex items-center justify-center p-3 sm:p-10">
                    <div className="w-full max-w-sm">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                                strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-primary">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                <path d="M22 6l-10 7L2 6" />
                            </svg>
                        </div>

                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-black text-text mb-2">
                                Check your email
                            </h1>
                            <p className="text-sm text-muted leading-relaxed">
                                We sent a 6-digit verification code to your email address. Enter it below to activate your account.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
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
                                                    ? "border-primary shadow-[0_0_0_3px_rgba(39,174,96,0.12)]"
                                                    : "border-border focus:border-primary focus:shadow-[0_0_0_3px_rgba(39,174,96,0.1)]"
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
                                disabled={submitting || filled < 6}
                                className="w-full cursor-pointer bg-primary text-white font-bold py-3 rounded-xl
                                    hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]
                                    hover:shadow-lg hover:shadow-primary/20
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    flex items-center justify-center gap-2">
                                {submitting
                                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying...</>
                                    : "Verify Email →"
                                }
                            </button>
                        </form>

                        <div className="mt-6 text-center space-y-1">
                            <p className="text-sm text-muted">Didn't receive the code?</p>
                            {canResend ? (
                                <button
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="text-sm font-semibold text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 mx-auto">
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

                        <p className="mt-8 text-center text-xs text-muted/50">
                            Wrong email?{" "}
                            <a href="/signup" className="hover:text-primary transition-colors">Go back and sign up again</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
