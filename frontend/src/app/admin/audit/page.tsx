'use client';

import {
    History,
    Search,
    Filter,
    ShieldCheck,
    AlertTriangle,
    Info,
    ArrowRight
} from 'lucide-react';
import { cn, fetchApi } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export default function AdminAudit() {
    const [filter, setFilter] = useState('all');

    const { data: logs, isLoading } = useQuery({
        queryKey: ['admin-audit', filter],
        queryFn: () => fetchApi(`/admin/audit?type=${filter}`)
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'security': return <ShieldCheck className="text-red-400" size={18} />;
            case 'warning': return <AlertTriangle className="text-amber-400" size={18} />;
            default: return <Info className="text-blue-400" size={18} />;
        }
    };

    return (
        <div className="space-y-8">
            <div className="glass rounded-[48px] border border-white/5 bg-slate-950/20 overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-6">
                        <div className="relative group w-96">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                            <input
                                type="text"
                                placeholder="Filter audit trail..."
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all font-medium"
                            />
                        </div>
                        <div className="flex items-center p-1 bg-slate-900/50 border border-white/5 rounded-2xl">
                            {['all', 'security', 'system', 'users'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                        filter === t
                                            ? "bg-white text-slate-950"
                                            : "text-slate-500 hover:text-white"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Download CSV</button>
                </div>

                <div className="p-8 space-y-4">
                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-20 bg-white/[0.02] rounded-3xl animate-pulse border border-white/5" />
                        ))
                    ) : logs?.length === 0 ? (
                        <div className="text-center py-20 text-slate-500 font-black uppercase tracking-widest text-xs italic">No logs found in this temporal slice.</div>
                    ) : (
                        logs?.map((log: any) => (
                            <div key={log.id} className="p-6 bg-white/[0.01] border border-white/5 rounded-[32px] hover:border-white/10 transition-all group flex items-center gap-6">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center shrink-0">
                                    {getIcon(log.action_type === 'security' ? 'security' : 'info')}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{log.actor?.username || 'System'}</span>
                                        <ArrowRight size={10} className="text-slate-700" />
                                        <span className="text-xs font-bold text-white uppercase italic">{log.action_type.replace('_', ' ')}</span>
                                    </div>
                                    <p className="text-sm text-slate-400 font-medium">
                                        {log.entity_type} {log.entity_id ? `(${log.entity_id})` : ''} modified. New values: {JSON.stringify(log.new_values)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-mono text-slate-600 mb-1">{new Date(log.created_at).toLocaleTimeString()}</p>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{new Date(log.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
