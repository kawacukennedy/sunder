'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Search,
    Filter,
    ChevronDown,
    Star,
    Users,
    Clock,
    LayoutGrid,
    List,
    Plus,
    FileCode
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { cn, fetchApi, formatRelativeTime } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

export default function SnippetExplorer() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedLanguage, setSelectedLanguage] = useState('All');

    const languages = ['All', 'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Swift', 'C++'];
    const tags = ['Web', 'Mobile', 'AI', 'Security', 'Frontend', 'Backend', 'DevOps'];

    const { data: snippets, isLoading, error } = useQuery({
        queryKey: ['snippets', selectedLanguage],
        queryFn: () => {
            const url = selectedLanguage === 'All' ? '/snippets' : `/snippets?language=${selectedLanguage}`;
            return fetchApi(url);
        }
    });

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Snippet Explorer</h1>
                        <p className="text-slate-400">Discover and fork community-sourced code solutions</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-900 border border-white/10 rounded-xl overflow-hidden p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white/10 text-white" : "text-slate-500 hover:text-white")}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white/10 text-white" : "text-slate-500 hover:text-white")}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-64 space-y-8">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Languages</h3>
                            <div className="space-y-2">
                                {languages.map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => setSelectedLanguage(lang)}
                                        className={cn(
                                            "w-full text-left px-4 py-2 rounded-xl text-sm transition-all",
                                            selectedLanguage === lang ? "bg-violet-600/20 text-violet-400 border border-violet-500/30" : "text-slate-400 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Date Range</h3>
                            <div className="space-y-2">
                                {['Last 24h', 'Past Week', 'Past Month', 'Year to Date'].map(range => (
                                    <label key={range} className="flex items-center gap-3 group cursor-pointer">
                                        <div className="w-5 h-5 rounded-md border border-white/10 group-hover:border-violet-500/50 flex items-center justify-center transition-all bg-slate-900/50">
                                            <div className="w-2 h-2 rounded-full bg-violet-400 opacity-0 group-hover:opacity-10" />
                                        </div>
                                        <span className="text-sm text-slate-500 group-hover:text-slate-300 transition-colors">{range}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Popular Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <button key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-slate-400 hover:border-violet-500/50 hover:text-white transition-all">
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Saved Searches</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'High Perf Rust', query: 'lang:rust stars:>500' },
                                    { label: 'Auth Middleware', query: 'tag:auth tag:express' },
                                ].map(search => (
                                    <div key={search.label} className="group cursor-pointer">
                                        <p className="text-sm font-bold text-slate-400 group-hover:text-white transition-all">{search.label}</p>
                                        <p className="text-[10px] font-mono text-slate-600 group-hover:text-violet-500 transition-all">{search.query}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Grid */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-sm text-slate-500">Showing 124 results for <span className="text-white font-medium">"{selectedLanguage}"</span></span>
                            <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-slate-900 px-4 py-2 rounded-xl border border-white/10">
                                Sort: Newest <ChevronDown size={14} />
                            </button>
                        </div>

                        <div className={cn(
                            "grid gap-6",
                            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                        )}>
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="glass rounded-[32px] h-[200px] animate-pulse bg-white/5" />
                                ))
                            ) : error ? (
                                <div className="col-span-full py-12 text-center glass rounded-[32px]">
                                    <p className="text-slate-400">Failed to load snippets. Please try again later.</p>
                                </div>
                            ) : snippets?.length === 0 ? (
                                <div className="col-span-full py-12 text-center glass rounded-[32px]">
                                    <p className="text-slate-400">No snippets found for this category.</p>
                                </div>
                            ) : (
                                snippets.map((snippet: any) => (
                                    <Link href={`/snippets/${snippet.id}`} key={snippet.id} className="glass group overflow-hidden rounded-[32px] border border-white/5 hover:border-violet-500/30 transition-all duration-300 block">
                                        <div className="p-8">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/20">
                                                        <FileCode className="text-violet-400" size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white group-hover:text-violet-400 transition-colors uppercase tracking-tight">{snippet.title}</h3>
                                                        <p className="text-xs text-slate-500">@{snippet.author?.username || 'anonymous'}</p>
                                                    </div>
                                                </div>
                                                <button className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                                                    <Star size={18} />
                                                </button>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {snippet.tags?.map((tag: string) => (
                                                    <span key={tag} className="px-2 py-1 bg-white/5 rounded-md text-[10px] text-slate-400">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Star size={12} className="text-amber-400" /> {snippet.star_count || 0}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                        <Users size={12} className="text-blue-400" /> {snippet.fork_count || 0}
                                                    </span>
                                                </div>
                                                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Clock size={12} /> {formatRelativeTime(snippet.created_at)} ago
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* Load More */}
                        <div className="mt-12 flex justify-center">
                            <button className="px-8 py-3 glass text-white font-semibold rounded-2xl hover:bg-white/10 transition-all border border-white/10">
                                Load More Snippets
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
