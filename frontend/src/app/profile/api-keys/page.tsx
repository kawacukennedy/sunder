'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Key,
    Plus,
    Copy,
    Trash2,
    Eye,
    EyeOff,
    CheckCircle2,
    Clock,
    Shield,
    Terminal,
    AlertCircle,
    RotateCcw,
    Zap,
    ExternalLink,
    Search,
    Filter,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const initialKeys = [
    {
        id: '1',
        name: 'Main Production Environment',
        key: 'sk_live_v1_4a8b2c...',
        created: 'Oct 12, 2025',
        lastUsed: '2 mins ago',
        permissions: 'Full Read/Write',
        status: 'active'
    },
    {
        id: '2',
        name: 'Staging CLI Integration',
        key: 'sk_test_v1_2f4e9a...',
        created: 'Nov 05, 2025',
        lastUsed: 'Yesterday',
        permissions: 'Limited Read',
        status: 'active'
    },
    {
        id: '3',
        name: 'GitHub Action Secret',
        key: 'sk_git_v1_7c1d3f...',
        created: 'Dec 01, 2025',
        lastUsed: '3 days ago',
        permissions: 'Snippet Only',
        status: 'revoked'
    }
];

export default function APIKeysPage() {
    const [keys, setKeys] = useState(initialKeys);
    const [showKeyId, setShowKeyId] = useState<string | null>(null);

    const toggleKeyVisibility = (id: string) => {
        setShowKeyId(showKeyId === id ? null : id);
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                <Key className="text-violet-400" size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">
                                Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400">Tokens</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 font-medium tracking-tight">Integrate Sunder directly into your local terminal and CI/CD pipelines.</p>
                    </div>
                    <button className="px-8 py-3 rounded-2xl bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2">
                        <Plus size={16} />
                        Generate New Token
                    </button>
                </div>

                {/* Integration Guide Banner */}
                <div className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8 group overflow-hidden relative">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/5 blur-[80px] group-hover:scale-110 transition-transform duration-700" />
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Terminal size={32} />
                    </div>
                    <div className="flex-1 space-y-1">
                        <h3 className="text-lg font-black text-white uppercase italic tracking-widest">Sunder CLI</h3>
                        <p className="text-sm text-slate-400 font-medium max-w-2xl">Use your access tokens to authenticate the Sunder CLI. Manage your snippets without ever leaving your terminal.</p>
                        <div className="pt-4 flex items-center gap-4">
                            <code className="px-4 py-2 bg-black/40 rounded-xl text-xs text-white border border-white/5 font-mono">npm install -g sunder-cli</code>
                            <button className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
                                View Docs <ExternalLink size={12} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* API Keys Table */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4">
                        <span className="flex-1">Token Name</span>
                        <span className="w-64">Permission Node</span>
                        <span className="w-32 text-center">Status</span>
                        <span className="w-48 text-right">Last Synchronized</span>
                        <span className="w-24"></span>
                    </div>

                    <div className="space-y-4">
                        {keys.map((key) => (
                            <div
                                key={key.id}
                                className={cn(
                                    "p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl transition-all duration-300 group hover:border-white/10",
                                    key.status === 'revoked' && "opacity-60"
                                )}
                            >
                                <div className="flex items-center gap-6">
                                    <div className="flex-1 space-y-2">
                                        <h4 className="text-base font-bold text-white tracking-tight uppercase italic">{key.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <code className="text-xs font-mono text-slate-500">
                                                {showKeyId === key.id ? key.key : '••••••••••••••••••••••••'}
                                            </code>
                                            <button
                                                onClick={() => toggleKeyVisibility(key.id)}
                                                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-white transition-all"
                                            >
                                                {showKeyId === key.id ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                            <button className="p-1.5 rounded-lg hover:bg-white/5 text-slate-600 hover:text-white transition-all">
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="w-64">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-1 px-3 bg-white/5 rounded-full border border-white/5">
                                            {key.permissions}
                                        </span>
                                    </div>

                                    <div className="w-32 flex justify-center">
                                        <div className={cn(
                                            "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            key.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                                        )}>
                                            <div className={cn("w-1.5 h-1.5 rounded-full", key.status === 'active' ? "bg-emerald-500" : "bg-red-500")} />
                                            {key.status}
                                        </div>
                                    </div>

                                    <div className="w-48 text-right space-y-1">
                                        <p className="text-[10px] text-white font-bold uppercase tracking-tight">{key.lastUsed}</p>
                                        <p className="text-[10px] text-slate-500">Created {key.created}</p>
                                    </div>

                                    <div className="w-24 text-right flex items-center justify-end gap-2">
                                        <button className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all">
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security Advisory */}
                <div className="p-10 rounded-[3rem] bg-amber-500/5 border border-amber-500/10 space-y-6 relative overflow-hidden group">
                    <Shield className="absolute -right-4 -top-4 text-amber-500/5 group-hover:scale-110 transition-transform duration-700" size={120} />
                    <div className="flex items-center gap-4 text-amber-500 relative z-10">
                        <AlertCircle size={24} />
                        <h4 className="text-xl font-black uppercase italic tracking-widest">Protocol Advisory</h4>
                    </div>
                    <p className="text-sm text-amber-200/60 font-medium max-w-3xl leading-relaxed relative z-10">
                        Tokens grants full access to your Sunder account via the API. Never share your tokens or commit them to version control. If a token is compromised, revoke it immediately within this terminal.
                    </p>
                    <div className="pt-4 relative z-10">
                        <button className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] border-b border-amber-500/20 pb-1 hover:border-amber-500 transition-colors">
                            Initialize 2FA Verification
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
