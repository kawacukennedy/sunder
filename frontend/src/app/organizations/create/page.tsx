'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/utils';
import { Building2, Globe, Shield, ChevronRight, Layout, Slack } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OrganizationCreate() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        is_public: true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await fetchApi('/organizations', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            router.push(`/organizations/${data.slug}`);
        } catch (error) {
            console.error('Creation failed:', error);
            alert('Slug might already be taken or creation failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto space-y-12 pb-20">
                <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-600 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/20">
                        <Building2 className="text-white" size={32} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-white uppercase tracking-tight italic">Spawn Organization</h1>
                        <p className="text-slate-400 font-medium">Create a digital space for your collective intelligence</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="glass p-12 rounded-[48px] border border-white/5 space-y-12 bg-white/[0.01]">
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-2">
                                    <Layout size={12} /> Legal Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/5 rounded-3xl px-8 py-5 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-bold placeholder-slate-700"
                                    placeholder="e.g. Acme Corp"
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-2">
                                    <Globe size={12} /> Handle (Slug)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 font-mono text-sm leading-none">@</span>
                                    <input
                                        type="text"
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                        className="w-full pl-14 pr-8 py-5 bg-slate-900 border border-white/5 rounded-3xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-mono text-sm"
                                        placeholder="acme-engineering"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 flex items-center gap-2">
                                <Shield size={12} /> Manifesto / Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-slate-900 border border-white/5 rounded-[32px] px-8 py-6 text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all min-h-[140px] resize-none"
                                placeholder={"What's the purpose of this collective? Describe your goals and principles."}
                            />
                        </div>

                        <div className="pt-6 flex items-center justify-between p-6 bg-slate-950/50 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-6 rounded-full p-1 transition-all cursor-pointer",
                                    formData.is_public ? "bg-blue-600" : "bg-slate-800"
                                )} onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}>
                                    <div className={cn(
                                        "w-4 h-4 rounded-full bg-white transition-all transform ease-out",
                                        formData.is_public ? "translate-x-6" : "translate-x-0"
                                    )} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white uppercase tracking-widest">Public Directory</p>
                                    <p className="text-[10px] text-slate-500">Visible to all Sunder users</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-6 bg-white text-slate-950 font-black rounded-3xl hover:bg-slate-200 transition-all shadow-2xl shadow-white/10 uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50 group"
                    >
                        Initialize Organization <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
}
