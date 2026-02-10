'use client';

import {
    ShieldAlert,
    Flag,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    MoreVertical,
    Eye,
    History,
    Filter,
    Search,
    UserX,
    MessageSquare,
    Zap,
    Cpu,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const flags = [
    {
        id: '1',
        target: 'Snippet: Auth Middleware',
        reporter: 'Neural_Ghost',
        reason: 'Malicious Payload Pattern',
        severity: 'Critical',
        status: 'pending',
        timestamp: '2 hours ago',
        ai_analysis: '92% probability of logic bomb'
    },
    {
        id: '2',
        target: 'User: Alex_Dev',
        reporter: 'System_Sentinel',
        reason: 'Spam Activity Detected',
        severity: 'High',
        status: 'under_review',
        timestamp: '5 hours ago',
        ai_analysis: 'Repetitive generation patterns typical of automated nodes'
    },
    {
        id: '3',
        target: 'Organization: Dark_Core',
        reporter: 'VoidWalker_32',
        reason: 'Offensive Manifesto',
        severity: 'Medium',
        status: 'resolved',
        timestamp: 'Yesterday',
        ai_analysis: 'Violates Section 4.b of Social Conduct Protocol'
    }
];

export default function AdminModeration() {
    const [filter, setFilter] = useState('pending');

    return (
        <div className="space-y-10 max-w-6xl mx-auto py-10 px-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                            <ShieldAlert className="text-red-400" size={24} />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">
                            Sentinels <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Moderation</span>
                        </h1>
                    </div>
                    <p className="text-slate-400 font-medium">Global content quarantine and entity policing interface.</p>
                </div>

                <div className="flex items-center p-1 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-xl">
                    {['pending', 'under_review', 'resolved'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === f
                                    ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                                    : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Active Flags', value: '142', icon: Flag, color: 'text-red-400' },
                    { label: 'Critical Threat', value: '12', icon: AlertTriangle, color: 'text-orange-400' },
                    { label: 'AI Resolvability', value: '84%', icon: Cpu, color: 'text-violet-400' },
                    { label: 'Avg Resolution', value: '1.2h', icon: History, color: 'text-emerald-400' }
                ].map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-3xl border border-white/5 flex flex-col gap-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color.replace('text', 'bg').replace('400', '500/10'))}>
                            <stat.icon size={20} className={stat.color} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-white italic tracking-tighter">{stat.value}</div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Flags Queue */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-6 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    <div className="flex items-center gap-12">
                        <span className="w-8">ID</span>
                        <span className="w-64">Entity Context</span>
                    </div>
                    <span className="w-32 text-center">Severity</span>
                    <span className="w-48">AI Assessment</span>
                    <span className="w-24 text-right">Actions</span>
                </div>

                {flags.filter(f => filter === 'all' || f.status === filter).map((flag) => (
                    <div key={flag.id} className="glass p-6 rounded-[2.5rem] border border-white/5 bg-white/[0.01] hover:border-red-500/20 transition-all group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-12">
                                <span className="text-[10px] font-black text-slate-700 italic w-8">#{flag.id}</span>
                                <div className="w-64">
                                    <h4 className="text-sm font-black text-white uppercase tracking-tight italic">{flag.target}</h4>
                                    <p className="text-[10px] text-slate-500 font-bold mt-1">Reported by @{flag.reporter} • {flag.timestamp}</p>
                                </div>
                            </div>

                            <div className="w-32 flex justify-center">
                                <span className={cn(
                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                    flag.severity === 'Critical' ? "text-red-400 border-red-500/30 bg-red-500/10" :
                                        flag.severity === 'High' ? "text-orange-400 border-orange-500/30 bg-orange-500/10" :
                                            "text-amber-400 border-amber-500/30 bg-amber-500/10"
                                )}>
                                    {flag.severity}
                                </span>
                            </div>

                            <div className="w-48">
                                <div className="flex items-center gap-2 mb-2">
                                    <Cpu size={12} className="text-violet-400" />
                                    <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Automated Insight</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                                    {flag.ai_analysis}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-xl border border-emerald-500/20 transition-all group-hover:shadow-lg group-hover:shadow-emerald-600/20">
                                    <CheckCircle2 size={16} />
                                </button>
                                <button className="p-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all group-hover:shadow-lg group-hover:shadow-red-600/20">
                                    <XCircle size={16} />
                                </button>
                                <button className="p-3 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-xl border border-white/5 transition-all">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bulk Actions */}
            <div className="p-8 rounded-[3rem] border border-white/5 bg-slate-900/40 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-600/10 flex items-center justify-center">
                        <Zap className="text-violet-400" size={24} />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Vortex Auto-Clear</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Initialize AI-powered bulk resolution for low-risk flags</p>
                    </div>
                </div>
                <button className="px-10 py-4 bg-violet-600 hover:bg-violet-550 text-white text-[10px] font-black rounded-2xl transition-all uppercase tracking-widest shadow-2xl shadow-violet-600/20">
                    Execute Optimization
                </button>
            </div>
        </div>
    );
}
