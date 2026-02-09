'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    Users,
    Code2,
    ShieldCheck,
    Zap,
    X,
    CheckCircle2,
    Loader2,
    Sparkles,
    Globe2,
    Timer,
    ChevronRight,
    ArrowRight,
    Star,
    BrainCircuit,
    Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';

type MatchStatus = 'connecting' | 'searching' | 'negotiating' | 'found' | 'accepting' | 'handshaking' | 'ready';

export default function CodeReviewMatch() {
    const router = useRouter();
    const [status, setStatus] = useState<MatchStatus>('connecting');
    const [seconds, setSeconds] = useState(0);
    const [acceptTimer, setAcceptTimer] = useState(30);
    const [peerDetails, setPeerDetails] = useState<any>(null);

    // Main sequence simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds(s => s + 1);
        }, 1000);

        // State Machine Transitions
        const timeline = [
            { t: 1500, s: 'searching' as MatchStatus },
            { t: 6000, s: 'negotiating' as MatchStatus },
            {
                t: 8500,
                s: 'found' as MatchStatus,
                action: () => {
                    setPeerDetails({
                        username: 'sarah_rust_expert',
                        tier: 'Principal Architect',
                        reputation: 12450,
                        matchScore: 98,
                        avatar: 'SR',
                        location: 'Berlin, DE',
                        specialty: 'Systems Programming'
                    });
                }
            }
        ];

        const timeouts = timeline.map(({ t, s, action }) =>
            setTimeout(() => {
                setStatus(s);
                if (action) action();
            }, t)
        );

        return () => {
            clearInterval(interval);
            timeouts.forEach(clearTimeout);
        };
    }, []);

    // Acceptance Timer
    useEffect(() => {
        if (status === 'found' && acceptTimer > 0) {
            const timer = setInterval(() => setAcceptTimer(t => t - 1), 1000);
            return () => clearInterval(timer);
        } else if (status === 'found' && acceptTimer === 0) {
            handleReject();
        }
    }, [status, acceptTimer]);

    const handleAccept = () => {
        setStatus('handshaking');
        setTimeout(() => {
            setStatus('ready');
        }, 2000);
    };

    const handleReject = () => {
        setStatus('searching');
        setAcceptTimer(30);
        setPeerDetails(null);
        // Simulate a new search delay
        setTimeout(() => {
            setStatus('searching');
        }, 500);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 overflow-hidden relative">
            {/* Neural Background Grid */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)',
                backgroundSize: '40px 40px'
            }} />

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-violet-600 blur-[180px] animate-pulse rounded-full" />
                <div className="absolute inset-[30%] bg-blue-600 blur-[150px] animate-pulse rounded-full" style={{ animationDelay: '3s' }} />
            </div>

            <div className="max-w-2xl w-full relative z-10 transition-all duration-700">
                <div className={cn(
                    "glass p-12 rounded-[64px] border border-white/5 text-center space-y-10 shadow-3xl transition-all duration-1000",
                    status === 'found' || status === 'accepting' ? "scale-105 border-emerald-500/20 bg-emerald-500/[0.02]" : ""
                )}>

                    {/* Dynamic Status Visualizer */}
                    <div className="relative flex justify-center">
                        <div className={cn(
                            "w-40 h-40 rounded-[48px] flex items-center justify-center transition-all duration-700 relative z-10",
                            status === 'searching' || status === 'negotiating' || status === 'connecting'
                                ? "bg-violet-600/10 border border-violet-500/20"
                                : status === 'ready' || status === 'handshaking'
                                    ? "bg-emerald-500 border border-emerald-400 shadow-glow-emerald"
                                    : "bg-white/5 border border-white/10"
                        )}>
                            {status === 'connecting' && <Globe2 className="text-violet-500 animate-pulse" size={48} />}
                            {status === 'searching' && <Search className="text-violet-500 animate-spin-slow" size={48} />}
                            {status === 'negotiating' && <BrainCircuit className="text-blue-400 animate-pulse" size={48} />}
                            {(status === 'found' || status === 'accepting') && (
                                <div className="text-3xl font-black text-white italic">{acceptTimer}s</div>
                            )}
                            {status === 'handshaking' && <Loader2 className="text-emerald-500 animate-spin" size={48} />}
                            {status === 'ready' && <CheckCircle2 className="text-white animate-in zoom-in duration-500" size={56} />}
                        </div>

                        {/* Pulsing Rings for Search Mode */}
                        {(status === 'searching' || status === 'negotiating') && (
                            <>
                                <div className="absolute inset-0 border-2 border-violet-500/20 rounded-[48px] animate-ping pointer-events-none" />
                                <div className="absolute -inset-8 border border-violet-500/10 rounded-[64px] animate-ping pointer-events-none" style={{ animationDelay: '0.5s' }} />
                                <div className="absolute -inset-16 border border-violet-500/10 rounded-[80px] animate-pulse pointer-events-none" />
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                            {status === 'connecting' && 'Opening Uplink'}
                            {status === 'searching' && 'Scanning Local Cluster'}
                            {status === 'negotiating' && 'Negotiating Protocol'}
                            {status === 'found' && 'Candidate Resolved'}
                            {status === 'handshaking' && 'Establishing Tunnel'}
                            {status === 'ready' && 'Connection Secure'}
                        </h1>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm mx-auto">
                            {status === 'searching' && 'Analyzing code graph to identify compatible neural nodes...'}
                            {status === 'negotiating' && 'Evaluating peer availability and reputation scores...'}
                            {status === 'found' && 'A suitable peer has been identified. Review their profile below.'}
                            {status === 'ready' && 'Handshake successful. Redirecting to collaborative workspace.'}
                        </p>
                    </div>

                    {/* Peer Detail Card (Appears on 'found') */}
                    {peerDetails && status !== 'ready' && status !== 'handshaking' && (
                        <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-8 text-left animate-in fade-in slide-in-from-bottom-8 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <Zap size={80} className="text-emerald-400" />
                            </div>

                            <div className="flex items-center gap-6 mb-8 relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center font-black text-xl text-white italic shadow-lg">
                                    {peerDetails.avatar}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white uppercase tracking-tight">{peerDetails.username}</h3>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mt-1">{peerDetails.tier}</p>
                                </div>
                                <div className="ml-auto text-right">
                                    <div className="flex items-center gap-1.5 text-amber-400 mb-1">
                                        <Star size={14} fill="currentColor" />
                                        <span className="text-sm font-black italic">{peerDetails.matchScore}% Match</span>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">{peerDetails.location}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Specialty</p>
                                    <p className="text-xs text-white font-bold">{peerDetails.specialty}</p>
                                </div>
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Reputation</p>
                                    <p className="text-xs text-white font-bold">{peerDetails.reputation.toLocaleString()} XP</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats Dashboard (Searching mode) */}
                    {(status === 'searching' || status === 'negotiating' || status === 'connecting') && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-left">
                                <Timer className="text-violet-400 mb-3" size={20} />
                                <div className="text-xl font-black text-white italic">00:{seconds.toString().padStart(2, '0')}</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time in Queue</div>
                            </div>
                            <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-left">
                                <Users className="text-blue-400 mb-3" size={20} />
                                <div className="text-xl font-black text-white italic">4,281</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Peers</div>
                            </div>
                        </div>
                    )}

                    {/* Action Hub */}
                    <div className="pt-4 flex flex-col gap-4">
                        {status === 'found' ? (
                            <div className="flex gap-4">
                                <button
                                    onClick={handleReject}
                                    className="flex-1 py-5 glass border border-white/10 text-slate-400 hover:text-red-400 font-black rounded-[32px] transition-all uppercase tracking-widest"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="flex-[2] py-5 bg-white text-slate-950 font-black rounded-[32px] hover:bg-emerald-400 transition-all uppercase tracking-widest shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-2 group"
                                >
                                    Accept Match <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        ) : status === 'ready' ? (
                            <button
                                onClick={() => router.push('/collaboration/sessions/live-tunnel-' + Math.random().toString(36).slice(2, 8))}
                                className="w-full py-6 bg-emerald-500 text-white font-black rounded-[32px] hover:bg-emerald-400 transition-all uppercase tracking-widest shadow-2xl shadow-emerald-600/40 animate-in fade-in slide-in-from-bottom-4 flex items-center justify-center gap-3"
                            >
                                Enter Workspace <ChevronRight size={20} />
                            </button>
                        ) : status === 'handshaking' ? (
                            <button className="w-full py-6 bg-emerald-500/20 text-emerald-400 font-black rounded-[32px] uppercase tracking-widest cursor-wait flex items-center justify-center gap-3">
                                Synchronizing...
                            </button>
                        ) : (
                            <button
                                onClick={() => router.back()}
                                className="w-full py-5 glass border border-white/10 text-slate-500 hover:text-white font-black rounded-[32px] transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
                            >
                                <X size={18} className="group-hover:text-red-500 transition-colors" /> Cancel Uplink
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="mt-8 flex items-center justify-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] relative">
                    <Sparkles size={14} className="text-violet-800" /> Powered by Sunder Neural Matching Engine
                </div>
            </div>
        </div>
    );
}
