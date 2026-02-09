'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Star,
    Code2,
    Search,
    Filter,
    LayoutGrid,
    List,
    ChevronDown,
    ArrowUpRight,
    Copy,
    MoreVertical,
    Calendar,
    Zap,
    MessageSquare,
    Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const starredSnippets = [
    {
        id: '1',
        title: 'Concurrent Queue Handler',
        description: 'A high-performance concurrent queue implementation in Go for handling message bursts.',
        language: 'Go',
        stars: 124,
        views: '1.2k',
        comments: 18,
        lastStarred: '2 hours ago',
        ai_analyzed: true
    },
    {
        id: '2',
        title: 'Redis Caching Decorator',
        description: 'Simplify Redis caching in Python using this reusable decorator for FastAPI.',
        language: 'Python',
        stars: 89,
        views: '840',
        comments: 12,
        lastStarred: 'Yesterday',
        ai_analyzed: true
    },
    {
        id: '3',
        title: 'React Performance hook',
        description: 'A custom hook to track and visualize component re-renders in real-time.',
        language: 'TypeScript',
        stars: 450,
        views: '4.5k',
        comments: 64,
        lastStarred: '3 days ago',
        ai_analyzed: true
    },
    {
        id: '4',
        title: 'Rust Network Parser',
        description: 'Blazing fast binary protocol parser implementation using Nom.',
        language: 'Rust',
        stars: 312,
        views: '2.1k',
        comments: 24,
        lastStarred: '1 week ago',
        ai_analyzed: false
    }
];

export default function StarredPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                                <Star className="text-amber-400 fill-amber-400" size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">
                                Starred <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">Vault</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 font-medium tracking-tight">Your curated library of essential code logic and inspirations.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={16} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search your vault..."
                                className="pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all w-64 backdrop-blur-md"
                            />
                        </div>

                        <div className="flex items-center p-1 bg-slate-800/50 border border-white/5 rounded-xl backdrop-blur-md">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    viewMode === 'grid' ? "bg-amber-500 text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    viewMode === 'list' ? "bg-amber-500 text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">4 Starred Snippets</span>
                        <div className="h-4 w-px bg-white/10" />
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
                            Recent <ChevronDown size={14} />
                        </button>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">
                            Language <ChevronDown size={14} />
                        </button>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-amber-400 transition-colors">
                        Clear Hidden Vault
                    </button>
                </div>

                {/* Grid View */}
                <div className={cn(
                    "grid gap-6",
                    viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2" : "grid-cols-1"
                )}>
                    {starredSnippets.map((snippet) => (
                        <div
                            key={snippet.id}
                            className="group relative p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl hover:border-amber-500/30 transition-all duration-300 overflow-hidden"
                        >
                            {/* Ambient Star Glow */}
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-500/5 blur-[80px] group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-start justify-between mb-4">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-white tracking-tight italic uppercase group-hover:text-amber-400 transition-colors">{snippet.title}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-500/80 bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/10">
                                            {snippet.language}
                                        </span>
                                        {snippet.ai_analyzed && (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-violet-400/80 bg-violet-500/5 px-2 py-0.5 rounded-full border border-violet-500/10 flex items-center gap-1">
                                                <Zap size={10} className="fill-violet-400" /> AI Analyzed
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                        <Copy size={16} />
                                    </button>
                                    <button className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-slate-400 leading-relaxed font-medium mb-8 line-clamp-2">{snippet.description}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-white transition-colors">
                                        <Eye size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{snippet.views}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500 group-hover:text-white transition-colors">
                                        <MessageSquare size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{snippet.comments}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-amber-500">
                                        <Star size={14} className="fill-amber-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest font-bold italic">{snippet.stars}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                    <Calendar size={12} />
                                    {snippet.lastStarred}
                                </div>
                            </div>

                            <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center translate-x-16 group-hover:translate-x-0 transition-transform shadow-lg shadow-amber-500/30">
                                <ArrowUpRight size={24} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Empty State Suggestion */}
                <div className="p-10 rounded-[3rem] bg-slate-900/30 border border-white/5 border-dashed text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                        <Star className="text-slate-600" size={32} />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Expand Your Vault</h3>
                    <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium leading-relaxed">Continue exploring the community to star more snippets and build your ultimate reference library.</p>
                    <button className="px-8 py-3 rounded-2xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-amber-500/20 hover:scale-105 transition-all">
                        Discover Community Snippets
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
