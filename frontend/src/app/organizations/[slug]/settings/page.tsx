'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Settings,
    Users,
    Shield,
    Key,
    Save,
    Trash2,
    Mail,
    Globe,
    Lock,
    Bell,
    ExternalLink,
    Building2,
    ChevronRight,
    Search,
    UserPlus,
    X,
    Check
} from 'lucide-react';
import { useState } from 'react';
import { cn, fetchApi } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export default function OrganizationSettings() {
    const params = useParams();
    const slug = params.slug as string;
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('General');

    const tabs = ['General', 'Members', 'AI Governance', 'Security', 'Billing'];

    const { data: org, isLoading } = useQuery({
        queryKey: ['organization', slug],
        queryFn: () => fetchApi(`/organizations/${slug}`)
    });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        website: '',
        privacy: 'Public',
        ai_model: 'Neural-S7 (Default)',
        ai_tone: 'Educational',
        ai_quota: 85
    });

    // Handle form updates when data loads
    if (org && !formData.name) {
        setFormData({
            ...formData,
            name: org.name,
            description: org.description || '',
            website: org.website || '',
            privacy: org.visibility || 'Public'
        });
    }

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                            <Building2 className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white uppercase tracking-tight italic">Org Configuration</h1>
                            <p className="text-slate-400 font-medium">Manage identity, access, and infrastructure for <span className="text-white font-bold">{org?.name || slug}</span></p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-10">
                    {/* Navigation Sidebar */}
                    <aside className="w-64 space-y-2">
                        {tabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === tab
                                        ? "bg-white text-slate-950 shadow-xl shadow-white/5"
                                        : "text-slate-500 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {tab === 'General' && <Settings size={14} />}
                                {tab === 'Members' && <Users size={14} />}
                                {tab === 'AI Governance' && <BrainCircuit size={14} />}
                                {tab === 'Security' && <Shield size={14} />}
                                {tab === 'Billing' && <Key size={14} />}
                                {tab}
                            </button>
                        ))}
                    </aside>

                    {/* Main Content Pane */}
                    <div className="flex-1 glass rounded-[48px] border border-white/5 bg-white/[0.02] shadow-2xl relative overflow-hidden min-h-[600px]">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-emerald-600 to-transparent opacity-30" />

                        <div className="p-12 h-full overflow-y-auto custom-scrollbar">
                            {activeTab === 'General' && (
                                <div className="space-y-10 max-w-2xl">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Organization Name</label>
                                                <div className="relative group">
                                                    <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white transition-colors" size={18} />
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-white/5 rounded-3xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Public Website</label>
                                                <div className="relative group">
                                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white transition-colors" size={18} />
                                                    <input
                                                        type="text"
                                                        value={formData.website}
                                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                        className="w-full pl-14 pr-6 py-4 bg-slate-950/50 border border-white/5 rounded-3xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                                                        placeholder="sunder.app"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">About the Organization</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full p-6 bg-slate-950/50 border border-white/5 rounded-[32px] text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium resize-none h-32 custom-scrollbar"
                                                placeholder="Describe the mission and scope of this team..."
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-white/5 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-white">Danger Zone</h4>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Irreversible actions on this organization</p>
                                        </div>
                                        <button className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white text-[10px] font-black rounded-2xl border border-red-500/20 transition-all uppercase tracking-widest flex items-center gap-2 group">
                                            <Trash2 size={14} className="group-hover:scale-110 transition-transform" /> Delete Organization
                                        </button>
                                    </div>

                                    <div className="sticky bottom-0 -mx-12 px-12 py-8 bg-slate-950/40 backdrop-blur-xl border-t border-white/5 mt-auto">
                                        <button className="float-right px-10 py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all shadow-xl shadow-white/10 uppercase tracking-widest text-[10px] flex items-center gap-2">
                                            <Save size={16} /> Preserving Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Members' && (
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="relative group w-80">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search team members..."
                                                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                                            />
                                        </div>
                                        <button className="px-6 py-3 bg-blue-600 text-white text-[10px] font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-500 uppercase tracking-widest flex items-center gap-2">
                                            <UserPlus size={16} /> Invite Member
                                        </button>
                                    </div>

                                    <div className="overflow-hidden border border-white/5 rounded-3xl bg-black/20">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-white/5 border-b border-white/5">
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">User Entity</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Authority</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Context</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm">
                                                {(org?.members || []).map((m: any, i: number) => (
                                                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center font-black text-white text-[10px] underline decoration-blue-500/50 italic">
                                                                    {m.users?.username?.substring(0, 2).toUpperCase() || '??'}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-white uppercase tracking-tight">{m.users?.display_name || m.users?.username}</p>
                                                                    <p className="text-[10px] text-slate-500 font-medium lowercase tracking-wide italic">{m.users?.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black text-slate-400 border border-white/5 uppercase tracking-widest">{m.role}</span>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-glow" />
                                                                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Active</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <button className="text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Settings size={18} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'AI Governance' && (
                                <div className="space-y-12 max-w-2xl">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Model Infrastructure</label>
                                            <select
                                                value={formData.ai_model}
                                                onChange={(e) => setFormData({ ...formData, ai_model: e.target.value })}
                                                className="w-full p-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all appearance-none cursor-pointer"
                                            >
                                                <option>Neural-S7 (Default)</option>
                                                <option>Claude 3.5 Sonnet</option>
                                                <option>GPT-4o Enterprise</option>
                                                <option>Llama-3-70B (Isolated)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Persona/Tone Signature</label>
                                            <select
                                                value={formData.ai_tone}
                                                onChange={(e) => setFormData({ ...formData, ai_tone: e.target.value })}
                                                className="w-full p-4 bg-slate-950/50 border border-white/5 rounded-2xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all appearance-none cursor-pointer"
                                            >
                                                <option>Educational</option>
                                                <option>Concise / Terminal</option>
                                                <option>Philosophical Architect</option>
                                                <option>Aggressive debugger</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Intelligence Quota Allocation</label>
                                            <span className="text-[10px] font-black text-violet-400">{formData.ai_quota}% Capacity</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={formData.ai_quota}
                                            onChange={(e) => setFormData({ ...formData, ai_quota: parseInt(e.target.value) })}
                                            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-violet-500"
                                        />
                                        <p className="text-[9px] text-slate-600 font-medium leading-relaxed italic uppercase">Warning: Exceeding 90% may prioritize low-latency nodes over absolute accuracy.</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { label: 'Neural Persistence', desc: 'Allow AI to remember team-wide architectural patterns across sessions.', active: true },
                                            { label: 'Private Synthesis', desc: 'Process all snippets in isolated secure enclaves. No external indexing.', active: true },
                                            { label: 'Automatic Refactoring', desc: 'Enable proactive AI suggestions for stale codebases based on team standards.', active: false }
                                        ].map(item => (
                                            <div key={item.label} className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] flex items-center justify-between hover:border-violet-500/20 transition-all cursor-pointer group">
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-black text-white uppercase italic">{item.label}</h4>
                                                    <p className="text-[10px] text-slate-500 font-medium pr-12">{item.desc}</p>
                                                </div>
                                                <div className={cn("w-10 h-5 rounded-full relative transition-all", item.active ? "bg-violet-600" : "bg-slate-800")}>
                                                    <div className={cn("absolute top-1 w-3 h-3 rounded-full bg-white transition-all", item.active ? "right-1" : "left-1")} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Security' && (
                                <div className="space-y-10 max-w-2xl">
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between p-8 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <Lock className="text-blue-400" size={20} />
                                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Two-Factor Force</h4>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">Require 2FA for all organization members to access private snippets.</p>
                                            </div>
                                            <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-8 bg-white/5 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <Bell className="text-emerald-400" size={20} />
                                                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Audit Logging</h4>
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium leading-relaxed">Broadcast all security-relevant events to the Organization Activity feed.</p>
                                            </div>
                                            <div className="w-12 h-6 bg-slate-800 rounded-full relative cursor-pointer">
                                                <div className="absolute left-1 top-1 w-4 h-4 bg-slate-500 rounded-full transition-all" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Infrastructure Isolation</h4>
                                        <div className="p-8 bg-slate-950/50 rounded-[32px] border border-white/5 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-white font-bold uppercase tracking-tight">VPC Peering Status</span>
                                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Check size={14} /> Established
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between opacity-40">
                                                <span className="text-xs text-white font-bold uppercase tracking-tight">Dedicated DB Cluster</span>
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest underline decoration-white/20 underline-offset-4 cursor-pointer">Level 3 Required</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

const BrainCircuit = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.44 2.5 2.5 0 0 0-1.32 4.54 2.5 2.5 0 0 0 .78 4.4 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 .78-4.4 2.5 2.5 0 0 0-1.32-4.54A2.5 2.5 0 0 0 12 4.5Z" />
        <path d="M16 8h.5a2.5 2.5 0 0 1 0 5H16" />
        <path d="M8 8h-.5a2.5 2.5 0 0 0 0 5H8" />
        <path d="M12 13v4" />
        <path d="M12 18h.01" />
    </svg>
);
