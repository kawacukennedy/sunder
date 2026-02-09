'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Activity,
    Code2,
    Users,
    Zap,
    Trophy,
    Calendar,
    Filter,
    ArrowUpRight,
    Search,
    ChevronRight,
    History,
    FileCode,
    MessageSquare,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const activityItems = [
    {
        id: 1,
        type: 'snippet_created',
        title: 'Neural Network Optimizer',
        description: 'Created a new snippet in Python',
        timestamp: '2 hours ago',
        icon: FileCode,
        color: 'text-violet-400',
        bgColor: 'bg-violet-500/10'
    },
    {
        id: 2,
        type: 'collaboration',
        title: 'Review: API Middleware',
        description: 'Collaborated with @alex_dev on performance optimization',
        timestamp: '5 hours ago',
        icon: Users,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10'
    },
    {
        id: 3,
        type: 'ai_translation',
        title: 'Auth Flow Translation',
        description: 'Translated TypeScript to Rust with 98% accuracy',
        timestamp: 'Yesterday',
        icon: Zap,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10'
    },
    {
        id: 4,
        type: 'achievement',
        title: 'The Architect Unlocked',
        description: 'Saved 100 snippets across 5 different languages',
        timestamp: '2 days ago',
        icon: Trophy,
        color: 'text-fuchsia-400',
        bgColor: 'bg-fuchsia-500/10'
    },
    {
        id: 5,
        type: 'ai_suggestion',
        title: 'Refactor Suggestion',
        description: 'AI suggested a more idiomatic way to handle async loops',
        timestamp: '3 days ago',
        icon: Sparkles,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10'
    }
];

export default function ActivityPage() {
    const [filter, setFilter] = useState('all');

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                <History className="text-violet-400" size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">
                                Activity <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Timeline</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 font-medium">Your absolute record of code evolution and collaboration.</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search timeline..."
                                className="pl-10 pr-4 py-2 bg-slate-800/50 border border-white/5 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all w-64"
                            />
                        </div>
                        <div className="flex items-center p-1 bg-slate-800/50 border border-white/5 rounded-xl">
                            {['all', 'code', 'social', 'ai'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                                        filter === f
                                            ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                                            : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Timeline Content */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-4">
                        {activityItems.map((item, idx) => (
                            <div
                                key={item.id}
                                className="group relative pl-10 pb-4 last:pb-0"
                            >
                                {/* Continuous Vertical Line */}
                                {idx !== activityItems.length - 1 && (
                                    <div className="absolute left-4 top-10 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
                                )}

                                {/* Floating Icon */}
                                <div className={cn(
                                    "absolute left-0 top-0 w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 shadow-lg transition-transform group-hover:scale-110 duration-300",
                                    item.bgColor
                                )}>
                                    <item.icon className={item.color} size={18} />
                                </div>

                                {/* Content Card */}
                                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-sm group-hover:bg-white/[0.06] group-hover:border-white/10 transition-all duration-300 shadow-xl overflow-hidden group/card relative">
                                    {/* Subtle Ambient Glow */}
                                    <div className={cn(
                                        "absolute -right-20 -top-20 w-40 h-40 blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500",
                                        item.bgColor.replace('bg-', 'bg-')
                                    )} />

                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-base font-bold text-white tracking-tight">{item.title}</h3>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 py-0.5 px-2 bg-white/5 rounded-full border border-white/5">
                                                    {item.type.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">
                                                <Calendar size={12} />
                                                {item.timestamp}
                                            </div>
                                            <button className="p-2 rounded-lg bg-white/5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white hover:bg-white/10">
                                                <ArrowUpRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button className="w-full py-4 rounded-2xl border border-dashed border-white/10 text-slate-500 text-xs font-black uppercase tracking-[0.2em] hover:border-violet-500/30 hover:text-violet-400 transition-all group backdrop-blur-sm bg-white/[0.02]">
                            Load Massive History <span className="inline-block group-hover:translate-y-1 transition-transform">↓</span>
                        </button>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 border border-white/10 shadow-2xl relative overflow-hidden group">
                            <Zap className="absolute -right-4 -bottom-4 text-white/10 group-hover:scale-110 transition-transform duration-700" size={120} />
                            <h4 className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Productivity Pulse</h4>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-end justify-between">
                                    <span className="text-4xl font-black text-white italic tracking-tighter">74%</span>
                                    <span className="text-[10px] font-bold text-violet-200 uppercase tracking-widest mb-1">+12% vs LY</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-3/4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
                                </div>
                                <p className="text-xs text-violet-100/70 font-medium">Your coding velocity has hit a new peak this week.</p>
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/5 backdrop-blur-xl space-y-6 shadow-xl">
                            <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Engagement Mix</h4>
                            <div className="space-y-4">
                                {[
                                    { label: 'AI Synthesis', value: 45, color: 'bg-violet-500' },
                                    { label: 'Direct Code', value: 30, color: 'bg-emerald-500' },
                                    { label: 'Collaboration', value: 25, color: 'bg-amber-500' }
                                ].map((stat) => (
                                    <div key={stat.label} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-slate-400">{stat.label}</span>
                                            <span className="text-white">{stat.value}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className={cn("h-full rounded-full transition-all duration-1000", stat.color)} style={{ width: `${stat.value}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-slate-900/50 border border-white/5 backdrop-blur-xl shadow-xl">
                            <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">System Alerts</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 group cursor-pointer hover:bg-amber-500/10 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <p className="text-[10px] text-amber-200/80 font-bold uppercase tracking-tight">AI Model Update Available</p>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-violet-500/5 border border-violet-500/10 group cursor-pointer hover:bg-violet-500/10 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                                    <p className="text-[10px] text-violet-200/80 font-bold uppercase tracking-tight">New Badge: Forge Master</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
