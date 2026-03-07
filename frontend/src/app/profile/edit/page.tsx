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
    ArrowRight,
    Eye,
    Loader2
} from 'lucide-react';
import { cn, fetchApi } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function ProfileEditPage() {
    const router = useRouter();
    const { user, updateUser } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('personal');
    const [successMessage, setSuccessMessage] = useState('');
    
    const [formData, setFormData] = useState({
        display_name: '',
        bio: '',
        organization: '',
        location: '',
        github: '',
        twitter: '',
        website: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                display_name: user.display_name || user.username || '',
                bio: user.bio || '',
                organization: user.organization || '',
                location: user.location || '',
                github: user.github || '',
                twitter: user.twitter || '',
                website: user.website || ''
            });
        }
        setIsLoading(false);
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSuccessMessage('');
        try {
            await fetchApi('/profiles/update', {
                method: 'PATCH',
                body: JSON.stringify({
                    display_name: formData.display_name,
                    bio: formData.bio,
                    preferences: {
                        ...user?.preferences,
                        organization: formData.organization,
                        location: formData.location,
                        github: formData.github,
                        twitter: formData.twitter,
                        website: formData.website
                    }
                })
            });
            updateUser({
                display_name: formData.display_name,
                bio: formData.bio,
                preferences: {
                    ...user?.preferences,
                    organization: formData.organization,
                    location: formData.location,
                    github: formData.github,
                    twitter: formData.twitter,
                    website: formData.website
                }
            });
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Failed to save profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        if (user) {
            setFormData({
                display_name: user.display_name || user.username || '',
                bio: user.bio || '',
                organization: user.preferences?.organization || '',
                location: user.preferences?.location || '',
                github: user.preferences?.github || '',
                twitter: user.preferences?.twitter || '',
                website: user.preferences?.website || ''
            });
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="animate-spin text-violet-500" size={32} />
                </div>
            </DashboardLayout>
        );
    }

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
                        <button 
                            onClick={handleDiscard}
                            className="px-6 py-2.5 rounded-xl bg-white/5 text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                            Discard Changes
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-8 py-2.5 rounded-xl bg-violet-500 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isSaving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Save size={16} />
                            )}
                            {isSaving ? 'Synchronizing...' : 'Commit Changes'}
                        </button>
                    </div>
                </div>

                {successMessage && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-400 text-sm font-medium">
                        <CheckCircle2 size={18} />
                        {successMessage}
                    </div>
                )}

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
                                    {(formData.display_name || user?.username || 'U').charAt(0).toUpperCase()}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <Camera className="text-white" size={32} />
                                    </div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-violet-600 border-4 border-[#0f172a] flex items-center justify-center text-white shadow-lg">
                                    <Sparkles size={14} className="fill-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white italic tracking-tight uppercase mb-1">{formData.display_name || user?.username}</h3>
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
                                                name="display_name"
                                                value={formData.display_name}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Terminal</label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                                <input
                                                    type="email"
                                                    value={user?.email || ''}
                                                    disabled
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium italic"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Developer Bio</label>
                                        <textarea
                                            name="bio"
                                            rows={4}
                                            value={formData.bio}
                                            onChange={handleChange}
                                            placeholder="Tell us about yourself..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium leading-relaxed placeholder:text-slate-700"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Organization / Title</label>
                                            <div className="relative">
                                                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                                                <input
                                                    type="text"
                                                    name="organization"
                                                    value={formData.organization}
                                                    onChange={handleChange}
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
                                                    name="location"
                                                    value={formData.location}
                                                    onChange={handleChange}
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
                                        { label: 'GitHub Profile', icon: Github, name: 'github', value: formData.github, placeholder: 'github.com/username' },
                                        { label: 'Neural Link (Twitter/X)', icon: Twitter, name: 'twitter', value: formData.twitter, placeholder: '@username' },
                                        { label: 'Personal Matrix (Web)', icon: Globe, name: 'website', value: formData.website, placeholder: 'yourdomain.com' }
                                    ].map((social) => (
                                        <div key={social.label} className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{social.label}</label>
                                            <div className="relative">
                                                <social.icon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                                <input
                                                    type="text"
                                                    name={social.name}
                                                    value={social.value}
                                                    onChange={handleChange}
                                                    placeholder={social.placeholder}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium placeholder:text-slate-700"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-4">Change Security PIN</h4>
                                        <p className="text-xs text-slate-500 mb-4">Your PIN is used for quick access to your dashboard.</p>
                                        <button className="px-6 py-2 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl">
                                            Update PIN
                                        </button>
                                    </div>
                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <h4 className="text-sm font-bold text-white uppercase tracking-tight mb-4">Two-Factor Authentication</h4>
                                        <p className="text-xs text-slate-500 mb-4">Add an extra layer of security to your account.</p>
                                        <button className="px-6 py-2 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/20">
                                            Enable 2FA
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quick Insight Footer */}
                        <div className="p-6 rounded-[2rem] bg-gradient-to-r from-violet-600/10 to-transparent border border-white/5 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400">
                                    <Eye size={20} />
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
