'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Map,
    Zap,
    Trophy,
    Target,
    Users,
    Clock,
    ChevronRight,
    Star,
    Award,
    Flame,
    LayoutGrid,
    Search,
    BrainCircuit,
    ArrowUpRight,
    Compass,
    Rocket,
    CheckCircle2,
    Sparkles,
    Calendar,
    Timer,
    AlertCircle,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const paths = [
    {
        id: '1',
        title: 'Neural Architect',
        description: 'Master the art of building AI-resilient software systems and high-fidelity interfaces.',
        level: 'Pro',
        modules: 12,
        duration: '24h',
        xp: 1200,
        progress: 65,
        color: 'text-violet-400',
        bgColor: 'bg-violet-500/10'
    },
    {
        id: '4',
        title: 'Rust Core Master',
        description: 'Go beyond the basics of memory safety and systems programming with Rust.',
        level: 'Advanced',
        modules: 20,
        duration: '40h',
        xp: 2000,
        progress: 10,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10'
    }
];

import { fetchApi } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function LearningPathsPage() {
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState('all');
    const [showAssessment, setShowAssessment] = useState(false);
    const [assessmentStep, setAssessmentStep] = useState(0);

    const { data: learningPaths, isLoading: pathsLoading } = useQuery({
        queryKey: ['learning-paths'],
        queryFn: () => fetchApi('/learning/paths')
    });

    const { data: userProgress } = useQuery({
        queryKey: ['learning-progress'],
        queryFn: () => fetchApi('/learning/progress')
    });

    const enrollMutation = useMutation({
        mutationFn: (pathId: string) => fetchApi('/learning/enroll', {
            method: 'POST',
            body: JSON.stringify({ path_id: pathId })
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['learning-progress'] });
        }
    });

    const challenges = [
        { title: 'Neural Refactor 2024', duration: '14h 22m', players: 124, type: 'Global Hack' },
        { title: 'Rust Memory Safety', duration: '2d 04h', players: 89, type: 'Speed Run' },
        { title: 'Supabase SQL Injection', duration: 'Expired', players: 452, type: 'Security Audit' },
    ];

    const assessmentQuestions = [
        { q: "How does Neural-S7 handle prompt injections in collaborative enclaves?", options: ["Deterministic Regex", "Semantic Guardrails", "Vector Isolation", "Heuristic Bypass"] },
        { q: "Which memory pattern minimizes GC pressure in real-time collaboration?", options: ["Copy on Write", "Arc Local Mutex", "Pinned Buffer Pools", "Lazy Allocation"] }
    ];

    return (
        <DashboardLayout>
            <div className="flex flex-col xl:flex-row gap-12 max-w-[1600px] mx-auto">
                <div className="flex-1 space-y-12">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                    <Compass className="text-violet-400" size={24} />
                                </div>
                                <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">
                                    Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Expeditions</span>
                                </h1>
                            </div>
                            <p className="text-slate-400 font-medium tracking-tight italic">Chart your course through the digital frontier.</p>
                        </div>

                        <div className="flex items-center p-1 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-xl">
                            {['all', 'web', 'systems', 'ai', 'security'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        filter === t
                                            ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                                            : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Progress Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { label: 'Active Paths', value: userProgress?.filter((p: any) => p.status === 'enrolled')?.length || 0, icon: Rocket, color: 'text-violet-400' },
                            { label: 'Modules Finished', value: `${userProgress?.reduce((acc: number, p: any) => acc + (p.completed_modules || 0), 0) || 0}/55`, icon: CheckCircle2, color: 'text-emerald-400' },
                            { label: 'XP Gathered', value: '3.4k', icon: Zap, color: 'text-amber-400' }, // This would ideally come from the global profile XP
                            { label: 'Global Standing', value: '#128', icon: Trophy, color: 'text-fuchsia-400' }
                        ].map((stat) => (
                            <div key={stat.label} className="p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl space-y-2 group">
                                <div className="flex items-center justify-between mb-4">
                                    <stat.icon className={stat.color} size={20} />
                                    <div className="p-1 rounded bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight size={12} className="text-slate-500" />
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-white italic tracking-tighter">{stat.value}</div>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Paths Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {pathsLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-64 bg-slate-900/40 rounded-[3rem] animate-pulse border border-white/5" />
                            ))
                        ) : (
                            learningPaths?.filter((p: any) => filter === 'all' || p.category === filter).map((path: any) => {
                                const progress = userProgress?.find((up: any) => up.path_id === path.id);
                                const isEnrolled = !!progress;

                                return (
                                    <div
                                        key={path.id}
                                        className="group relative p-8 rounded-[3rem] bg-slate-900/40 border border-white/5 backdrop-blur-3xl hover:border-white/10 transition-all duration-500 overflow-hidden"
                                    >
                                        <div className={cn(
                                            "absolute -right-20 -top-20 w-80 h-80 blur-[100px] opacity-0 group-hover:opacity-10 transition-opacity duration-700 rounded-full bg-violet-500/10"
                                        )} />

                                        <div className="flex items-start justify-between mb-8 relative z-10">
                                            <div className={cn(
                                                "w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-500 bg-violet-500/10"
                                            )}>
                                                <BrainCircuit className="text-violet-400" size={32} />
                                            </div>
                                            {!isEnrolled ? (
                                                <button
                                                    onClick={() => enrollMutation.mutate(path.id)}
                                                    disabled={enrollMutation.isPending}
                                                    className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 bg-violet-600 rounded-xl text-white hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20"
                                                >
                                                    {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Path'}
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setShowAssessment(true)}
                                                    className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-white/5 rounded-full border border-white/5 text-violet-400 hover:bg-violet-500 hover:text-white transition-all"
                                                >
                                                    Certify Now
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-4 relative z-10 mb-8">
                                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r from-white to-slate-500 transition-all">
                                                {path.title}
                                            </h3>
                                            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm">
                                                {path.description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <LayoutGrid size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{path.modules || 10} Modules</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Clock size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{path.duration || '12h'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-amber-500/80">
                                                <Zap size={14} className="fill-amber-500" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">+{path.xp_reward || 500} XP</span>
                                            </div>
                                        </div>

                                        {isEnrolled && (
                                            <div className="space-y-4 relative z-10">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-slate-500 italic">Expedition Progress</span>
                                                    <span className="text-white">{progress.progress_percent || 0}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-1000 bg-violet-400"
                                                        style={{ width: `${progress.progress_percent || 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Sidebar Challenges */}
                <div className="w-full xl:w-96 space-y-8">
                    <div className="glass p-10 rounded-[48px] border border-white/5 bg-white/[0.02]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                <Calendar className="text-fuchsia-400" size={20} /> Upcoming
                            </h3>
                            <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Calendar</button>
                        </div>
                        <div className="space-y-6">
                            {challenges.map((c, i) => (
                                <div key={i} className="p-6 bg-slate-900/50 rounded-3xl border border-white/5 group hover:border-fuchsia-500/30 transition-all cursor-pointer">
                                    <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-[0.2em]">
                                        <span className="text-fuchsia-400">{c.type}</span>
                                        <span className={cn(c.duration === 'Expired' ? "text-red-500" : "text-slate-500")}>
                                            <Timer size={10} className="inline mr-1 mb-0.5" /> {c.duration}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-bold text-white mb-4 group-hover:text-fuchsia-400 transition-colors">{c.title}</h4>
                                    <div className="flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(j => (
                                                <div key={j} className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-950 flex items-center justify-center text-[8px] font-black text-white">U{j}</div>
                                            ))}
                                            <div className="w-6 h-6 rounded-lg bg-white/5 border border-slate-950 flex items-center justify-center text-[8px] font-black text-slate-500">+{c.players - 3}</div>
                                        </div>
                                        <button className="p-2 bg-white/5 rounded-xl text-slate-500 group-hover:text-white transition-colors">
                                            <ArrowUpRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-slate-950/40 border border-white/5 flex flex-col items-center text-center">
                        <Award className="text-amber-400 mb-4" size={40} />
                        <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2">Architect Standing</h4>
                        <div className="text-3xl font-black text-white mb-2 italic tracking-tighter">LVL 24</div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">3.2k XP to next tier</p>
                    </div>
                </div>
            </div>

            {/* Assessment Modal */}
            <AnimatePresence>
                {showAssessment && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                            onClick={() => setShowAssessment(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 40 }}
                            className="w-full max-w-2xl glass p-12 rounded-[56px] border border-white/10 relative z-10 overflow-hidden shadow-2xl"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-transparent opacity-50" />
                            <button onClick={() => setShowAssessment(false)} className="absolute top-8 right-8 p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>

                            <div className="text-center mb-12">
                                <div className="w-12 h-12 bg-violet-600/10 rounded-2xl border border-violet-500/20 flex items-center justify-center mx-auto mb-6">
                                    <Sparkles className="text-violet-400" size={24} />
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Neural Certification</h2>
                                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Question {assessmentStep + 1} of 10</p>
                            </div>

                            <div className="space-y-8 mb-12">
                                <div className="p-8 bg-slate-950/50 rounded-[40px] border border-white/5">
                                    <p className="text-lg font-bold text-white italic leading-relaxed">
                                        {assessmentQuestions[assessmentStep % assessmentQuestions.length].q}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {assessmentQuestions[assessmentStep % assessmentQuestions.length].options.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setAssessmentStep(assessmentStep + 1)}
                                            className="group p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between hover:border-violet-500/50 hover:bg-violet-600/5 transition-all text-left"
                                        >
                                            <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">{opt}</span>
                                            <div className="w-6 h-6 rounded-lg bg-slate-950 border border-white/10 flex items-center justify-center text-[10px] font-black text-slate-600 group-hover:bg-violet-600 group-hover:text-white group-hover:border-violet-500/50 transition-all uppercase">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/5">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="text-amber-500" size={16} />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Manual review may be required for semantic edge cases.</span>
                                </div>
                                <div className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Time Remaining: 08:45</div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
