'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    User,
    Camera,
    Mail,
    Globe,
    Github,
    Twitter,
    Shield,
    Terminal,
    Save,
    RotateCcw,
    CheckCircle2,
    Briefcase,
    MapPin,
    Code2,
    Sparkles,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function ProfileEditPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 2000);
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                <User className="text-violet-400" size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">
                                Edit <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Persona</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 font-medium tracking-tight">Refine your digital identity and coding signature.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="px-6 py-2.5 rounded-xl bg-white/5 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                            Discard Changes
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 py-2.5 rounded-xl bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2"
                        >
                            {isSaving ? (
                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {isSaving ? 'Synchronizing...' : 'Commit Changes'}
                        </button>
                    </div>
                </div>

                {/* Profile Tabs */}
                <div className="flex items-center gap-8 border-b border-white/5 px-2">
                    {[
                        { id: 'personal', label: 'Persona', icon: User },
                        { id: 'coding', label: 'Signature', icon: Terminal },
                        { id: 'social', label: 'Neural Link', icon: Globe },
                        { id: 'security', label: 'Firewall', icon: Shield }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-[0.2em] relative transition-all",
                                activeTab === tab.id ? "text-violet-400" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Avatar & Quick Info */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl flex flex-col items-center text-center group">
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-4xl font-black text-white italic shadow-2xl overflow-hidden relative">
                                    A
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <Camera className="text-white" size={32} />
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-violet-600 border-4 border-[#0f172a] flex items-center justify-center text-white shadow-lg">
                                    <Sparkles size={14} className="fill-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white italic tracking-tight uppercase mb-1">Alex Rivera</h3>
                            <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-4">Neural Architect</p>
                            <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">
                                Update Neural ID
                            </button>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl space-y-4">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Profile Score</h4>
                            <div className="flex items-center justify-between text-2xl font-black text-white italic">
                                <span>84%</span>
                                <CheckCircle2 className="text-emerald-400" size={24} />
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[84%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">Complete your coding signature to reach 100%.</p>
                        </div>
                    </div>

                    {/* Right: Detailed Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl space-y-8">
                            {activeTab === 'personal' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Display Name</label>
                                            <input
                                                type="text"
                                                defaultValue="Alex Rivera"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Terminal</label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                                <input
                                                    type="email"
                                                    defaultValue="alex@sunder.app"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium italic"
                                                    disabled
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Developer Bio</label>
                                        <textarea
                                            rows={4}
                                            defaultValue="Building the future of AI-assisted collaboration at Sunder. Focused on Rust, TypeScript, and Generative UI patterns."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium leading-relaxed"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Organization / Title</label>
                                            <div className="relative">
                                                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                                <input
                                                    type="text"
                                                    defaultValue="Sunder Core Team"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Geographic Node</label>
                                            <div className="relative">
                                                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                                <input
                                                    type="text"
                                                    defaultValue="Digital Nomad / SF"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'coding' && (
                                <div className="space-y-8 text-center py-10">
                                    <div className="w-20 h-20 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
                                        <Terminal className="text-violet-400" size={32} />
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Coding Signature</h3>
                                    <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium leading-relaxed">Let Sunder analyze your public snippets to generated a unique coding style fingerprint for AI personalization.</p>
                                    <button className="px-8 py-3 rounded-2xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-violet-500/20 hover:scale-105 transition-all">
                                        Recalculate Signature
                                    </button>
                                </div>
                            )}

                            {activeTab === 'social' && (
                                <div className="space-y-6">
                                    {[
                                        { label: 'GitHub Profile', icon: Github, value: 'github.com/arivera' },
                                        { label: 'Neural Link (Twitter/X)', icon: Twitter, value: '@alex_neuro' },
                                        { label: 'Personal Matrix (Web)', icon: Globe, value: 'arivera.dev' }
                                    ].map((social) => (
                                        <div key={social.label} className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{social.label}</label>
                                            <div className="relative">
                                                <social.icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <input
                                                    type="text"
                                                    defaultValue={social.value}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Insight Footer */}
                        <div className="p-6 rounded-[2rem] bg-gradient-to-r from-violet-600/10 to-transparent border border-white/5 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                                    <ParallaxScroll size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Public Visibility</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Visible to all Void walkers</p>
                                </div>
                            </div>
                            <ArrowRight className="text-slate-700 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function ParallaxScroll({ size }: { size: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    )
}
