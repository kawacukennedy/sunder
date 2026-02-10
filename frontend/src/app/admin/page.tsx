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
        { label: 'Total Entities', value: metrics?.users?.total || '0', icon: Users, color: 'text-blue-400', trend: '+12.5%', isUp: true },
        { label: 'Shared Logic', value: metrics?.snippets?.total || '0', icon: FileCode, color: 'text-violet-400', trend: '+45.2%', isUp: true },
        { label: 'Neural Calls', value: metrics?.ai?.requests_today || '0', icon: Cpu, color: 'text-amber-400', trend: '+18.1%', isUp: true },
        { label: 'System Health', value: '99.98%', icon: Activity, color: 'text-emerald-400', trend: '-0.02%', isUp: false },
    ];

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
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
                </div>
            </div>
        </div>
    );
}
