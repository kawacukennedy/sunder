'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Activity,
    Users,
    FileCode,
    ShieldAlert,
    BarChart3,
    Search,
    Filter,
    MoreHorizontal,
    ExternalLink,
    Terminal,
    Zap,
    Cpu,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Lock
} from 'lucide-react';
import { useState } from 'react';
import { cn, fetchApi } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('Overview');
    const tabs = ['Overview', 'Users', 'Snippets', 'AI Audit', 'Security'];

    const { data: metrics, isLoading: isMetricsLoading } = useQuery({
        queryKey: ['admin-metrics'],
        queryFn: () => fetchApi('/admin/metrics')
    });

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Admin Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 rounded-[28px] flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <ShieldAlert className="text-white relative z-10" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-white uppercase tracking-tighter italic leading-none mb-2">Systems Command</h1>
                            <p className="text-slate-400 font-medium">Global infrastructure orchestration and governance module</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">All Systems Nominal</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-2xl border border-white/5 w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === tab
                                    ? "bg-white text-slate-950 shadow-2xl"
                                    : "text-slate-500 hover:text-white"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="space-y-10">
                    {activeTab === 'Overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                {[
                                    { label: 'Total Entities', value: metrics?.totalUsers || '0', icon: Users, color: 'text-blue-400', trend: '+12.5%', isUp: true },
                                    { label: 'Shared Logic', value: metrics?.totalSnippets || '0', icon: FileCode, color: 'text-violet-400', trend: '+45.2%', isUp: true },
                                    { label: 'Neural Calls', value: '45.2k', icon: Cpu, color: 'text-amber-400', trend: '+18.1%', isUp: true },
                                    { label: 'System Health', value: '99.98%', icon: Activity, color: 'text-emerald-400', trend: '-0.02%', isUp: false },
                                ].map((stat, i) => (
                                    <div key={i} className="glass p-8 rounded-[40px] border border-white/5 bg-white/[0.02] group hover:border-white/10 transition-all">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={cn("p-3 bg-white/5 rounded-2xl", stat.color)}><stat.icon size={24} /></div>
                                            <div className={cn(
                                                "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest",
                                                stat.isUp ? "text-emerald-400" : "text-red-400"
                                            )}>
                                                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {stat.trend}
                                            </div>
                                        </div>
                                        <p className="text-4xl font-black text-white mb-2">{stat.value}</p>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-8 glass rounded-[48px] p-10 border border-white/5 bg-slate-950/20">
                                    <div className="flex items-center justify-between mb-10">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Traffic Intensity</h3>
                                        <div className="flex items-center gap-2">
                                            {['1H', '24H', '7D', '30D'].map(p => (
                                                <button key={p} className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-500 hover:text-white transition-all">{p}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-64 w-full flex items-end gap-2 group">
                                        {Array.from({ length: 48 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 bg-violet-600/20 rounded-t-sm group-hover:bg-violet-600/40 transition-all duration-500 cursor-pointer hover:bg-violet-500"
                                                style={{ height: `${Math.random() * 80 + 20}%` }}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                        <span>00:00</span>
                                        <span>12:00</span>
                                        <span>23:59</span>
                                    </div>
                                </div>

                                <div className="lg:col-span-4 glass rounded-[48px] p-10 border border-white/5 bg-violet-600/5 flex flex-col">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight italic mb-8">System Feeds</h3>
                                    <div className="space-y-6 flex-1">
                                        {[
                                            { type: 'Alert', msg: 'Neural Load Spike in US-EAST', time: '2m', color: 'text-amber-400' },
                                            { type: 'Security', msg: 'Multiple Auth Failures (IP: 192.x)', time: '14m', color: 'text-red-400' },
                                            { type: 'System', msg: 'Backup cycle complete (s3-archive)', time: '1h', color: 'text-emerald-400' },
                                        ].map((feed, i) => (
                                            <div key={i} className="flex gap-4">
                                                <div className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", feed.color.replace('text', 'bg'))} />
                                                <div>
                                                    <p className="text-xs text-white font-bold leading-tight">{feed.msg}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{feed.type} • {feed.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all mt-8">
                                        View All Logs
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Users' && (
                        <div className="glass rounded-[48px] border border-white/5 overflow-hidden bg-slate-950/20 shadow-2xl">
                            <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-6">
                                    <div className="relative group w-96">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search user entities..."
                                            className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all font-medium"
                                        />
                                    </div>
                                    <button className="p-4 bg-slate-900 border border-white/10 rounded-2xl text-slate-500 hover:text-white transition-all">
                                        <Filter size={20} />
                                    </button>
                                </div>
                                <div className="flex gap-4">
                                    <button className="px-6 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all">Moderate All</button>
                                    <button className="px-8 py-3 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-white/10 transition-all hover:bg-slate-200 italic">Export Audit</button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-white/5">
                                        <tr className="border-b border-white/5">
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Entity Signature</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Access Tier</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Temporal Origin</th>
                                            <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Intervention</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center font-black text-white italic">U{i}</div>
                                                        <div>
                                                            <p className="text-sm font-bold text-white uppercase tracking-tight">ENTITY_{i * 452}</p>
                                                            <p className="text-[10px] text-slate-500 font-bold lowercase tracking-wide italic">dev_{i}@vortex.io</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="px-3 py-1 bg-violet-600/10 text-violet-400 border border-violet-500/20 rounded-lg text-[10px] font-black uppercase tracking-widest">Pro Elite</span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                                                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Authorized</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-[10px] text-slate-500 font-mono">2026.02.09.12.33.15</td>
                                                <td className="px-10 py-6 text-right">
                                                    <button className="p-2 text-slate-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"><MoreHorizontal size={20} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Snippets' && (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between bg-slate-950/40 p-10 rounded-[48px] border border-white/5">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Moderation Queue</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Flagged Entities for Review</p>
                                </div>
                                <div className="flex gap-4">
                                    <span className="px-6 py-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest">12 Flagged</span>
                                    <span className="px-6 py-3 bg-white/5 text-slate-400 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest italic">34 Pending Approval</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="glass p-8 rounded-[40px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col md:flex-row gap-8 items-start md:items-center">
                                        <div className="w-16 h-16 rounded-[24px] bg-slate-900 border border-white/10 flex items-center justify-center relative">
                                            <FileCode className="text-slate-500" size={24} />
                                            <ShieldAlert className="absolute -top-2 -right-2 text-red-500" size={20} />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-lg font-black text-white uppercase italic">Neural_Exploit_Vector_{i}.rs</h4>
                                                <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded uppercase tracking-tighter">Malicious Logic</span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Reported by <span className="text-white font-bold">@security_bot</span> • Potential prompt injection detected in internal neural layer.</p>
                                            <div className="flex items-center gap-6 mt-4">
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Reporter: sarah_ax</span>
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Impact: High</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 w-full md:w-auto">
                                            <button className="flex-1 md:flex-none px-6 py-3 bg-white/10 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">Dismiss</button>
                                            <button className="flex-1 md:flex-none px-8 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all hover:bg-red-500 italic">Quarantine</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Security' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Real-time System Log Viewer */}
                            <div className="lg:col-span-8 glass rounded-[48px] border border-white/5 bg-slate-950 overflow-hidden flex flex-col h-[700px]">
                                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <div className="flex items-center gap-4">
                                        <Terminal size={20} className="text-emerald-500" />
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Live System Stream</h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[9px] font-black uppercase italic animate-pulse">Connected</div>
                                    </div>
                                </div>
                                <div className="p-8 font-mono text-[11px] space-y-2 overflow-y-auto custom-scrollbar flex-1 bg-black/40">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(i => (
                                        <div key={i} className="flex gap-4 group">
                                            <span className="text-slate-700 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                                            <span className="text-emerald-500 shrink-0 uppercase font-black">INFO</span>
                                            <span className="text-slate-400 leading-relaxed">Infrastructure node {i * 12}.sunder.app synthesized successful handshake with Neural-S7-Core. Latency: <span className="text-white">14ms</span></span>
                                        </div>
                                    ))}
                                    <div className="flex gap-4 text-amber-400 group">
                                        <span className="text-slate-700 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                                        <span className="text-amber-500 shrink-0 uppercase font-black">WARN</span>
                                        <span className="leading-relaxed">Quota approaching 85% in region: eu-west-1. Scale action recommended.</span>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-white/5 bg-slate-900/50 flex items-center gap-4">
                                    <input className="flex-1 bg-black/50 border border-white/10 rounded-xl px-6 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono" placeholder="Execute command..." />
                                    <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-emerald-500 shadow-glow-emerald">Run</button>
                                </div>
                            </div>

                            {/* Capacity & Scale Expansion */}
                            <div className="lg:col-span-4 space-y-8">
                                <div className="glass p-10 rounded-[48px] border border-white/5 bg-gradient-to-br from-violet-600/10 to-transparent">
                                    <div className="w-16 h-16 bg-violet-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-violet-600/20 mb-8">
                                        <Zap className="text-white" size={24} />
                                    </div>
                                    <h4 className="text-xl font-black text-white uppercase italic tracking-tight mb-4">Scale Orchestration</h4>
                                    <p className="text-xs text-slate-400 font-medium leading-relaxed mb-10 italic">Modify global infrastructure footprint and AI capacity buffers.</p>

                                    <div className="space-y-10">
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                <span>Global Replicas</span>
                                                <span className="text-white">12 Nodes</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full relative">
                                                <div className="absolute left-0 top-0 h-full bg-violet-500 rounded-full w-2/3 shadow-glow-violet" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <button className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex flex-col items-center gap-3 group hover:border-violet-500/30 transition-all">
                                                <ArrowUpRight size={20} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Expand</span>
                                            </button>
                                            <button className="p-6 bg-white/5 border border-white/10 rounded-[32px] flex flex-col items-center gap-3 group hover:border-red-500/30 transition-all text-slate-400">
                                                <ArrowDownRight size={20} className="text-slate-600 group-hover:text-red-400 transition-colors" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Scale In</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-12 p-6 bg-slate-900/50 rounded-3xl border border-white/5 space-y-4">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-slate-500">Auto-Scale Mode</span>
                                            <span className="text-emerald-400 uppercase">Proactive</span>
                                        </div>
                                        <div className="w-full h-8 bg-slate-800 rounded-xl relative cursor-pointer">
                                            <div className="absolute right-1 top-1 w-10 h-6 bg-emerald-500 rounded-lg shadow-glow-emerald" />
                                        </div>
                                    </div>
                                </div>

                                <div className="glass p-10 rounded-[48px] border border-white/5 flex flex-col items-center text-center">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Cluster Context</h4>
                                    <p className="text-xs text-white font-bold tracking-tight mb-2 uppercase italic tracking-tighter">Sunder-Global-Core-01</p>
                                    <div className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase animate-pulse">
                                        <Activity size={12} /> Syncing
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
