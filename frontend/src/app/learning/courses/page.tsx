'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    BookOpen,
    Play,
    Star,
    Clock,
    User,
    ChevronRight,
    Search,
    Filter,
    ArrowUpRight,
    Shield,
    Cpu,
    Codepen,
    Sparkles,
    LayoutGrid,
    List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const courses = [
    {
        id: '1',
        title: 'Advanced React Patterns',
        instructor: 'Sarah Drasner',
        rating: 4.9,
        reviews: 1240,
        duration: '6h 45m',
        level: 'Intermediate',
        tags: ['Frontend', 'Performance'],
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
        price: 'Free'
    },
    {
        id: '2',
        title: 'Rust for WebAssembly',
        instructor: 'Lin Clark',
        rating: 4.8,
        reviews: 856,
        duration: '8h 20m',
        level: 'Advanced',
        tags: ['Systems', 'WASM'],
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
        price: 'Pro'
    },
    {
        id: '3',
        title: 'LLM Integration in TS',
        instructor: 'Guillermo Rauch',
        rating: 5.0,
        reviews: 2100,
        duration: '4h 15m',
        level: 'Expert',
        tags: ['AI', 'TypeScript'],
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
        price: 'Pro'
    },
    {
        id: '4',
        title: 'Distributed Systems',
        instructor: 'Leslie Lamport',
        rating: 4.7,
        reviews: 540,
        duration: '12h 30m',
        level: 'Expert',
        tags: ['Backend', 'Scale'],
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
        price: 'Free'
    }
];

export default function CoursesPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    return (
        <DashboardLayout>
            <div className="space-y-12 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                <BookOpen className="text-violet-400" size={24} />
                            </div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">
                                Knowledge <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Library</span>
                            </h1>
                        </div>
                        <p className="text-slate-400 font-medium tracking-tight">Structured intelligence modules for the modern engineer.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-violet-400 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                className="pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/5 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all w-64 backdrop-blur-md"
                            />
                        </div>

                        <div className="flex items-center p-1 bg-slate-800/50 border border-white/5 rounded-xl backdrop-blur-md">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    viewMode === 'grid' ? "bg-violet-500 text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    viewMode === 'list' ? "bg-violet-500 text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="flex items-center gap-4 overflow-x-auto pb-4 border-b border-white/5 no-scrollbar">
                    {['All Courses', 'Popular', 'Trending', 'New', 'Pro Only'].map((label) => (
                        <button key={label} className="whitespace-nowrap px-6 py-2 rounded-full border border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all">
                            {label}
                        </button>
                    ))}
                </div>

                {/* Course Grid */}
                <div className={cn(
                    "grid gap-8",
                    viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2" : "grid-cols-1"
                )}>
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl hover:border-white/10 transition-all duration-500"
                        >
                            <div className="w-full md:w-48 h-48 rounded-[2rem] overflow-hidden relative shrink-0">
                                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                    <span className={cn(
                                        "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                                        course.price === 'Pro' ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
                                    )}>
                                        {course.price}
                                    </span>
                                </div>
                                <button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-xl">
                                        <Play size={20} className="fill-slate-900 ml-1" />
                                    </div>
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col justify-between py-2">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-wrap gap-2">
                                            {course.tags.map(tag => (
                                                <span key={tag} className="text-[10px] font-black text-violet-400 tracking-widest uppercase">{tag}</span>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-amber-500">
                                            <Star size={14} className="fill-amber-500" />
                                            <span className="text-xs font-black italic">{course.rating}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{course.title}</h3>
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <User size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{course.instructor}</span>
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-white/10" />
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{course.duration}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-[10px] text-slate-400 font-medium">{course.reviews} Engineers enrolled</div>
                                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-400 group-hover:text-white transition-colors">
                                        Launch Module <ArrowUpRight size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Newsletter / CTA */}
                <div className="p-10 rounded-[3rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-8 group">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Stay Ahead of the Void</h2>
                        <p className="text-slate-400 text-sm font-medium">Get exclusive weekly deep-dives into LLM patterns and system architecture.</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-3">
                        <input type="email" placeholder="Terminal Email..." className="flex-1 md:w-64 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
                        <button className="px-8 py-3 rounded-2xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-violet-500/20">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
