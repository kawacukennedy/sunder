'use client';

import {
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Database,
    RotateCcw
} from 'lucide-react';
import { cn, fetchApi } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

export default function AdminSystem() {
    const [cacheName, setCacheName] = useState('global');

    const cacheMutation = useMutation({
        mutationFn: (action: 'clear_all' | 'clear_key') =>
            fetchApi('/admin/system/cache', {
                method: 'PATCH',
                body: JSON.stringify({ cache_name: cacheName, action })
            })
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
                {/* Cache Management */}
                <div className="glass p-10 rounded-[48px] border border-white/5 bg-slate-950/20">
                    <div className="flex items-center gap-4 mb-8">
                        <Database className="text-violet-400" size={24} />
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tight">Persistence & Cache</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Cache Enclave</label>
                            <select
                                value={cacheName}
                                onChange={(e) => setCacheName(e.target.value)}
                                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 appearance-none font-bold italic"
                            >
                                <option value="global">Global Enclave</option>
                                <option value="snippets">Snippet Cache</option>
                                <option value="users">User Metadata</option>
                                <option value="ai">Neural Context</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-3">
                            <button
                                onClick={() => cacheMutation.mutate('clear_all')}
                                disabled={cacheMutation.isPending}
                                className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={14} /> {cacheMutation.isPending ? 'Purging...' : 'Purge All'}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex items-start gap-4">
                        <div className="mt-1"><RotateCcw className="text-amber-500" size={16} /></div>
                        <p className="text-[10px] text-amber-200/50 font-bold uppercase tracking-widest leading-relaxed">
                            Cache purges are immediate and non-reversible. This will trigger origin re-validation across all active clusters.
                        </p>
                    </div>
                </div>

                {/* Scale Orchestration */}
                <div className="glass p-10 rounded-[48px] border border-white/5 bg-slate-950/20">
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tight mb-8">Scale Orchestration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-10">
                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <span>Global Replicas</span>
                                    <span className="text-white">12 Nodes</span>
                                </div>
                                <div className="h-1.5 bg-white/5 rounded-full relative">
                                    <div className="absolute left-0 top-0 h-full bg-violet-500 rounded-full w-2/3 shadow-glow-violet" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-8 bg-white/5 border border-white/10 rounded-[40px] flex flex-col items-center gap-4 group hover:border-violet-500/30 transition-all">
                                    <ArrowUpRight size={20} className="text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Expand</span>
                                </button>
                                <button className="p-8 bg-white/5 border border-white/10 rounded-[40px] flex flex-col items-center gap-4 group hover:border-red-500/30 transition-all text-slate-400">
                                    <ArrowDownRight size={20} className="text-slate-600 group-hover:text-red-400 transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Scale In</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="p-8 bg-slate-900/50 rounded-[40px] border border-white/5 space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auto-Scale Mode</span>
                                    <span className="text-emerald-400 uppercase text-[10px] font-black italic">Proactive</span>
                                </div>
                                <div className="w-full h-10 bg-slate-800 rounded-2xl relative cursor-pointer group">
                                    <div className="absolute right-1 top-1 w-12 h-8 bg-emerald-500 rounded-xl shadow-glow-emerald group-hover:scale-105 transition-transform" />
                                </div>
                            </div>
                            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] px-4 leading-relaxed italic">
                                Sunder-Global-Core-01 cluster state: <span className="text-emerald-500">OPTIMIZED</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
                <div className="glass p-10 rounded-[48px] border border-white/5 bg-violet-600/5 flex flex-col items-center text-center">
                    <Zap className="text-amber-400 mb-6" size={40} />
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Power Signature</h4>
                    <p className="text-3xl font-black text-white mb-2 italic tracking-tighter uppercase">Optimal</p>
                    <div className="flex items-center gap-2 text-[9px] font-black text-emerald-400 uppercase animate-pulse">
                        <Activity size={12} /> Live Sync Active
                    </div>
                </div>

                <div className="p-10 rounded-[48px] bg-slate-900/40 border border-white/5 space-y-6">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Instance Health</h4>
                    {[
                        { name: 'US-EAST-1', status: 'Healthy', load: '45%' },
                        { name: 'EU-CENTRAL-1', status: 'Healthy', load: '32%' },
                        { name: 'AP-SOUTH-1', status: 'Warning', load: '88%' }
                    ].map(node => (
                        <div key={node.name} className="flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-black text-white uppercase tracking-widest">{node.name}</p>
                                <p className="text-[8px] text-slate-600 font-bold uppercase">{node.status}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-black text-white italic">{node.load}</p>
                                <div className="w-12 h-1 bg-white/5 rounded-full mt-1">
                                    <div className={cn(
                                        "h-full rounded-full",
                                        parseInt(node.load) > 80 ? "bg-red-500" : "bg-emerald-500"
                                    )} style={{ width: node.load }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
