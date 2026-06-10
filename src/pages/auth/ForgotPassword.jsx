import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../contex/Toast.jsx";
import { Field, Input, Icon } from "../../components/Form.jsx";

const apiUrl = import.meta.env.VITE_API_URL;

const iMail = { d: "M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z", d2: "M22 6l-10 7L2 6" };
const iPhone = { d: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .9h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z", d2: "" };

const DeliveryOption = ({ id, label, sublabel, icon, selected, disabled, onSelect }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onSelect(id)}
        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border text-left
            transition-all duration-200
            ${disabled
                ? "opacity-40 cursor-not-allowed border-border bg-surface"
                : selected
                    ? "border-primary bg-primary/10 cursor-pointer"
                    : "border-border bg-surface hover:border-primary/50 cursor-pointer"
            }`}
    >
        <span className={`w-9 h-9 flex items-center justify-center rounded-lg text-base shrink-0
            ${selected && !disabled ? "bg-primary/20 text-primary" : "bg-bg text-muted"}`}>
            {icon}
        </span>

        <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold ${selected && !disabled ? "text-text" : "text-muted"}`}>
                {label}
            </p>
            {sublabel && (
                <p className="text-xs text-muted/70 truncate">{sublabel}</p>
            )}
        </div>

        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
            transition-colors ${selected && !disabled ? "border-primary" : "border-border"}`}>
            {selected && !disabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            )}
        </span>

        {disabled && (
            <span className="text-[10px] font-semibold text-muted/50 border border-border
                px-1.5 py-0.5 rounded-full shrink-0">
                Soon
            </span>
        )}
    </button>
);

const ForgotPassword = () => {
    const toast = useToast();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState("");
    const [transporter, setTransporter] = useState("email");
    const [submitting, setSubmitting] = useState(false);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setEmailError("Email address is required");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError("Please enter a valid email address");
            return;
        }
        setEmailError("");
        setSubmitting(true);

        try {
            const res = await axios.get(`${apiUrl}/auth/forgot-password`, {
                params: { email: email.trim() },
            });
            setUserId(res.data.data.id);
            setUserName(res.data.data.fullName || "");
            setStep(2);
        } catch (err) {
            const status = err?.response?.status;
            if (status === 404) {
                setEmailError("No account found with this email address.");
            } else {
                toast.error(err?.response?.data?.detail || "Something went wrong. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleOtpRequest = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await axios.post(`${apiUrl}/auth/forgot-password/otp`, {
                userId,
                transporter,
            });
            toast.success("Code sent! Check your inbox.");
            setTimeout(() => navigate(`/reset-password/${userId}`), 1000);
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Failed to send code. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const deliveryOptions = [
        {
            id: "email",
            label: "Email",
            sublabel: email,
            icon: "✉️",
            disabled: false,
        },
        {
            id: "sms",
            label: "SMS",
            sublabel: "Phone number on your account",
            icon: "📱",
            disabled: true,
        },
        {
            id: "whatsapp",
            label: "WhatsApp",
            sublabel: "Phone number on your account",
            icon: "💬",
            disabled: true,
        },
    ];

    return (
        <div className="min-h-dvh flex bg-bg">

            <div className="hidden lg:flex lg:w-[65%] relative overflow-hidden shrink-0">
                <img
                    src={`${import.meta.env.VITE_MEDIA_URL}/imgs/signin.avif`}
                    alt="Qwin POS forgot password"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/55 to-black/15" />
                <div className="relative z-10 flex flex-col h-full p-10">
                    <div className="mt-auto">
                        <span className="inline-flex items-center gap-1.5 bg-primary/20 backdrop-blur-sm
                            border border-primary/30 text-primary text-xs font-semibold
                            px-3 py-1.5 rounded-full mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Account Recovery
                        </span>
                        <h2 className="text-4xl xl:text-[2.6rem] font-black text-white leading-[1.1] mb-4">
                            Locked out?<br />
                            <span className="text-primary">No worries.</span>
                        </h2>
                        <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                            We'll send a one-time code to get you back in. Takes less than a minute.
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
                                        ${step >= n
                                            ? "bg-primary text-white"
                                            : "bg-surface text-muted border border-border"
                                        }`}>
                                        {step > n ? "✓" : n}
                                    </span>
                                    {n < 2 && (
                                        <div className={`h-px w-8 transition-all duration-500
                                            ${step > 1 ? "bg-primary" : "bg-border"}`} />
                                    )}
                                </div>
                            ))}
                            <span className="ml-1 text-xs text-muted">
                                {step === 1 ? "Verify account" : "Choose delivery"}
                            </span>
                        </div>

                        {step === 1 && (
                            <div className="animate-fadeIn">
                                <div className="mb-8">
                                    <h1 className="text-2xl sm:text-3xl font-black text-text mb-1.5">
                                        Forgot password? 🔐
                                    </h1>
                                    <p className="text-sm text-muted">
                                        Enter your account email and we'll check if it exists.
                                    </p>
                                </div>

                                <form onSubmit={handleEmailSubmit} className="space-y-4">
                                    <Field label="Email Address" error={emailError} icon={<Icon {...iMail} />}>
                                        <Input
                                            icon
                                            type="email"
                                            placeholder="jane@example.com"
                                            value={email}
                                            onChange={e => {
                                                setEmail(e.target.value.trim());
                                                setEmailError("");
                                            }}
                                        />
                                    </Field>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full cursor-pointer bg-primary text-white font-bold py-3 rounded-xl
                                            hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]
                                            hover:shadow-lg hover:shadow-primary/20
                                            disabled:opacity-60 disabled:cursor-not-allowed
                                            flex items-center justify-center gap-2">
                                        {submitting
                                            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Checking...</>
                                            : "Continue →"
                                        }
                                    </button>
                                </form>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-fadeIn">
                                <div className="mb-8">
                                    <h1 className="text-2xl sm:text-3xl font-black text-text mb-1.5">
                                        Send a code {userName ? `to ${userName.split(" ")[0]}` : ""} 📨
                                    </h1>
                                    <p className="text-sm text-muted">
                                        How would you like to receive your one-time password?
                                    </p>
                                </div>

                                <form onSubmit={handleOtpRequest} className="space-y-3">
                                    {/* Delivery option cards */}
                                    <div className="space-y-2">
                                        {deliveryOptions.map(opt => (
                                            <DeliveryOption
                                                key={opt.id}
                                                {...opt}
                                                selected={transporter === opt.id}
                                                onSelect={setTransporter}
                                            />
                                        ))}
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full cursor-pointer bg-primary text-white font-bold py-3 rounded-xl
                                                hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]
                                                hover:shadow-lg hover:shadow-primary/20
                                                disabled:opacity-60 disabled:cursor-not-allowed
                                                flex items-center justify-center gap-2">
                                            {submitting
                                                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending...</>
                                                : "Send Code →"
                                            }
                                        </button>
                                    </div>
                                </form>

                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="mt-4 w-full text-sm text-muted hover:text-text
                                        transition-colors text-center">
                                    ← Use a different email
                                </button>
                            </div>
                        )}

                        <p className="text-sm text-muted mt-6 text-center">
                            Remember your password?{" "}
                            <Link to="/signin" className="text-primary font-semibold hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.25s ease both;
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;
