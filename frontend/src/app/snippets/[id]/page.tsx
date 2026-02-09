'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Star,
    Users,
    MessageSquare,
    Share2,
    ShieldCheck,
    Zap,
    BarChart3,
    Copy,
    Terminal,
    ChevronRight,
    User as UserIcon,
    Clock,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { cn, fetchApi, formatRelativeTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export default function SnippetPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: snippet, isLoading, error } = useQuery({
        queryKey: ['snippet', id],
        queryFn: () => fetchApi(`/snippets/${id}`)
    });

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="max-w-6xl mx-auto space-y-10 animate-pulse">
                    <div className="h-8 w-48 bg-white/5 rounded-xl" />
                    <div className="h-24 w-full bg-white/5 rounded-[32px]" />
                    <div className="h-[400px] w-full bg-white/5 rounded-[40px]" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !snippet) {
        return (
            <DashboardLayout>
                <div className="max-w-6xl mx-auto py-20 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Snippet not found</h2>
                    <Link href="/snippets" className="text-violet-400 hover:text-white transition-colors">Return to Explorer</Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <Link href="/snippets" className="hover:text-white transition-colors">Explorer</Link>
                    <ChevronRight size={14} />
                    <span className="text-white">Active Snippet</span>
                </nav>

                {/* Snippet Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-violet-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-violet-600/20">
                                <Terminal className="text-white" size={24} />
                            </div>
                            <h1 className="text-4xl font-bold text-white uppercase tracking-tight">{snippet.title}</h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href={`/profile/${snippet.author?.username}`} className="flex items-center gap-2 group">
                                <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 group-hover:border-violet-500/50 transition-all flex items-center justify-center">
                                    <UserIcon size={12} className="text-slate-400" />
                                </div>
                                <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{snippet.author?.username || 'anonymous'}</span>
                            </Link>
                            <span className="text-slate-700">|</span>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5"><Star size={14} className="text-amber-400" /> {snippet.star_count || 0}</span>
                                <span className="flex items-center gap-1.5"><Users size={14} className="text-blue-400" /> {snippet.fork_count || 0} Forks</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex-1 md:flex-none px-6 py-3 glass hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/5 flex items-center justify-center gap-2">
                            <Share2 size={18} /> Share
                        </button>
                        <button className="flex-1 md:flex-none px-8 py-3 bg-white text-slate-950 rounded-2xl font-black transition-all shadow-xl shadow-white/10 hover:bg-slate-200 flex items-center justify-center gap-2 uppercase tracking-wide">
                            <Copy size={18} /> Fork
                        </button>
                    </div>
                </div>

                {/* AI Insight Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Security Score', value: '98/100', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                        { label: 'Performance', value: 'High', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                        { label: 'Readability', value: 'A+', icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    ].map(insight => (
                        <div key={insight.label} className="glass p-5 rounded-[24px] border border-white/5 flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", insight.bg)}>
                                <insight.icon size={20} className={insight.color} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{insight.label}</p>
                                <p className="text-lg font-bold text-white leading-none">{insight.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Code Section */}
                <div className="glass rounded-[40px] border border-white/5 overflow-hidden flex flex-col bg-slate-950/20 shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                            </div>
                            <span className="text-xs font-mono text-slate-500">auth-middleware.ts</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-1 rounded">TYPESCRIPT</span>
                    </div>

                    <div className="p-10 font-mono text-sm leading-relaxed text-slate-300 relative group">
                        <pre className="custom-scrollbar overflow-x-auto whitespace-pre">
                            {snippet.code}
                        </pre>
                        <button className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/10 opacity-0 group-hover:opacity-100">
                            <Copy size={20} />
                        </button>
                    </div>
                </div>

                {/* Description & Metadata */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">Description</h2>
                            <p className="text-slate-400 leading-relaxed">
                                {snippet.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Comments Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <MessageSquare size={20} className="text-emerald-400" /> Comments (42)
                            </h2>
                            <div className="space-y-4">
                                <div className="glass p-6 rounded-3xl border border-white/5 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-white">MK</div>
                                            <span className="text-sm font-bold text-white">mike_kode</span>
                                        </div>
                                        <span className="text-xs text-slate-600">3h ago</span>
                                    </div>
                                    <p className="text-sm text-slate-400 leading-relaxed">
                                        This is exactly what I was looking for! Any plans to add support for refresh tokens in this middleware?
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        className="flex-1 bg-slate-900/50 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-mono"
                                    />
                                    <button className="px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm uppercase tracking-widest">Post</button>
                                </div>
                            </div>
                        </div>

                        {/* Version History */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <Clock size={20} className="text-blue-400" /> Version History
                            </h2>
                            <div className="bg-slate-950/50 rounded-[32px] border border-white/5 overflow-hidden">
                                {[
                                    { ver: 'v2.1.0', date: 'Yesterday', change: 'Added support for RS256 algorithms' },
                                    { ver: 'v2.0.4', date: '3 days ago', change: 'Fixed edge case in token expiry' },
                                    { ver: 'v2.0.0', date: 'Oct 12, 2025', change: 'Major refactor to TypeScript' },
                                ].map((v, i) => (
                                    <div key={v.ver} className={cn(
                                        "p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group",
                                        i !== 2 && "border-b border-white/5"
                                    )}>
                                        <div className="flex items-center gap-6">
                                            <span className="text-sm font-mono text-violet-400 group-hover:text-white transition-colors">{v.ver}</span>
                                            <div>
                                                <p className="text-sm text-white font-medium">{v.change}</p>
                                                <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-0.5">{v.date}</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-700 group-hover:text-violet-500 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-10">
                        <div className="glass p-8 rounded-[32px] border border-white/5 space-y-8 h-fit">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Community Insights</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Used in</span>
                                    <span className="text-white font-bold">452 Projects</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Average Stars</span>
                                    <span className="text-white font-bold">4.8/5</span>
                                </div>
                                <div className="pt-6 border-t border-white/5">
                                    <p className="text-xs text-slate-500 italic leading-relaxed">
                                        "Verified by Sunder Security Labs. No critical vulnerabilities found in path analysis."
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest px-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {snippet.tags?.map((tag: string) => (
                                    <span key={tag} className="px-4 py-2 bg-slate-900 border border-white/5 rounded-2xl text-[11px] text-slate-400 hover:border-violet-500/50 hover:text-white transition-all cursor-pointer font-bold uppercase tracking-tighter">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </DashboardLayout>
    );
}
