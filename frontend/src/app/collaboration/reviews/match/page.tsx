'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Users,
    Search,
    BrainCircuit,
    Zap,
    Trophy,
    ShieldCheck,
    Clock,
    ArrowRight,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { cn, fetchApi } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

type MatchStatus = 'connecting' | 'ready' | 'searching' | 'negotiating' | 'found' | 'handshaking';

export default function CodeReviewMatch() {
    const router = useRouter();
    const [status, setStatus] = useState<MatchStatus>('connecting');
    const [peerDetails, setPeerDetails] = useState<any>(null);
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);

        let initialTimer: NodeJS.Timeout;
        if (status === 'connecting') {
            initialTimer = setTimeout(() => {
                setStatus('ready');
            }, 1500);
        }

        return () => {
            clearInterval(interval);
            if (initialTimer) clearTimeout(initialTimer);
        };
    }, [status]);

    const startMatching = async () => {
        setStatus('searching');
        try {
            const response = await fetchApi('/collaboration/reviews/match', {
                method: 'POST',
                body: JSON.stringify({
                    preferences: {
                        experience_level: 'senior',
                        topic: 'System Architecture',
                        duration: 3600
                    }
                })
            });

            // Simulate a brief searching period for UX
            setTimeout(() => {
                setStatus('negotiating');
                setTimeout(() => {
                    setPeerDetails(response.matched_user);
                    setStatus('found');
                }, 2000);
            }, 3000);
        } catch (error) {
            console.error('Matchmaking failed:', error);
            setStatus('ready');
        }
    };

    const enterWorkspace = () => {
        setStatus('handshaking');
        setTimeout(() => {
            router.push(`/collaboration/sessions/REV_${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
        }, 2000);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex items-center justify-center">
                <div className="w-full">
                    <AnimatePresence mode="wait">
                        {status === 'connecting' ? (
                            <motion.div
                                key="connecting"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="text-center space-y-8"
                            >
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 border border-white/5 flex items-center justify-center relative z-10">
                                        <Users className="text-violet-400 animate-pulse" size={48} />
                                    </div>
                                    <div className="absolute inset-0 bg-violet-500/20 blur-[60px] rounded-full animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-black text-white uppercase italic tracking-widest">Initializing Matchmaker</h1>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Connecting to Peer Enclaves...</p>
                                </div>
                            </motion.div>
                        ) : status === 'ready' ? (
                            <motion.div
                                key="ready"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass p-12 rounded-[56px] border border-white/5 bg-white/[0.02] text-center space-y-10"
                            >
                                <div className="space-y-4">
                                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                                        Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400">Architect</span>
                                    </h1>
                                    <p className="text-slate-400 font-medium">Connect with top-tier developers for real-time code reviews and pairing.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Active Peers', value: '42', icon: Users, color: 'text-violet-400' },
                                        { label: 'Expert Ratio', value: '98%', icon: Trophy, color: 'text-amber-400' },
                                        { label: 'Avg Wait', value: '12s', icon: Clock, color: 'text-emerald-400' }
                                    ].map((stat, i) => (
                                        <div key={i} className="p-6 bg-slate-900/50 rounded-3xl border border-white/5 space-y-2">
                                            <stat.icon className={stat.color} size={20} />
                                            <p className="text-2xl font-black text-white italic">{stat.value}</p>
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={startMatching}
                                    className="w-full py-6 bg-white text-slate-950 font-black rounded-[32px] hover:bg-slate-200 transition-all shadow-2xl shadow-white/10 uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 group"
                                >
                                    Start Matchmaking <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                            </motion.div>
                        ) : (status === 'searching' || status === 'negotiating') ? (
                            <motion.div
                                key="searching"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center space-y-12"
                            >
                                <div className="relative inline-block">
                                    <div className="w-48 h-48 rounded-[3.5rem] bg-slate-900 border border-white/5 flex items-center justify-center relative z-10 overflow-hidden">
                                        <div className="absolute inset-0 border-2 border-violet-500/20 rounded-[3.5rem]" />
                                        <div className="absolute inset-2 border border-violet-500/10 rounded-[3rem]" />
                                        <div className="absolute inset-0 bg-violet-500/5 animate-[pulse_2s_infinite]" />
                                        <Loader2 className="text-violet-400 animate-spin" size={64} strokeWidth={1} />
                                    </div>
                                    <div className="absolute inset-0 bg-violet-600/10 blur-[80px] rounded-full animate-pulse" />
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black text-white uppercase italic tracking-widest">
                                        {status === 'searching' ? 'Scanning Local Nodes' : 'Negotiating Connection'}
                                    </h2>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
                                        Wait Time: {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
                                    </p>
                                </div>
                            </motion.div>
                        ) : status === 'found' ? (
                            <motion.div
                                key="found"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-2xl w-full"
                            >
                                <div className="glass p-12 rounded-[56px] border border-emerald-500/30 bg-emerald-500/[0.02] shadow-[0_0_80px_rgba(16,185,129,0.1)] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8">
                                        <div className="px-4 py-2 bg-emerald-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-2">
                                            <ShieldCheck size={14} /> 98% Match
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center text-center space-y-8">
                                        <div className="w-24 h-24 rounded-3xl bg-emerald-500 flex items-center justify-center text-white text-3xl font-black italic shadow-2xl shadow-emerald-500/40">
                                            {peerDetails?.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">{peerDetails?.display_name || peerDetails?.username}</h2>
                                            <p className="text-emerald-400 font-black uppercase text-[10px] tracking-widest">{peerDetails?.experience_level || 'Senior Architect'}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 w-full">
                                            <div className="p-6 bg-slate-900/50 rounded-[32px] border border-white/5 flex flex-col items-center gap-2 text-center">
                                                <Zap className="text-amber-400" size={20} />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expertise</span>
                                                <span className="text-xs font-bold text-white uppercase">Systems</span>
                                            </div>
                                            <div className="p-6 bg-slate-900/50 rounded-[32px] border border-white/5 flex flex-col items-center gap-2 text-center">
                                                <ArrowRight className="text-blue-400" size={20} />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reputation</span>
                                                <span className="text-xs font-bold text-white uppercase">Elite</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={enterWorkspace}
                                            className="w-full py-6 bg-emerald-500 text-white font-black rounded-[32px] hover:bg-emerald-400 transition-all uppercase tracking-widest shadow-2xl shadow-emerald-600/40 flex items-center justify-center gap-3"
                                        >
                                            Enter Workspace <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : status === 'handshaking' ? (
                            <motion.div
                                key="handshaking"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center space-y-8"
                            >
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 border border-emerald-500/20 flex items-center justify-center">
                                        <BrainCircuit className="text-emerald-400 animate-spin" size={48} strokeWidth={1} />
                                    </div>
                                    <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-black text-white uppercase italic tracking-widest">Synthesizing Workspace</h1>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Creating Neural Tunnel...</p>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
}
