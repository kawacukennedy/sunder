'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ChevronLeft, ArrowRight } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        // In a real app, send reset link here
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-8 bg-slate-900">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none text-violet-500">
                <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-current blur-[120px] rounded-full opacity-10" />
            </div>

            <div className="w-full max-w-md z-10">
                <Link href="/auth/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-all mb-8 font-bold text-xs uppercase tracking-widest">
                    <ChevronLeft size={16} /> Back to Login
                </Link>

                <div className="glass p-10 rounded-[40px] border border-white/5 shadow-2xl bg-white/[0.02]">
                    {!isSubmitted ? (
                        <>
                            <div className="mb-10 text-center">
                                <h1 className="text-3xl font-black text-white mb-3 uppercase tracking-tight italic">Password Recovery</h1>
                                <p className="text-slate-400 text-sm">Enter the email associated with your account</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-violet-500 transition-colors" size={20} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-14 pr-6 py-5 bg-slate-950/50 border border-white/5 rounded-3xl text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all font-medium"
                                            placeholder="developer@sunder.app"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-6 bg-white text-slate-950 font-black rounded-3xl hover:bg-slate-200 transition-all shadow-xl shadow-white/10 uppercase tracking-widest text-xs flex items-center justify-center gap-2 group"
                                >
                                    Send Reset Link <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6 space-y-6">
                            <div className="w-20 h-20 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                                <Mail className="text-emerald-500" size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Check your inbox</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                We've sent password reset instructions to <br />
                                <span className="text-white font-bold">{email}</span>
                            </p>
                            <button
                                onClick={() => setIsSubmitted(false)}
                                className="text-xs font-black text-violet-400 hover:text-white uppercase tracking-widest transition-colors"
                            >
                                Try another email
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
