'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Building2,
    Users,
    FileCode,
    Settings,
    TrendingUp,
    Plus,
    MoreVertical,
    MoreHorizontal,
    ChevronRight,
    ShieldCheck,
    Zap,
    LayoutGrid,
    Activity
} from 'lucide-react';
import { useState } from 'react';
import { cn, fetchApi } from '@/lib/utils';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export default function OrganizationDashboard() {
    const params = useParams();
    const slug = params.slug as string;
    const [activeTab, setActiveTab] = useState('Overview');

    const tabs = ['Overview', 'Members', 'Snippets', 'Settings'];

    const { data: organization, isLoading, error } = useQuery({
        queryKey: ['organization', slug],
        queryFn: () => fetchApi(`/organizations/${slug}`)
    });

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-8 animate-pulse">
                    <div className="h-48 w-full bg-white/5 rounded-[40px]" />
                    <div className="h-12 w-64 bg-white/5 rounded-2xl" />
                    <div className="grid grid-cols-3 gap-6">
                        <div className="h-32 bg-white/5 rounded-[32px]" />
                        <div className="h-32 bg-white/5 rounded-[32px]" />
                        <div className="h-32 bg-white/5 rounded-[32px]" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !organization) {
        return (
            <DashboardLayout>
                <div className="py-20 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Organization not found</h2>
                    <Link href="/dashboard" className="text-blue-400 hover:text-white transition-colors">Return to Dashboard</Link>
                </div>
            </DashboardLayout>
        );
    }

    const members = organization.members || [];

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Org Header */}
                <div className="glass rounded-[40px] p-10 border border-white/5 bg-gradient-to-br from-blue-600/10 to-transparent">
                    <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
                        <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-blue-500 to-emerald-500 p-1">
                            <div className="w-full h-full rounded-[24px] bg-slate-900 flex items-center justify-center">
                                <Building2 size={40} className="text-white" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-4xl font-bold text-white uppercase tracking-tight">{organization.name}</h1>
                                <p className="text-blue-400 font-mono text-sm tracking-widest">ORG_ID: {organization.id.substring(0, 8).toUpperCase()}</p>
                            </div>
                            <p className="text-slate-400 max-w-2xl leading-relaxed">
                                {organization.description || 'No description provided.'}
                            </p>
                            <div className="flex items-center gap-6">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0f172a] bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">
                                            U{i}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">{organization.member_count} Active Members</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="px-6 py-3 glass hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/5 flex items-center gap-2">
                                <Settings size={18} /> Manage
                            </button>
                            <button className="px-8 py-3 bg-white text-slate-950 rounded-2xl font-black transition-all shadow-xl shadow-white/10 hover:bg-slate-200 flex items-center uppercase tracking-wide gap-2">
                                <Plus size={18} /> Invite
                            </button>
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
                                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                                activeTab === tab ? "bg-white text-slate-900 shadow-xl" : "text-slate-500 hover:text-white"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-8">
                    {activeTab === 'Overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: 'Total Snippets', value: '452', icon: FileCode, color: 'text-violet-400' },
                                    { label: 'Weekly Activities', value: '1,240', icon: Activity, color: 'text-emerald-400' },
                                    { label: 'Team Velocity', value: '+12%', icon: TrendingUp, color: 'text-blue-400' },
                                ].map(stat => (
                                    <div key={stat.label} className="glass p-8 rounded-[32px] border border-white/5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={cn("p-2 bg-white/5 rounded-lg", stat.color)}><stat.icon size={20} /></div>
                                            <ChevronRight className="text-slate-600" size={16} />
                                        </div>
                                        <p className="text-2xl font-bold text-white">{stat.label === 'Total Snippets' ? organization.snippet_count : stat.value}</p>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="glass p-8 rounded-[32px] border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <Users size={20} className="text-blue-400" /> Recent Members
                                    </h3>
                                    <div className="space-y-4">
                                        {members.slice(0, 3).map((member: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center font-bold text-white text-sm">{member.users?.display_name?.substring(0, 2).toUpperCase() || member.users?.username?.substring(0, 2).toUpperCase() || '??'}</div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{member.users?.display_name || member.users?.username}</p>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{member.role}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold text-emerald-400 uppercase">ACTIVE</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="glass p-8 rounded-[32px] border border-white/5">
                                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                        <Zap size={20} className="text-amber-400" /> Intelligence Feed
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-violet-600/10 rounded-2xl border border-violet-500/20">
                                            <p className="text-xs text-slate-300 leading-relaxed italic">
                                                "Team collaboration efficiency is up by 15% this week. Maya ML has contributed 4 high-performance Rust utilities."
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-[11px] text-slate-400">System generated report: <span className="text-white font-bold">2026-Q1-W6</span></p>
                                            <button className="text-[10px] font-bold text-violet-400 uppercase">VIEW DOC</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'Snippets' && (
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-950/40 p-8 rounded-[32px] border border-white/5">
                                <div className="flex flex-wrap gap-4">
                                    {['All', 'Public', 'Private', 'Restricted'].map(filter => (
                                        <button key={filter} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all">
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative group w-full md:w-80">
                                    <input className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3 pl-6 pr-12 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium" placeholder="Search team snippets..." />
                                    <LayoutGrid className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="glass p-8 rounded-[40px] border border-white/5 group hover:border-blue-500/30 transition-all relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-5">
                                            <FileCode size={64} />
                                        </div>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow-emerald" />
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">v2.4.0</span>
                                            </div>
                                            <ShieldCheck size={14} className="text-blue-500" />
                                        </div>
                                        <h3 className="text-lg font-black text-white uppercase italic tracking-tight mb-2">Internal_Auth_Utility_{i}</h3>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">Proprietary neural layer handling multi-factor team authentication...</p>
                                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Rust</span>
                                                <div className="w-1 h-1 bg-white/10 rounded-full" />
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">34 KB</span>
                                            </div>
                                            <button className="text-slate-500 hover:text-white transition-colors"><MoreHorizontal size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Members' && (
                        <div className="glass rounded-[40px] border border-white/5 overflow-hidden shadow-2xl bg-slate-950/20">
                            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <h3 className="text-sm font-bold text-white uppercase tracking-widest">Active Members</h3>
                                <div className="flex gap-2">
                                    <input className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50" placeholder="Search members..." />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/[0.01]">
                                            <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Member</th>
                                            <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                                            <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Joined</th>
                                            <th className="px-8 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {(organization.members || []).map((member: any, i: number) => (
                                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-[10px] text-white underline decoration-blue-500/50">{member.users?.username?.substring(0, 2).toUpperCase() || '??'}</div>
                                                        <span className="font-bold text-white">{member.users?.display_name || member.users?.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <span className="text-[10px] font-bold px-2 py-1 bg-slate-900 rounded-md text-slate-400 border border-white/5">{member.role}</span>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", member.status === 'Active' ? "bg-emerald-500" : "bg-slate-600")} />
                                                        <span className="text-xs text-slate-300">{member.status}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4 text-xs text-slate-500 font-mono">2024-02-09</td>
                                                <td className="px-8 py-4 text-right">
                                                    <button className="p-2 text-slate-500 hover:text-white transition-colors"><MoreHorizontal size={18} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
