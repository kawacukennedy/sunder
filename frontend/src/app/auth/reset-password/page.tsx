'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, ChevronLeft, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) return;

        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitted(true);
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-8 bg-slate-900 selection:bg-violet-500/30">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md z-10 transition-all duration-700 ease-out">
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all mb-8 font-bold text-[10px] uppercase tracking-widest group">
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Secure Login
                </Link>

                <div className="glass p-10 rounded-[48px] border border-white/5 shadow-2xl bg-white/[0.02] backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-600 opacity-50" />

                    {!isSubmitted ? (
                        <>
                            <div className="mb-10 text-center">
                                <div className="w-16 h-16 bg-violet-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-violet-500/20">
                                    <Lock className="text-violet-400" size={28} />
                                </div>
                                <h1 className="text-3xl font-black text-white mb-3 uppercase tracking-tight italic leading-none">New Credentials</h1>
                                <p className="text-slate-400 text-xs font-medium tracking-wide">Establish a strong, unique password for your Sunder account</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-violet-500 transition-colors" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-14 pr-14 py-5 bg-slate-950/50 border border-white/5 rounded-[24px] text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all font-medium placeholder-slate-700"
                                            placeholder="••••••••••••"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Confirm Identity</label>
                                    <div className="relative group">
                                        <CheckCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={cn(
                                                "w-full pl-14 pr-6 py-5 bg-slate-950/50 border border-white/5 rounded-[24px] text-white focus:outline-none focus:ring-1 transition-all font-medium placeholder-slate-700",
                                                password && confirmPassword && password !== confirmPassword ? "ring-1 ring-red-500/50 border-red-500/20" : "focus:ring-violet-500/50"
                                            )}
                                            placeholder="••••••••••••"
                                            required
                                        />
                                    </div>
                                    {password && confirmPassword && password !== confirmPassword && (
                                        <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider px-2 mt-2">Passwords do not match</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || !password || password !== confirmPassword}
                                    className="w-full py-6 bg-white text-slate-950 font-black rounded-[24px] hover:bg-slate-200 transition-all shadow-xl shadow-white/10 uppercase tracking-widest text-xs flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale transition-all duration-300"
                                >
                                    {isLoading ? (
                                        <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                                    ) : (
                                        <>Finalize Reset <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6 space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-emerald-500/10 rounded-[36px] flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 scale-110">
                                <CheckCircle2 className="text-emerald-500" size={40} />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tight italic">Access Restored</h2>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-[240px] mx-auto">
                                    Your secure credentials have been updated successfully.
                                </p>
                            </div>
                            <Link
                                href="/auth/login"
                                className="inline-flex w-full py-6 bg-violet-600 text-white font-black rounded-[24px] hover:bg-violet-500 transition-all shadow-xl shadow-violet-600/20 uppercase tracking-widest text-xs items-center justify-center gap-2 group"
                            >
                                Enter Dashboard <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    )}
                </div>

                <p className="mt-10 text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] opacity-50">
                    Sunder Encryption Standard v4.2.0 • Phase 8
                </p>
            </div>
        </main>
    );
}
