'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Settings,
    Users,
    Shield,
    Globe,
    Zap,
    Webhook,
    Trash2,
    Save,
    ChevronRight,
    Search,
    Lock,
    Eye,
    Bell,
    Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function OrganizationSettings() {
    const { slug } = useParams();
    const [activeTab, setActiveTab] = useState('General');

    const tabs = [
        { name: 'General', icon: Settings },
        { name: 'Permissions', icon: Shield },
        { name: 'Nexus Hooks', icon: Webhook },
        { name: 'Intelligence', icon: Cpu },
        { name: 'Danger Zone', icon: Trash2, color: 'text-red-500' }
    ];

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-white text-xl">
                                {slug?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">
                                    Collective <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Governance</span>
                                </h1>
                                <p className="text-slate-500 font-medium">Managing @{slug} orchestration parameters.</p>
                            </div>
                        </div>
                    </div>

                    <button className="px-8 py-3 bg-white text-slate-950 text-xs font-black rounded-xl hover:scale-105 transition-all uppercase tracking-widest flex items-center gap-2 group shadow-xl shadow-white/5">
                        <Save size={16} /> Save Manifest
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Tabs */}
                    <div className="space-y-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={cn(
                                    "w-full flex items-center gap-4 px-6 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                    activeTab === tab.name
                                        ? "bg-white text-slate-950 shadow-xl"
                                        : "text-slate-500 hover:text-white hover:bg-white/5"
                                )}
                            >
                                <tab.icon size={16} className={tab.color} />
                                {tab.name}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3 space-y-8">
                        <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-10 bg-white/[0.01]">
                            {/* Section Header */}
                            <div className="space-y-2">
                                <h2 className="text-lg font-black text-white uppercase tracking-widest italic">{activeTab} Parameters</h2>
                                <p className="text-xs text-slate-500 font-medium tracking-tight">Configure how this node interacts with the global Sunder network.</p>
                            </div>

                            {activeTab === 'General' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-2">Collective Name</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                                defaultValue={slug as string}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-2">Public Visibility</label>
                                            <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/5">
                                                <Globe className="text-blue-400" size={18} />
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold uppercase tracking-tight">Matrix Search</p>
                                                    <p className="text-[9px] text-slate-500 uppercase font-black">Allow external discovery</p>
                                                </div>
                                                <div className="w-10 h-5 bg-blue-600 rounded-full p-1 cursor-pointer">
                                                    <div className="w-3 h-3 bg-white rounded-full translate-x-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-2">Core Manifesto</label>
                                        <textarea
                                            className="w-full bg-slate-950/50 border border-white/5 rounded-3xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/50 min-h-[120px] resize-none text-white"
                                            placeholder="Define the core principles of this collective..."
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Permissions' && (
                                <div className="space-y-6">
                                    {[
                                        { title: 'Strict PR Review', status: true, desc: 'AI must approve all cross-node merges.' },
                                        { title: 'Nexus Privacy', status: false, desc: 'Hide member list from other organizations.' },
                                        { title: 'Auto-Moderation', status: true, desc: 'Quarantine snippets with high vulnerability scores.' }
                                    ].map((perm) => (
                                        <div key={perm.title} className="flex items-center justify-between p-6 bg-slate-950/50 rounded-3xl border border-white/5">
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-black text-white uppercase tracking-tight italic">{perm.title}</h4>
                                                <p className="text-[10px] text-slate-500 font-bold">{perm.desc}</p>
                                            </div>
                                            <div className={cn(
                                                "w-12 h-6 rounded-full p-1 transition-all cursor-pointer",
                                                perm.status ? "bg-blue-600" : "bg-slate-800"
                                            )}>
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full bg-white transition-all transform",
                                                    perm.status ? "translate-x-6" : "translate-x-0"
                                                )} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'Nexus Hooks' && (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-500/20 text-center space-y-4">
                                        <Webhook className="mx-auto text-blue-400" size={32} />
                                        <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">Seamlessly stream your Sunder events to external environments like Slack, Discord, or custom REST nodes.</p>
                                        <button className="px-6 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-xl uppercase tracking-widest">Construct New Hook</button>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                    <Zap className="text-emerald-500" size={16} />
                                                </div>
                                                <span className="text-xs font-bold text-white uppercase">Production Mirror</span>
                                            </div>
                                            <button className="p-2 text-slate-500 hover:text-white"><Settings size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {activeTab === 'Danger Zone' && (
                            <div className="p-10 rounded-[3rem] border border-red-500/10 bg-red-500/[0.02] space-y-8">
                                <div>
                                    <h3 className="text-lg font-black text-red-500 uppercase tracking-widest italic">Node Decommissioning</h3>
                                    <p className="text-xs text-slate-500 font-medium mt-2">Irreversibly dissolve this organization and purge all associated intelligence records.</p>
                                </div>
                                <button className="w-full py-5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all">
                                    Initialize Purge Protocol
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
