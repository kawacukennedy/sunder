'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    BookOpen,
    Play,
    CheckCircle2,
    Lock,
    Clock,
    Star,
    Users,
    TrendingUp,
    ChevronRight,
    Zap,
    Cpu,
    Code2,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';

const categories = ['All', 'Systems', 'Frontend', 'AI/ML', 'Security', 'Web3'];

const courses = [
    {
        id: '1',
        title: 'High-Performance Rust Systems',
        description: 'Master memory safety and zero-cost abstractions for mission-critical core logic.',
        category: 'Systems',
        instructor: 'Dr. Neural',
        duration: '12h 45m',
        students: 1240,
        rating: 4.9,
        level: 'Advanced',
        image: Cpu,
        color: 'text-orange-500',
        bg: 'bg-orange-500/10',
        status: 'in_progress',
        progress: 65
    },
    {
        id: '2',
        title: 'AI Synthesis Protocol',
        description: 'Leveraging Gemini 1.5 Pro for architectural pattern recognition and large-scale refactoring.',
        category: 'AI/ML',
        instructor: 'CyberVector',
        duration: '8h 20m',
        students: 4500,
        rating: 4.8,
        level: 'Intermediate',
        image: Zap,
        color: 'text-violet-500',
        bg: 'bg-violet-500/10',
        status: 'available',
        progress: 0
    },
    {
        id: '3',
        title: 'Distributed Consensus Engineering',
        description: 'Implementing fault-tolerant systems using Raft and Paxos in multi-cloud environments.',
        category: 'Systems',
        instructor: 'VoidMaster',
        duration: '15h 00m',
        students: 890,
        rating: 5.0,
        level: 'Expert',
        image: TrendingUp,
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        status: 'locked',
        progress: 0
    },
    {
        id: '4',
        title: 'Atomic UI Architectures',
        description: 'Building ultra-responsive, accessible design systems with modern React patterns.',
        category: 'Frontend',
        instructor: 'LayoutNinja',
        duration: '6h 30m',
        students: 2800,
        rating: 4.7,
        level: 'Beginner',
        image: Code2,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        status: 'completed',
        progress: 100
    }
];

export default function LearningCourses() {
    const [activeCategory, setActiveCategory] = useState('All');

    return (
        <DashboardLayout>
            <div className="space-y-12 max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <BookOpen className="text-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-white uppercase tracking-tight leading-none mb-2 italic">Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Academy</span></h1>
                            <p className="text-slate-400 font-medium">Elevate your technical prowess through curated deep-dives.</p>
                        </div>
                    </div>

                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find your next specialization..."
                            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                activeCategory === cat
                                    ? "bg-white text-slate-950 border-white shadow-lg"
                                    : "bg-slate-900/50 text-slate-500 border-white/5 hover:border-white/10 hover:text-white"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {courses.filter(c => activeCategory === 'All' || c.category === activeCategory).map((course) => (
                        <div
                            key={course.id}
                            className={cn(
                                "group relative p-8 rounded-[3rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl transition-all duration-500 flex flex-col md:flex-row gap-8 overflow-hidden",
                                course.status === 'locked' ? 'opacity-50' : 'hover:border-blue-500/30 hover:-translate-y-1'
                            )}
                        >
                            {/* Course Icon/Art */}
                            <div className={cn(
                                "w-full md:w-48 aspect-square rounded-[2rem] flex items-center justify-center relative shadow-2xl overflow-hidden shrink-0",
                                course.bg
                            )}>
                                <course.image className={course.color} size={64} strokeWidth={1.5} />
                                {course.status === 'in_progress' && (
                                    <div className="absolute inset-x-0 bottom-0 py-2 bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-black text-center uppercase tracking-widest">
                                        RESUME SESSION
                                    </div>
                                )}
                                {course.status === 'locked' && (
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                        <Lock className="text-white/40" size={32} />
                                    </div>
                                )}
                            </div>

                            {/* Course Info */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                                        {course.category}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-amber-400">
                                        <Star size={12} fill="currentColor" />
                                        <span className="text-xs font-black">{course.rating}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white italic tracking-tight uppercase leading-none group-hover:text-blue-400 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-sm text-slate-400 font-medium line-clamp-2">
                                        {course.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <Clock size={14} /> {course.duration}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <Users size={14} /> {course.students} ENGs
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-[#0f172a] shadow-lg" />
                                        ))}
                                        <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-[#0f172a] shadow-lg flex items-center justify-center text-[8px] font-black text-white">+4k</div>
                                    </div>

                                    {course.status === 'completed' ? (
                                        <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest">
                                            <CheckCircle2 size={16} /> Certified
                                        </div>
                                    ) : (
                                        <button
                                            disabled={course.status === 'locked'}
                                            className={cn(
                                                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                course.status === 'in_progress' ? "bg-blue-600 text-white" : "bg-white text-slate-950 hover:bg-slate-200"
                                            )}
                                        >
                                            {course.status === 'in_progress' ? 'Continue' : 'Initialize'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Featured Instructor */}
                <div className="p-12 rounded-[4rem] bg-gradient-to-br from-slate-900 to-black border border-white/5 relative overflow-hidden group">
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full group-hover:bg-blue-600/20 transition-colors duration-700" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                        <div className="w-40 h-40 rounded-full bg-slate-800 border-4 border-white/10 shadow-2xl shrink-0" />
                        <div className="space-y-6 text-center md:text-left">
                            <div>
                                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-2">Featured Specialist</h4>
                                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Dr. Neural_Void</h3>
                                <p className="text-slate-400 font-medium max-w-xl">
                                    Pioneer in high-fidely code synthesis and distributed architecture. Join over 20k students mastering the art of low-latency systems.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white uppercase tracking-widest">12 Courses</div>
                                <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white uppercase tracking-widest">4.9/5 Rating</div>
                                <div className="px-5 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-white uppercase tracking-widest">Elite Tier</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
