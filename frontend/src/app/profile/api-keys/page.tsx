'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Key,
    Plus,
    Trash2,
    Copy,
    Check,
    Shield,
    AlertTriangle,
    Clock,
    Eye,
    EyeOff
} from 'lucide-react';
import { cn, fetchApi } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function APIKeysPage() {
    const queryClient = useQueryClient();
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
    const [newKeyLabel, setNewKeyLabel] = useState('');

    const { data: apiKeys, isLoading } = useQuery({
        queryKey: ['api-keys'],
        queryFn: () => fetchApi('/profiles/api-keys')
    });

    const createMutation = useMutation({
        mutationFn: (label: string) => fetchApi('/profiles/api-keys', {
            method: 'POST',
            body: JSON.stringify({ label })
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
            setNewKeyLabel('');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => fetchApi(`/profiles/api-keys/${id}`, {
            method: 'DELETE'
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['api-keys'] });
        }
    });

    const copyToClipboard = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const toggleVisibility = (id: string) => {
        setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-violet-600/10 border border-violet-500/20 rounded-2xl">
                            <Key className="text-violet-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase italic tracking-tight">API Governance</h1>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Manage your neural interface access tokens</p>
                        </div>
                    </div>
                </div>

                <div className="glass p-10 rounded-[48px] border border-white/5 bg-white/[0.01]">
                    <div className="flex flex-col md:flex-row gap-6 items-end mb-12">
                        <div className="flex-1 space-y-3 w-full">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Key Identifier</label>
                            <input
                                type="text"
                                placeholder="e.g. Production Engine"
                                value={newKeyLabel}
                                onChange={(e) => setNewKeyLabel(e.target.value)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all font-bold placeholder:text-slate-700"
                            />
                        </div>
                        <button
                            onClick={() => createMutation.mutate(newKeyLabel || 'Default Key')}
                            disabled={createMutation.isPending}
                            className="bg-white text-slate-950 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-white/5 hover:bg-slate-200 transition-all flex items-center gap-2 shrink-0 h-[52px]"
                        >
                            <Plus size={16} /> Generate Token
                        </button>
                    </div>

                    <div className="space-y-6">
                        {isLoading ? (
                            Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse border border-white/5" />
                            ))
                        ) : apiKeys?.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-[40px]">
                                <Shield className="mx-auto text-slate-800 mb-4" size={40} />
                                <p className="text-xs text-slate-600 font-black uppercase tracking-widest italic">No active tokens detected.</p>
                            </div>
                        ) : (
                            apiKeys?.map((key: any) => (
                                <div key={key.id} className="p-6 bg-slate-900/50 border border-white/10 rounded-[32px] group hover:border-violet-500/30 transition-all">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center">
                                                <Shield className="text-violet-400" size={18} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-white uppercase italic tracking-tight">{key.label}</h4>
                                                <div className="flex items-center gap-3 mt-1 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Clock size={12} /> Created: {new Date(key.created_at).toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                                                    <span className="text-emerald-500 italic">Active</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => copyToClipboard(key.key)}
                                                className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                                                title="Copy to clipboard"
                                            >
                                                {copiedKey === key.key ? <Check className="text-emerald-500" size={16} /> : <Copy size={16} />}
                                            </button>
                                            <button
                                                onClick={() => toggleVisibility(key.id)}
                                                className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
                                            >
                                                {visibleKeys[key.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            <button
                                                onClick={() => deleteMutation.mutate(key.id)}
                                                className="p-3 bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="font-mono text-xs bg-black/40 border border-white/5 p-4 rounded-2xl text-slate-400 select-all overflow-hidden whitespace-nowrap">
                                            {visibleKeys[key.id] ? key.key : `sk_sunder_••••••••••••••••••••••••••••••••`}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[40px] flex items-start gap-6">
                    <div className="p-3 bg-amber-500/20 rounded-2xl"><AlertTriangle className="text-amber-500" size={24} /></div>
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Security Advisory</h4>
                        <p className="text-[10px] text-amber-200/50 font-medium uppercase tracking-[0.1em] leading-relaxed italic">
                            Tokens grant full access to your neural context and snippet repository. Never share these keys or expose them in client-side code without server-side proxying. Revoking a token is immediate across all edge clusters.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
