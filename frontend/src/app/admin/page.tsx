'use client';

import {
    Activity,
    Users,
    FileCode,
    Cpu,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { cn, fetchApi } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export default function AdminOverview() {
    const { data: metrics, isLoading } = useQuery({
        queryKey: ['admin-metrics'],
        queryFn: () => fetchApi('/admin/metrics'),
        refetchInterval: 30000 // Refresh every 30s
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-44 bg-slate-900/50 rounded-[40px] animate-pulse border border-white/5" />
                ))}
            </div>
        );
    }

    const stats = [
        { label: 'Total Users', value: metrics?.users?.total || '0', icon: Users, color: 'text-blue-400', trend: `+${metrics?.users?.new_today || 0} today`, isUp: true },
        { label: 'Shared Snippets', value: metrics?.snippets?.total || '0', icon: FileCode, color: 'text-violet-400', trend: `+${metrics?.snippets?.created_today || 0} today`, isUp: true },
        { label: 'Neural Activity', value: metrics?.ai?.requests_today || '0', icon: Cpu, color: 'text-amber-400', trend: `${metrics?.ai?.tokens_today || 0} tokens`, isUp: true },
        { label: 'AI Daily Cost', value: `$${parseFloat(metrics?.ai?.cost_today || 0).toFixed(2)}`, icon: Activity, color: 'text-emerald-400', trend: 'Budget: OK', isUp: true },
    ];

    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatUptime = (seconds: number) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${d}d ${h}h ${m}m`;
    };

    return (
        <div className="space-y-10">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="glass p-8 rounded-[40px] border border-white/5 bg-white/[0.02] group hover:border-white/10 transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <div className={cn("p-3 bg-white/5 rounded-2xl", stat.color)}><stat.icon size={24} /></div>
                            <div className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                stat.isUp ? "text-emerald-400" : "text-red-400"
                            )}>
                                {stat.trend}
                            </div>
                        </div>
                        <p className="text-4xl font-black text-white mb-2">{stat.value}</p>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Performance & Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 glass rounded-[48px] p-10 border border-white/5 bg-slate-950/20">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight italic">System Resources</h3>
                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">CPU Load</p>
                                <p className="text-sm font-black text-white">{metrics?.system?.cpu_usage || 0}%</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Memory (RSS)</p>
                                <p className="text-sm font-black text-white">{formatBytes(metrics?.system?.memory_usage)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Uptime</p>
                                <p className="text-sm font-black text-white">{formatUptime(metrics?.system?.uptime)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="h-64 w-full flex items-end gap-2 group">
                        {/* Simulation for real-time traffic view */}
                        {Array.from({ length: 48 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-violet-600/20 rounded-t-sm group-hover:bg-violet-600/40 transition-all duration-500 cursor-pointer hover:bg-violet-500"
                                style={{ height: `${Math.random() * (metrics?.system?.cpu_usage || 50) + 10}%` }}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        <span>Cluster Overview</span>
                        <span>{metrics?.system?.database_connections} DB Conns</span>
                        <span>Healthy</span>
                    </div>
                </div>

                <div className="lg:col-span-4 glass rounded-[48px] p-10 border border-white/5 bg-violet-600/5 flex flex-col">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight italic mb-8">System Feeds</h3>
                    <div className="space-y-6 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar">
                        {[
                            { type: 'Alert', msg: 'Neural Load Spike in Cluster-A', time: '2m', color: 'text-amber-400' },
                            { type: 'Security', msg: 'Audit cycle completed successfully', time: '14m', color: 'text-blue-400' },
                            { type: 'System', msg: 'Memory usage within normal bounds', time: '1h', color: 'text-emerald-400' },
                            { type: 'Snippet', msg: `New snippet added today: total ${metrics?.snippets?.created_today}`, time: 'now', color: 'text-violet-400' },
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
                </div>
            </div>
        </div>
    );
}
