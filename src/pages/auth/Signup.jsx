import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/Toast.jsx";
import { Field, Input, Icon, EyeOpen, EyeOff } from "../../components/Form.jsx";

const apiUrl = import.meta.env.VITE_API_URL;
const mediaUrl = import.meta.env.VITE_MEDIA_URL;

const ORGANIZATION_TYPES = [
    { value: "retail", label: "Retail" },
    { value: "restaurant", label: "Restaurant" },
    { value: "pharmacy", label: "Pharmacy" },
    { value: "salon", label: "Salon" },
    { value: "hardware", label: "Hardware" },
    { value: "wholesale", label: "Wholesale" },
    { value: "electronics", label: "Electronics" },
    { value: "other", label: "Other" },
];

const iUser = { d: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", d2: "M12 3a4 4 0 100 8 4 4 0 000-8z" };
const iMail = { d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", d2: "M22 6l-10 7L2 6" };
const iPhone = { d: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .85h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" };
const iBldg = { d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", d2: "M9 22V12h6v10" };
const iPin = { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z", d2: "M12 7a3 3 0 100 6 3 3 0 000-6z" };
const iLock = { d: "M19 11H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2v-6a2 2 0 00-2-2z", d2: "M7 11V7a5 5 0 0110 0v4" };

function StepBar({ current, total }) {
    const labels = ["Personal Info", "Business Setup", "Set Password"];
    return (
        <div className="mb-8 space-y-2">
            <div className="flex items-center justify-between">
                <span className="text-xs text-muted">
                    Step <span className="font-bold text-text">{current}</span> of {total}
                </span>
                <span className="text-xs font-bold text-primary">
                    {Math.round((current / total) * 100)}%
                </span>
            </div>
            <div className="h-1 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${(current / total) * 100}%` }} />
            </div>
            <p className="text-xs text-muted">{labels[current - 1]}</p>
        </div>
    );
}

function PwdStrength({ value }) {
    if (!value) return null;
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    const colors = ["bg-danger", "bg-warning", "bg-secondary", "bg-success"];
    const texts = ["text-danger", "text-warning", "text-secondary", "text-success"];
    const scoreLabels = ["Weak", "Fair", "Good", "Strong"];
    const idx = Math.max(0, score - 1);

    const checks = [
        { ok: value.length >= 8, label: "8+ characters" },
        { ok: /[A-Z]/.test(value), label: "Uppercase letter" },
        { ok: /[0-9]/.test(value), label: "Number" },
        { ok: /[^A-Za-z0-9]/.test(value), label: "Special character" },
    ];

    return (
        <div className="space-y-2 -mt-1">
            <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300
                            ${i < score ? colors[idx] : "bg-border"}`} />
                    ))}
                </div>
                <span className={`text-xs font-bold ${texts[idx]}`}>{scoreLabels[idx]}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {checks.map(c => (
                    <div key={c.label} className={`flex items-center gap-1.5 text-xs transition-colors
                        ${c.ok ? "text-success" : "text-muted"}`}>
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-colors
                            ${c.ok ? "bg-success" : "bg-border"}`}>
                            {c.ok && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" className="w-2 h-2">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            )}
                        </div>
                        {c.label}
                    </div>
                ))}
            </div>
        </div>
    );
}

const SignUp = () => {
    const toast = useToast();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [showCPwd, setShowCPwd] = useState(false);
    const [errors, setErrors] = useState({});

    const [form, setForm] = useState({
        fullName: "", username: "", email: "", phone: "",
        name: "", type: "", organizationEmail: "", organizationPhone: "", address: "",
        password: "", confirmPassword: "",
    });

    const set = (k, v) => {
        setForm(p => ({ ...p, [k]: v }));
        setErrors(p => ({ ...p, [k]: "" }));
    };

    const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

    const validateStep1 = () => {
        const e = {};
        if (!form.fullName.trim()) e.fullName = "Full name is required";
        if (!form.username.trim()) e.username = "Username is required";
        else if (/\s/.test(form.username)) e.username = "No spaces allowed";
        if (!form.email.trim()) e.email = "Email is required";
        else if (!isEmail(form.email)) e.email = "Enter a valid email address";
        if (!form.phone.trim()) e.phone = "Phone number is required";
        else if (form.phone.replace(/\D/g, "").length < 9) e.phone = "Enter a valid phone number";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Organization name is required";
        if (!form.type) e.type = "Please select a Organization type";
        if (!form.organizationEmail.trim()) e.organizationEmail = "Organization's email is required";
        else if (!isEmail(form.organizationEmail)) e.organizationEmail = "Enter a valid email";
        if (!form.organizationPhone.trim()) e.organizationPhone = "Organization's phone is required";
        if (!form.address.trim()) e.address = "Address is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep3 = () => {
        const e = {};
        if (!form.password) e.password = "Password is required";
        else if (form.password.length < 8) e.password = "At least 8 characters required";
        if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
        else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const goNext = () => {
        if (step === 1 && validateStep1()) {
            setForm(p => ({
                ...p,
                organizationEmail: p.organizationEmail || p.email,
                organizationPhone: p.organizationPhone || p.phone,
            }));
            setStep(2);
        } else if (step === 2 && validateStep2()) {
            setStep(3);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep3()) return;
        setSubmitting(true);
        try {
            const { confirmPassword, ...payload } = form;
            const res = await axios.post(`${apiUrl}/auth/signup`, payload);
            toast.success("Account created! Check your email to verify.");
            setTimeout(() => navigate(`/verify/${res.data.data.id}`), 1000);
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Something went wrong. Try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-dvh flex bg-bg">
            <div className="hidden lg:flex lg:w-[65%] relative overflow-hidden shrink-0">
                <img
                    src={`${mediaUrl}/imgs/signup.jpg`}
                    alt="Qwin POS"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/55 to-black/15" />
                <div className="relative z-10 flex flex-col h-full p-10">
                    <div className="mt-auto">
                        <span className="inline-flex items-center gap-1.5 bg-primary/20 backdrop-blur-sm
                            border border-primary/30 text-primary text-xs font-semibold
                            px-3 py-1.5 rounded-full mb-5">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            Quick Win for your business
                        </span>
                        <h2 className="text-4xl xl:text-[2.6rem] font-black text-white leading-[1.1] mb-4">
                            Sell smarter.<br />
                            <span className="text-primary">Grow faster.</span>
                        </h2>
                        <p className="text-white/60 text-sm leading-relaxed max-w-xs">
                            One platform to manage your sales and reports — built for Kenyan businesses.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="min-h-full flex items-center justify-center p-6 sm:p-20">
                    <div className="w-full">
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-black text-text mb-1.5">
                                {step === 1 && "Welcome aboard 👋"}
                                {step === 2 && "Your Organization details"}
                                {step === 3 && "Almost there! 🎉"}
                            </h1>
                            <p className="text-sm text-muted">
                                {step === 1 && "Let's start with your personal information"}
                                {step === 2 && "Tell us about the organization you run"}
                                {step === 3 && "Set a password to secure your account"}
                            </p>
                        </div>

                        <StepBar current={step} total={3} />

                        <form onSubmit={handleSubmit}>

                            {step === 1 && (
                                <div className="space-y-4 animate-[slideIn_0.25s_ease-out]">
                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Full Name" error={errors.fullName} icon={<Icon {...iUser} />}>
                                            <Input icon placeholder="Jane Doe" value={form.fullName}
                                                onChange={e => set("fullName", e.target.value)} />
                                        </Field>
                                        <Field label="Username" error={errors.username} icon={<Icon {...iUser} />}>
                                            <Input icon placeholder="doejane" value={form.username}
                                                onChange={e => set("username", e.target.value.toLowerCase().replace(/\s/g, ""))} />
                                        </Field>
                                    </div>
                                    <Field label="Email Address" error={errors.email} icon={<Icon {...iMail} />}>
                                        <Input icon type="email" placeholder="doejane@example.com" value={form.email}
                                            onChange={e => set("email", e.target.value)} />
                                    </Field>
                                    <Field label="Phone Number" error={errors.phone} icon={<Icon {...iPhone} />}>
                                        <Input icon type="tel" placeholder="0712 345 678" value={form.phone}
                                            onChange={e => set("phone", e.target.value)} />
                                    </Field>
                                    <button type="button" onClick={goNext}
                                        className="w-full cursor-pointer mt-2 bg-primary text-white font-bold py-3 rounded-xl
                                            hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]
                                            hover:shadow-lg hover:shadow-primary/20">
                                        Continue to Organization Details →
                                    </button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4 animate-[slideIn_0.25s_ease-out]">
                                    <Field label="Organization Name" error={errors.name} icon={<Icon {...iBldg} />}>
                                        <Input icon placeholder="ABC Enterprises" value={form.name}
                                            onChange={e => set("name", e.target.value)} />
                                    </Field>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold tracking-widest uppercase text-muted">
                                            Organization Type
                                        </label>
                                        <div className="flex flex-wrap gap-2 pt-0.5">
                                            {ORGANIZATION_TYPES.map(bt => {
                                                const active = form.type === bt.value;
                                                return (
                                                    <button key={bt.value} type="button"
                                                        onClick={() => set("type", bt.value)}
                                                        className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all duration-150
                                                            ${active
                                                                ? "border-primary text-primary bg-primary/8"
                                                                : "border-border text-muted bg-transparent hover:border-primary/50 hover:text-text"
                                                            }`}>
                                                        {bt.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {errors.type && (
                                            <p className="flex items-center gap-1.5 text-xs text-danger">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3 h-3">
                                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                                </svg>
                                                {errors.type}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Field label="Organization Email" error={errors.organizationEmail} icon={<Icon {...iMail} />}>
                                            <Input icon type="email" placeholder="biz@example.com" value={form.organizationEmail}
                                                onChange={e => set("organizationEmail", e.target.value)} />
                                        </Field>
                                        <Field label="Organization Phone" error={errors.organizationPhone} icon={<Icon {...iPhone} />}>
                                            <Input icon type="tel" placeholder="0712 345 678" value={form.organizationPhone}
                                                onChange={e => set("organizationPhone", e.target.value)} />
                                        </Field>
                                    </div>

                                    <Field label="Organization Address" error={errors.address} icon={<Icon {...iPin} />}>
                                        <Input icon placeholder="123 Moi Avenue, Nairobi" value={form.address}
                                            onChange={e => set("address", e.target.value)} />
                                    </Field>

                                    <div className="flex gap-3 pt-1">
                                        <button type="button" onClick={() => setStep(1)}
                                            className="px-5 py-3 cursor-pointer rounded-xl border border-border
                                                text-text font-semibold text-sm hover:bg-surface transition-colors">
                                            ← Back
                                        </button>
                                        <button type="button" onClick={goNext}
                                            className="flex-1 cursor-pointer bg-primary text-white font-bold py-3 rounded-xl
                                                hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]
                                                hover:shadow-lg hover:shadow-primary/20">
                                            Set Password →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4 animate-[slideIn_0.25s_ease-out]">
                                    <Field label="Password" error={errors.password} icon={<Icon {...iLock} />}>
                                        <Input icon type={showPwd ? "text" : "password"}
                                            placeholder="Min. 8 characters" className="pr-11"
                                            value={form.password}
                                            onChange={e => set("password", e.target.value)} />
                                        <button type="button" onClick={() => setShowPwd(p => !p)}
                                            className="absolute right-3 text-muted hover:text-text transition-colors">
                                            {showPwd ? <EyeOff /> : <EyeOpen />}
                                        </button>
                                    </Field>

                                    <PwdStrength value={form.password} />

                                    <Field label="Confirm Password" error={errors.confirmPassword} icon={<Icon {...iLock} />}>
                                        <Input icon type={showCPwd ? "text" : "password"}
                                            placeholder="Repeat password" className="pr-11"
                                            value={form.confirmPassword}
                                            onChange={e => set("confirmPassword", e.target.value)} />
                                        <button type="button" onClick={() => setShowCPwd(p => !p)}
                                            className="absolute right-3 text-muted hover:text-text transition-colors">
                                            {showCPwd ? <EyeOff /> : <EyeOpen />}
                                        </button>
                                    </Field>

                                    <div className="flex gap-3 pt-1">
                                        <button type="button" onClick={() => setStep(2)}
                                            className="px-5 py-3.5 cursor-pointer rounded-xl border border-border
                                                text-text font-semibold text-sm hover:bg-surface transition-colors">
                                            ← Back
                                        </button>
                                        <button type="submit" disabled={submitting}
                                            className="flex-1 cursor-pointer bg-primary text-white font-bold py-3 rounded-xl
                                                hover:bg-primary/90 transition-all duration-200 active:scale-[0.98]
                                                hover:shadow-lg hover:shadow-primary/20
                                                disabled:opacity-60 disabled:cursor-not-allowed
                                                flex items-center justify-center gap-2">
                                            {submitting
                                                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                                                : "Create Account →"
                                            }
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                        <p className="mt-6 text-center text-sm text-muted">
                            Already have an account?{" "}
                            <Link to="/signin" className="text-primary font-semibold hover:underline">Sign in</Link>
                        </p>
                        <p className="mt-2 text-center text-xs text-muted/50">
                            By signing up you agree to our{" "}
                            <a href="#" className="hover:text-primary transition-colors">Terms</a>{" "}&{" "}
                            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(16px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SignUp;
