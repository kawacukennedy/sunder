'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Users,
    MessageSquare,
    Video,
    Mic,
    Settings,
    Share2,
    Code2,
    Terminal,
    Circle,
    MoreHorizontal,
    Send,
    Plus,
    Timer,
    Star,
    CheckCircle2,
    X,
    ShieldAlert
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function CollaborationSession() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('Chat');
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);
    const [rating, setRating] = useState(0);

    const participants = [
        { name: 'Kennedy Code', role: 'Host', status: 'online', color: 'bg-violet-500' },
        { name: 'Alex Dev', role: 'Editor', status: 'online', color: 'bg-blue-500' },
        { name: 'Maya ML', role: 'Viewer', status: 'away', color: 'bg-slate-500' },
    ];

    // Session Timer Logic
    useEffect(() => {
        if (timeLeft <= 0) {
            handleSessionEnd();
            return;
        }
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSessionEnd = () => {
        setShowFeedback(true);
    };

    const submitFeedback = () => {
        setFeedbackSent(true);
        setTimeout(() => {
            router.push('/dashboard');
        }, 2000);
    };

    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-160px)] gap-6 overflow-hidden relative">

                {/* Feedback Modal Overlay */}
                {showFeedback && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500">
                        <div className="max-w-md w-full glass p-10 rounded-[48px] border border-white/10 text-center space-y-8 shadow-3xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 to-blue-600" />

                            {!feedbackSent ? (
                                <>
                                    <div className="w-20 h-20 bg-violet-600/20 rounded-3xl flex items-center justify-center mx-auto border border-violet-500/20">
                                        <ShieldAlert className="text-violet-400" size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Session Expired</h2>
                                        <p className="text-slate-400 text-sm font-medium">Your 10-minute review window has closed. Please rate your experience to finalize the audit.</p>
                                    </div>

                                    <div className="flex justify-center gap-3">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className={cn(
                                                    "p-2 transition-all hover:scale-110",
                                                    rating >= star ? "text-amber-400" : "text-slate-700"
                                                )}
                                            >
                                                <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                                            </button>
                                        ))}
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            onClick={submitFeedback}
                                            disabled={rating === 0}
                                            className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Submit & Archive
                                        </button>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-4">Automated submission in 60s</p>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-6 py-8">
                                    <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-glow-emerald">
                                        <CheckCircle2 className="text-white" size={40} />
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Vault Secured</h2>
                                        <p className="text-slate-400 text-sm font-medium">Session logs encrypted and stored in your profile.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Main Editor & Controls */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    {/* Top Control Bar */}
                    <div className="glass px-8 py-4 rounded-[32px] border border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
                                    <Code2 className="text-white" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-white uppercase tracking-tight">Collaboration Session</h2>
                                    <p className="text-[10px] text-slate-500 font-mono tracking-widest leading-none mt-1">SNIPPET: AUTH-v2-REF-04</p>
                                </div>
                            </div>
                            <div className="h-6 w-px bg-white/10" />

                            {/* Session Timer Display */}
                            <div className={cn(
                                "px-4 py-2 rounded-xl border flex items-center gap-2 transition-all",
                                timeLeft < 60 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-white/5 border-white/5 text-slate-400"
                            )}>
                                <Timer size={14} className={timeLeft < 60 ? "animate-pulse" : ""} />
                                <span className="text-xs font-black italic tabular-nums">{formatTime(timeLeft)}</span>
                            </div>

                            <div className="flex -space-x-3">
                                {participants.map((p, i) => (
                                    <div key={i} className={cn("w-8 h-8 rounded-full border-2 border-[#0f172a] flex items-center justify-center font-bold text-[10px] text-white", p.color)}>
                                        {p.name[0]}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 bg-slate-900 border border-white/10 rounded-xl p-1">
                                <button className="p-2 text-slate-500 hover:text-white rounded-lg transition-all"><Video size={18} /></button>
                                <button className="p-2 text-slate-500 hover:text-white rounded-lg transition-all"><Mic size={18} /></button>
                            </div>
                            <button
                                onClick={handleSessionEnd}
                                className="px-6 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 text-xs font-bold rounded-xl border border-red-500/20 transition-all uppercase tracking-widest"
                            >
                                End Session
                            </button>
                        </div>
                    </div>

                    {/* Editor Container */}
                    <div className="flex-1 glass rounded-[40px] border border-white/5 overflow-hidden flex flex-col relative bg-slate-950/20 shadow-2xl">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                                </div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Live Editor • 3 Users active</span>
                            </div>
                            <button className="p-1.5 text-slate-500 hover:text-white transition-colors"><Settings size={16} /></button>
                        </div>

                        <div className="flex-1 p-10 font-mono text-sm leading-relaxed text-slate-300 relative overflow-y-auto custom-scrollbar">
                            <pre className="opacity-80">
                                {`const validateUser = async (id: string) => {
  const user = await db.users.findUnique({ where: { id } });
  
  if (!user) {`} <span className="inline-block w-[2px] h-[1.2rem] bg-blue-500 animate-pulse align-middle" /> <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded absolute -top-4 ml-1">Alex Dev</span>
                                {`     throw new Error('User not found');
  }

  return user;
};`}
                            </pre>
                        </div>

                        {/* Bottom Terminal Preview */}
                        <div className="h-24 bg-black/40 border-t border-white/5 p-4 flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                                <Terminal size={12} className="text-slate-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Output Log</span>
                            </div>
                            <p className="text-[11px] font-mono text-emerald-500/70">{`> Build successful in 452ms`}</p>
                            <p className="text-[11px] font-mono text-slate-600">{`> Starting local server on port 3000...`}</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info/Chat */}
                <aside className="w-96 flex flex-col glass rounded-[40px] border border-white/5 overflow-hidden shadow-2xl bg-black/20">
                    <div className="flex p-2 bg-slate-950/40 border-b border-white/5">
                        {['Chat', 'Participants', 'Session Info'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-2xl",
                                    activeTab === tab ? "bg-white/5 text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden">
                        {activeTab === 'Chat' && (
                            <>
                                <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-blue-400 uppercase">Alex Dev</span>
                                            <span className="text-[9px] text-slate-600">14:02</span>
                                        </div>
                                        <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                                            I'm adding the error handling block now.
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] text-slate-600">14:03</span>
                                            <span className="text-[10px] font-black text-violet-400 uppercase">YOU</span>
                                        </div>
                                        <div className="text-xs text-white bg-violet-600 p-3 rounded-2xl rounded-tr-none shadow-lg shadow-violet-600/10">
                                            Looks good! Let's also add type validation.
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 bg-black/40 border-t border-white/5">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Type a message..."
                                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all font-medium"
                                        />
                                        <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-violet-400 hover:text-white transition-all">
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'Participants' && (
                            <div className="p-6 space-y-4">
                                {participants.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold", p.color)}>
                                                {p.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white uppercase tracking-tight">{p.name}</p>
                                                <div className="flex items-center gap-1.5">
                                                    <Circle className={cn("fill-current", p.status === 'online' ? "text-emerald-500" : "text-slate-600")} size={8} />
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{p.role}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="p-2 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"><MoreHorizontal size={18} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </DashboardLayout>
    );
}
