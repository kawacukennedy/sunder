'use client';

import {
    Cpu,
    Zap,
    Activity,
    TrendingUp,
    Box,
    ShieldCheck,
    AlertCircle,
    Clock,
    BarChart3,
    Settings2,
    RefreshCw,
    Database,
    Binary,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const models = [
    { name: 'Gemini 1.5 Pro', status: 'Optimal', latency: '24ms', load: '64%', tokens: '1.2M' },
    { name: 'Sunder Code Synthesis v3', status: 'High Load', latency: '82ms', load: '92%', tokens: '850k' },
    { name: 'Vector Embedding Engine', status: 'Optimal', latency: '12ms', load: '14%', tokens: '4M' }
];

export default function AdminAI() {
    const [refreshing, setRefreshing] = useState(false);

    const handleSync = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 2000);
    };

    return (
        <div className="space-y-10 max-w-6xl mx-auto py-10 px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                            <Cpu className="text-violet-400" size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">
                            Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Orchestration</span>
                        </h1>
                    </div>
                    <p className="text-slate-400 font-medium">Real-time control over system-wide AI clusters and token liquidity.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSync}
                        className="px-6 py-3 glass hover:bg-white/10 text-white text-[10px] font-black rounded-xl transition-all uppercase tracking-widest flex items-center gap-2"
                    >
                        <RefreshCw size={14} className={cn(refreshing && "animate-spin")} /> Re-Sync Clusters
                    </button>
                    <button className="px-6 py-3 bg-white text-slate-950 text-[10px] font-black rounded-xl hover:scale-105 transition-all uppercase tracking-widest flex items-center gap-2">
                        <Settings2 size={14} /> Global Params
                    </button>
                </div>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* System Health */}
                <div className="lg:col-span-2 glass p-10 rounded-[3rem] border border-white/5 bg-gradient-to-br from-violet-600/5 to-transparent flex flex-col gap-10">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Aggregate Neural Health</h3>
                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            <ShieldCheck size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Normal</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: 'Uptime', value: '99.99%', sub: 'Global' },
                            { label: 'Avg Latency', value: '32ms', sub: '-4ms vs P50' },
                            { label: 'Throughput', value: '4.2k', sub: 'req/sec' },
                            { label: 'Error Rate', value: '0.002%', sub: 'Sub-minimal' }
                        ].map((m, i) => (
                            <div key={i} className="space-y-1">
                                <div className="text-2xl font-black text-white italic tracking-tighter">{m.value}</div>
                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</div>
                                <div className="text-[8px] font-black text-slate-600 uppercase tracking-tight">{m.sub}</div>
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 h-32 bg-slate-950/50 rounded-3xl border border-white/5 relative overflow-hidden flex items-end px-6 gap-1">
                        {Array.from({ length: 48 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-violet-500/20 border-t border-violet-500/30 rounded-t-sm"
                                style={{ height: `${20 + Math.random() * 60}%` }}
                            />
                        ))}
                    </div>
                </div>

                {/* Token Orchestration */}
                <div className="glass p-10 rounded-[3rem] border border-white/5 bg-slate-900/20 flex flex-col gap-8">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Token Liquidity</h3>
                    <div className="space-y-6">
                        <div className="flex flex-col items-center justify-center p-8 bg-black/40 rounded-[2.5rem] border border-white/5 relative overflow-hidden group">
                            <Sparkles className="absolute text-violet-500/10 -right-4 -bottom-4 group-hover:scale-110 transition-transform" size={100} />
                            <div className="text-4xl font-black text-white italic tracking-tighter">8.4M</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Allocated Tokens</div>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Burn Rate', value: '42k / hr', color: 'bg-orange-500' },
                                { label: 'Reservation', value: '1.2M', color: 'bg-blue-500' },
                                { label: 'Available', value: '3.1M', color: 'bg-emerald-500' }
                            ].map((s) => (
                                <div key={s.label} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-500">{s.label}</span>
                                        <span className="text-white">{s.value}</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full", s.color)} style={{ width: '45%' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Model Fleet */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Neural Fleet Status</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase">
                        <Activity size={12} />
                        Sync: 12s ago
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {models.map((model) => (
                        <div key={model.name} className="glass p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:border-violet-500/30 transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{model.name}</h4>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                    model.status === 'Optimal' ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-orange-400 bg-orange-500/10 border border-orange-500/20"
                                )}>
                                    {model.status}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Latency</p>
                                    <p className="text-lg font-black text-white italic">{model.latency}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Compute Load</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-lg font-black text-white italic">{model.load}</p>
                                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-violet-600" style={{ width: model.load }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
