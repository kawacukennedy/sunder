'use client';

import {
    FileCode,
    ShieldAlert,
    CheckCircle2,
    XCircle,
    MoreHorizontal
} from 'lucide-react';
import { cn, fetchApi } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function AdminSnippets() {
    const queryClient = useQueryClient();

    const { data: flags, isLoading } = useQuery({
        queryKey: ['admin-flags'],
        queryFn: () => fetchApi('/admin/moderation/flags')
    });

    const resolveMutation = useMutation({
        mutationFn: ({ id, status, action }: { id: string, status: string, action: string }) =>
            fetchApi(`/admin/moderation/flags/${id}/resolve`, {
                method: 'POST',
                body: JSON.stringify({ status, action })
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-flags'] });
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between bg-slate-950/40 p-10 rounded-[48px] border border-white/5">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Moderation Queue</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Flagged Entities for Review</p>
                </div>
                <div className="flex gap-4">
                    <span className="px-6 py-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest">
                        {flags?.length || 0} Flagged
                    </span>
                    <span className="px-6 py-3 bg-white/5 text-slate-400 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest italic">34 Pending Approval</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-40 bg-slate-900/50 rounded-[40px] animate-pulse border border-white/5" />
                    ))
                ) : flags?.length === 0 ? (
                    <div className="glass p-20 rounded-[48px] border border-white/5 bg-white/[0.01] text-center">
                        <CheckCircle2 className="text-emerald-500 mx-auto mb-6" size={48} />
                        <h4 className="text-xl font-black text-white uppercase italic mb-2">Queue Clear</h4>
                        <p className="text-slate-500 text-sm">No pending content flags detected.</p>
                    </div>
                ) : (
                    flags?.map((flag: any) => (
                        <div key={flag.id} className="glass p-8 rounded-[40px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col md:flex-row gap-8 items-start md:items-center">
                            <div className="w-16 h-16 rounded-[24px] bg-slate-900 border border-white/10 flex items-center justify-center relative">
                                <FileCode className="text-slate-500" size={24} />
                                <ShieldAlert className="absolute -top-2 -right-2 text-red-500" size={20} />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-lg font-black text-white uppercase italic">{flag.snippet?.title || 'Unknown Snippet'}</h4>
                                    <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-black rounded uppercase tracking-tighter">{flag.reason}</span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    Reported by <span className="text-white font-bold">@{flag.reporter?.username}</span> • {flag.description}
                                </p>
                                <div className="flex items-center gap-6 mt-4">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Timestamp: {new Date(flag.created_at).toLocaleString()}</span>
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Impact: High</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => resolveMutation.mutate({ id: flag.id, status: 'dismissed', action: 'keep' })}
                                    className="flex-1 md:flex-none px-6 py-3 bg-white/10 text-white border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => resolveMutation.mutate({ id: flag.id, status: 'resolved', action: 'delete_snippet' })}
                                    className="flex-1 md:flex-none px-8 py-3 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all hover:bg-red-500 italic"
                                >
                                    Quarantine
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
