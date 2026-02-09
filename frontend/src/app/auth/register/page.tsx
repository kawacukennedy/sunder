'use client';

import { useState } from 'react';
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    User,
    Mail,
    Lock,
    Sparkles,
    Monitor,
    ShieldCheck,
    ArrowRight,
    Terminal
} from 'lucide-react';
import Link from 'next/link';
import { cn, fetchApi } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function Register() {
    const router = useRouter();
    const { setUser, setToken } = useAuthStore();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        displayName: '',
        aiModel: 'balanced',
        theme: 'dark'
    });

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleRegister = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchApi('/auth/register', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            setUser(data.user);
            setToken(data.access_token);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
            setStep(1); // Go back to credentials if there's an error
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Credentials', icon: Lock },
        { id: 2, title: 'Preferences', icon: Sparkles },
        { id: 3, title: 'Verify', icon: ShieldCheck },
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

            <div className="w-full max-w-xl relative z-10">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block mb-6">
                        <div className="w-12 h-12 bg-white rounded-[18px] flex items-center justify-center shadow-2xl shadow-white/10">
                            <Terminal className="text-slate-950" size={24} />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Create Account</h1>
                    <p className="text-slate-500 mt-2">Step {step} of 3: {steps[step - 1].title}</p>
                </div>

                {/* Progress Stepper */}
                <div className="flex items-center justify-between mb-12 px-8 relative">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-white/5 -translate-y-1/2" />
                    {steps.map((s) => (
                        <div key={s.id} className="relative z-10">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                                step >= s.id ? "bg-white text-slate-950 shadow-xl shadow-white/20" : "bg-slate-900 text-slate-600 border border-white/5"
                            )}>
                                <s.icon size={18} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="glass p-10 rounded-[40px] border border-white/5 shadow-2xl space-y-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="text"
                                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-violet-500/50 transition-all font-mono text-sm"
                                            placeholder="Your unique handle"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="email"
                                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-violet-500/50 transition-all font-mono text-sm"
                                            placeholder="you@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="password"
                                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-violet-500/50 transition-all font-mono text-sm"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Display Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-violet-500/50 transition-all font-mono text-sm"
                                        placeholder="Publicly visible name"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">AI Assistant Focus</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['Balanced', 'Creative', 'Technical', 'Concise'].map(mode => (
                                            <button
                                                key={mode}
                                                onClick={() => setFormData({ ...formData, aiModel: mode.toLowerCase() })}
                                                className={cn(
                                                    "py-4 rounded-2xl border transition-all text-sm font-bold",
                                                    formData.aiModel === mode.toLowerCase() ? "bg-violet-600/20 border-violet-500/50 text-white" : "bg-slate-900/50 border-white/5 text-slate-500"
                                                )}
                                            >
                                                {mode}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-6 space-y-6 animate-in fade-in zoom-in-95 duration-700">
                            <div className="w-20 h-20 bg-emerald-600/20 rounded-[30px] flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                                <ShieldCheck className="text-emerald-400" size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Check your email</h2>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                                We've sent a 6-digit verification code to <span className="text-white font-medium">{formData.email}</span>. Please enter it below.
                            </p>
                            <div className="flex gap-3 justify-center">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="w-10 h-14 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-center text-xl font-mono text-white">
                                        -
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        {step > 1 && (
                            <button
                                onClick={prevStep}
                                className="px-8 py-5 border border-white/10 text-slate-400 hover:text-white font-bold rounded-2xl hover:bg-white/5 transition-all text-sm uppercase tracking-widest flex items-center gap-2"
                            >
                                <ChevronLeft size={18} /> Back
                            </button>
                        )}
                        <button
                            disabled={isLoading}
                            onClick={step === 3 ? handleRegister : nextStep}
                            className="flex-1 py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all shadow-xl shadow-white/10 uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : (step === 3 ? 'Complete Setup' : 'Continue')} <ChevronRight size={18} />
                        </button>
                    </div>
                    {error && <p className="text-center text-red-400 text-xs font-bold uppercase tracking-tight">{error}</p>}
                </div>

                <p className="text-center mt-10 text-slate-500 text-sm">
                    Already have an account? <Link href="/auth/login" className="text-white font-bold hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
}
