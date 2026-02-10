'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    LineChart,
    BarChart3,
    PieChart,
    TrendingUp,
    Zap,
    Target,
    Clock,
    Activity,
    ChevronUp,
    ChevronDown,
    BrainCircuit,
    Code2,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const analyticsData = {
    velocity: {
        score: 84,
        change: +12,
        history: [65, 72, 68, 80, 78, 84]
    },
    languageMix: [
        { name: 'TypeScript', value: 45, color: 'bg-blue-500' },
        { name: 'Python', value: 25, color: 'bg-amber-500' },
        { name: 'Rust', value: 20, color: 'bg-orange-500' },
        { name: 'Go', value: 10, color: 'bg-cyan-500' }
    ],
    qualityMetrics: [
        { label: 'Functional Parity', value: 99.2, target: 98 },
        { label: 'Documentation', value: 85, target: 90 },
        { label: 'Efficiency', value: 92, target: 85 }
    ]
};

export default function DashboardOverview() {
    const [timeframe, setTimeframe] = useState('7D');

    return (
        <DashboardLayout>
            <div className="space-y-10 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                                <Activity className="text-violet-400" size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">
                                Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Analytics</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 font-medium">Deep-dive into your architectural evolution and coding velocity.</p>
                    </div>

                    <div className="flex items-center p-1 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-xl">
                        {['24H', '7D', '30D', 'All'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setTimeframe(t)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    timeframe === t
                                        ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                                        : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Performance Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Velocity Score */}
                    <div className="md:col-span-2 glass p-10 rounded-[3rem] border border-white/5 bg-gradient-to-br from-violet-600/5 to-transparent relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={120} />
                        </div>
                        <div className="relative z-10 flex flex-col h-full">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8">Engineering Velocity</h3>
                            <div className="flex items-end gap-6 mb-12">
                                <span className="text-7xl font-black text-white italic tracking-tighter">84.2</span>
                                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-4 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                    <ChevronUp size={16} />
                                    <span className="text-xs tracking-widest">12%</span>
                                </div>
                            </div>
                            <div className="flex-1 flex items-end gap-2 min-h-[160px]">
                                {analyticsData.velocity.history.map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                                        <div
                                            className="w-full bg-violet-600/20 rounded-xl group-hover/bar:bg-violet-600/40 transition-all border border-violet-500/20 relative"
                                            style={{ height: `${h}%` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-violet-600/30 to-transparent" />
                                        </div>
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Day {i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Language Mix */}
                    <div className="glass p-10 rounded-[3rem] border border-white/5 bg-slate-900/20 flex flex-col">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Language Proliferation</h3>
                        <div className="flex-1 flex items-center justify-center relative">
                            {/* Simple Pie Representation */}
                            <div className="w-40 h-40 rounded-full border-[20px] border-slate-800 flex items-center justify-center group">
                                <div className="text-center group-hover:scale-110 transition-transform">
                                    <div className="text-3xl font-black text-white italic">4</div>
                                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Cores</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 mt-10">
                            {analyticsData.languageMix.map((lang) => (
                                <div key={lang.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-2 rounded-full", lang.color)} />
                                        <span className="text-xs font-bold text-slate-300">{lang.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-white">{lang.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quality Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {analyticsData.qualityMetrics.map((metric) => (
                        <div key={metric.label} className="glass p-8 rounded-[2.5rem] border border-white/5 hover:border-violet-500/30 transition-all bg-white/[0.01]">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{metric.label}</h4>
                                <div className={cn(
                                    "px-2 py-1 rounded-lg text-[10px] font-black",
                                    metric.value >= metric.target ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10"
                                )}>
                                    Target: {metric.target}%
                                </div>
                            </div>
                            <div className="flex items-end justify-between mb-4">
                                <span className="text-4xl font-black text-white italic tracking-tighter">{metric.value}%</span>
                                {metric.value >= metric.target ? (
                                    <Zap size={20} className="text-emerald-500 fill-emerald-500 mb-1" />
                                ) : (
                                    <Target size={20} className="text-amber-500 mb-1" />
                                )}
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={cn("h-full rounded-full transition-all duration-1000", metric.value >= metric.target ? "bg-emerald-500" : "bg-amber-500")}
                                    style={{ width: `${metric.value}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary View */}
                <div className="p-12 rounded-[3.5rem] bg-gradient-to-r from-violet-600 to-fuchsia-600 border border-white/10 shadow-2xl relative overflow-hidden group">
                    <BrainCircuit className="absolute -right-10 -bottom-10 text-white/10 group-hover:scale-110 transition-transform duration-700" size={240} />
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Vortex Intelligence Synthesis</h3>
                            <p className="text-violet-100/70 font-medium leading-relaxed">
                                Your current engineering pattern shows a 24% increase in recursive efficiency. We recommend exploring the <span className="text-white underline decoration-white/30">Rust Systems Course</span> to further optimize your memory management score.
                            </p>
                            <button className="px-10 py-4 bg-white text-slate-950 text-xs font-black rounded-2xl hover:scale-105 transition-all uppercase tracking-widest shadow-xl">
                                Detailed AI Report
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 rounded-3xl bg-black/20 backdrop-blur-md border border-white/10">
                                <div className="text-2xl font-black text-white italic">1.2ms</div>
                                <div className="text-[10px] font-bold text-violet-200/50 uppercase tracking-widest mt-1">Avg Latency</div>
                            </div>
                            <div className="p-6 rounded-3xl bg-black/20 backdrop-blur-md border border-white/10">
                                <div className="text-2xl font-black text-white italic">99.8%</div>
                                <div className="text-[10px] font-bold text-violet-200/50 uppercase tracking-widest mt-1">Logical Purity</div>
                            </div>
                            <div className="p-6 rounded-3xl bg-black/20 backdrop-blur-md border border-white/10">
                                <div className="text-2xl font-black text-white italic">14</div>
                                <div className="text-[10px] font-bold text-violet-200/50 uppercase tracking-widest mt-1">Cores Optimized</div>
                            </div>
                            <div className="p-6 rounded-3xl bg-black/20 backdrop-blur-md border border-white/10">
                                <div className="text-2xl font-black text-white italic">#34</div>
                                <div className="text-[10px] font-bold text-violet-200/50 uppercase tracking-widest mt-1">Global Efficiency</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
