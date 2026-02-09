'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Trophy,
    Target,
    Zap,
    Users,
    Star,
    Award,
    Flame,
    Lock,
    Unlock,
    ChevronRight,
    ArrowUpRight,
    ShieldCheck,
    Cpu,
    Sparkles,
    LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const badges = [
    {
        id: 1,
        name: 'The Architect',
        description: 'Create 100 snippets across 5 different languages',
        status: 'unlocked',
        tier: 'Gold',
        icon: Trophy,
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        progress: 100
    },
    {
        id: 2,
        name: 'Void Voyager',
        description: 'Complete 20 real-time collaboration sessions',
        status: 'unlocked',
        tier: 'Platinum',
        icon: Users,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
        progress: 100
    },
    {
        id: 3,
        name: 'Neural Ninja',
        description: 'Use AI to refactor 50 unique code modules',
        status: 'in_progress',
        tier: 'Silver',
        icon: Sparkles,
        color: 'text-violet-400',
        bgColor: 'bg-violet-500/10',
        progress: 74
    },
    {
        id: 4,
        name: 'Security Shield',
        description: 'Pass 5 consecutive security scans without warnings',
        status: 'locked',
        tier: 'Diamond',
        icon: ShieldCheck,
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        progress: 20
    },
    {
        id: 5,
        name: 'Forge Master',
        description: 'Maintain a 14-day coding streak',
        status: 'unlocked',
        tier: 'Bronze',
        icon: Flame,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
        progress: 100
    },
    {
        id: 6,
        name: 'Translation Titan',
        description: 'Translate code with over 99% accuracy across 3 frameworks',
        status: 'locked',
        tier: 'Gold',
        icon: Zap,
        color: 'text-fuchsia-400',
        bgColor: 'bg-fuchsia-500/10',
        progress: 45
    }
];

export default function AchievementsPage() {
    const [filter, setFilter] = useState('all');

    return (
        <DashboardLayout>
            <div className="space-y-12 max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="relative p-10 rounded-[3rem] bg-slate-900/40 border border-white/5 backdrop-blur-3xl overflow-hidden group">
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-violet-600/20 blur-[100px] rounded-full group-hover:bg-violet-600/30 transition-colors duration-700" />
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-fuchsia-600/10 blur-[100px] rounded-full group-hover:bg-fuchsia-600/20 transition-colors duration-700" />

                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                        <div className="space-y-6 text-center md:text-left">
                            <div>
                                <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                        <Award className="text-amber-400" size={24} />
                                    </div>
                                    <h1 className="text-4xl font-black text-white uppercase tracking-tight italic">
                                        Honor <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Hall</span>
                                    </h1>
                                </div>
                                <p className="text-slate-400 font-medium max-w-sm">Every line of code is a step toward perfection. Track your evolution as a developer.</p>
                            </div>

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <div className="text-center px-6 py-3 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="text-3xl font-black text-white italic tracking-tighter">2,450</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">XP Points</div>
                                </div>
                                <div className="text-center px-6 py-3 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="text-3xl font-black text-white italic tracking-tighter">12</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Badges</div>
                                </div>
                                <div className="text-center px-6 py-3 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="text-3xl font-black text-white italic tracking-tighter">#42</div>
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Global Rank</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="relative w-48 h-48">
                                <div className="absolute inset-0 rounded-full border-[10px] border-white/5" />
                                <div
                                    className="absolute inset-0 rounded-full border-[10px] border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all duration-1000"
                                    style={{ clipPath: 'polygon(50% 50%, -50% -50%, 150% -50%, 150% 150%, -50% 150%, -50% 50%)', transform: 'rotate(120deg)' }}
                                />
                                <div className="absolute inset-4 rounded-full bg-slate-800 flex flex-col items-center justify-center border border-white/10">
                                    <Trophy size={48} className="text-amber-400 mb-1" />
                                    <span className="text-xs font-black text-white uppercase tracking-widest">Level 24</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badges Grid */}
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="flex items-center p-1 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-xl">
                            {['all', 'unlocked', 'locked', 'in progress'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        filter === t
                                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                                            : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                            <LayoutGrid size={16} />
                            <span>Sorted by Rarity</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {badges.map((badge) => (
                            <div
                                key={badge.id}
                                className={cn(
                                    "group relative p-6 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl transition-all duration-500 overflow-hidden",
                                    badge.status === 'locked' ? 'opacity-50 hover:opacity-100' : 'hover:border-white/20 hover:-translate-y-1'
                                )}
                            >
                                {/* Background Ambient Light */}
                                <div className={cn(
                                    "absolute -right-10 -bottom-10 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-30 transition-opacity duration-500",
                                    badge.bgColor.replace('bg-', 'bg-')
                                )} />

                                <div className="flex items-start justify-between mb-6">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 shadow-lg relative group-hover:scale-110 transition-transform duration-500",
                                        badge.bgColor
                                    )}>
                                        <badge.icon className={badge.color} size={28} />
                                        {badge.status === 'unlocked' && (
                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-lg">
                                                <Unlock size={10} className="text-white" />
                                            </div>
                                        )}
                                        {badge.status === 'locked' && (
                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center border-2 border-[#0f172a] shadow-lg">
                                                <Lock size={10} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border",
                                            badge.tier === 'Platinum' ? 'text-cyan-400 border-cyan-500/30' :
                                                badge.tier === 'Gold' ? 'text-amber-400 border-amber-500/30' :
                                                    badge.tier === 'Diamond' ? 'text-emerald-400 border-emerald-500/30' :
                                                        'text-slate-400 border-white/10'
                                        )}>
                                            {badge.tier}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2 italic tracking-tight uppercase">{badge.name}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">{badge.description}</p>

                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-500">{badge.status === 'unlocked' ? 'COMPLETED' : 'PROGRESS'}</span>
                                        <span className="text-white">{badge.progress}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000", badge.color.replace('text-', 'bg-'))}
                                            style={{ width: `${badge.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-white/10 text-center space-y-4">
                    <p className="text-slate-300 font-medium italic text-lg">"The best way to predict the future is to invent it."</p>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">YOU'VE SURPASSED 84% OF THE COLLECTIVE</p>
                    <button className="px-8 py-3 rounded-2xl bg-white text-slate-900 text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl shadow-white/10">
                        View Global Leaderboard
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
}
