'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Cpu,
    Terminal,
    Sparkles,
    Zap,
    MessageSquare,
    Play,
    Save,
    Share2,
    Settings,
    Maximize2,
    History,
    FileCode,
    BrainCircuit,
    ChevronRight,
    Search,
    Code2,
    Command,
    Workflow,
    Layers,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function AIPairPage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [personality, setPersonality] = useState<'helpful' | 'critical' | 'concise'>('helpful');

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-12rem)] flex flex-col gap-6 max-w-[100rem] mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                            <BrainCircuit className="text-violet-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">
                                Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Pair Workspace</span>
                            </h1>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    AI Online
                                </span>
                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Personalized to: Alex Rivera</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center p-1 bg-slate-900/50 border border-white/5 rounded-2xl">
                            {['helpful', 'critical', 'concise'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPersonality(p as any)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        personality === p
                                            ? "bg-violet-600 text-white shadow-lg"
                                            : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        <div className="h-8 w-px bg-white/5 mx-2" />
                        <button className="p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                            <History size={18} />
                        </button>
                        <button className="p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                            <Settings size={18} />
                        </button>
                        <button className="px-6 py-3 rounded-2xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-violet-500/20 flex items-center gap-2">
                            <Play size={16} fill="white" />
                            Run Context
                        </button>
                    </div>
                </div>

                {/* Main Workspace Grid */}
                <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
                    {/* Left Sidebar: Context & Files */}
                    <div className="col-span-2 flex flex-col gap-4 overflow-hidden">
                        <div className="flex-1 p-6 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl flex flex-col gap-6">
                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Knowledge Base</h3>
                            <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                                {[
                                    { name: 'Auth Flow', icon: FileCode, type: 'active' },
                                    { name: 'DB Schema', icon: Layers, type: 'context' },
                                    { name: 'API Routes', icon: Workflow, type: 'context' },
                                    { name: 'Frontend Kit', icon: Code2, type: 'context' }
                                ].map((file) => (
                                    <button
                                        key={file.name}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group",
                                            file.type === 'active'
                                                ? "bg-violet-500/10 border border-violet-500/20 text-white"
                                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                        )}
                                    >
                                        <file.icon size={16} className={file.type === 'active' ? 'text-violet-400' : 'text-slate-600'} />
                                        {file.name}
                                        {file.type === 'active' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/20 backdrop-blur-xl space-y-3">
                            <div className="flex items-center gap-2 text-indigo-400">
                                <Zap size={16} fill="currentColor" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Inference Boost</span>
                            </div>
                            <p className="text-[9px] text-indigo-200/50 font-bold uppercase tracking-widest leading-relaxed">Context window expanded to 128k tokens.</p>
                        </div>
                    </div>

                    {/* Middle: Code Editor Placeholder */}
                    <div className="col-span-7 flex flex-col gap-6 overflow-hidden">
                        <div className="flex-1 p-8 rounded-[3rem] bg-slate-900/60 border border-white/5 backdrop-blur-3xl relative group overflow-hidden">
                            {/* Editor Ambient Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                            <div className="relative z-10 h-full flex flex-col">
                                <div className="flex items-center gap-2 text-slate-500 mb-6">
                                    <FileCode size={18} />
                                    <span className="text-xs font-mono">src/lib/neural_engine.rs</span>
                                </div>

                                <div className="flex-1 font-mono text-sm space-y-2 opacity-80 select-none">
                                    <div className="flex gap-4"><span className="text-slate-700 w-8 text-right">01</span><span className="text-violet-400">use</span> neural::optimizer::*;</div>
                                    <div className="flex gap-4"><span className="text-slate-700 w-8 text-right">02</span></div>
                                    <div className="flex gap-4"><span className="text-slate-700 w-8 text-right">03</span><span className="text-violet-400">pub struct</span> <span className="text-emerald-400">NeuralEngine</span> {'{'}</div>
                                    <div className="flex gap-4"><span className="text-slate-700 w-8 text-right">04</span>    <span className="text-cyan-400">context_window:</span> <span className="text-amber-400">usize</span>,</div>
                                    <div className="flex gap-4"><span className="text-slate-700 w-8 text-right">05</span>    <span className="text-cyan-400">learning_rate:</span> <span className="text-amber-400">f64</span>,</div>
                                    <div className="flex gap-4"><span className="text-slate-700 w-8 text-right">06</span>{'}'}</div>
                                    <div className="flex gap-4"><span className="text-slate-700 w-8 text-right">07</span></div>
                                    <div className="flex gap-4 bg-violet-500/10 border-y border-violet-500/20 -mx-8 px-8 py-1">
                                        <span className="text-violet-500 w-8 text-right">08</span>
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={14} className="text-violet-400" />
                                            <span className="text-violet-300 italic">AI is suggesting an implementation for the trait...</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                        <div className="flex items-center gap-1.5"><Activity size={12} /> Syncing</div>
                                        <div className="flex items-center gap-1.5"><Command size={12} /> Shortcuts</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Reject (Esc)</button>
                                        <button className="px-6 py-2 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:scale-105 transition-all">Accept (Tab)</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Neural Chat Interface */}
                    <div className="col-span-3 flex flex-col gap-6 overflow-hidden">
                        <div className="flex-1 p-6 rounded-[3rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl flex flex-col overflow-hidden relative group">
                            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">
                                <div className="space-y-2">
                                    <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 border border-white/10 text-slate-300 text-xs font-medium leading-relaxed">
                                        I've analyzed your current <strong>NeuralEngine</strong> struct. Would you like me to implement the
                                        <em>ForwardProp</em> trait or optimize the memory layout first?
                                    </div>
                                    <span className="text-[8px] font-black text-violet-400 uppercase tracking-widest italic ml-1">AI Suggestion</span>
                                </div>
                            </div>

                            <div className="mt-auto space-y-4">
                                <div className="relative">
                                    <textarea
                                        placeholder="Command the Void..."
                                        rows={3}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none pr-12"
                                    />
                                    <button className="absolute right-3 bottom-3 p-2 rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/30 hover:scale-110 transition-transform">
                                        <ArrowUpRight size={16} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['Refactor', 'Document', 'Test'].map(tag => (
                                        <button key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white hover:border-white/20 transition-all">
                                            /{tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                    <Zap size={16} fill="currentColor" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Low Latency</p>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Edge-Optimized</p>
                                </div>
                            </div>
                            <Maximize2 size={16} className="text-slate-700 group-hover:text-white transition-colors cursor-pointer" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
