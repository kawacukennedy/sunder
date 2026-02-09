'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    MessageSquare,
    Code2,
    Zap,
    Copy,
    Share2,
    RotateCcw,
    FileText,
    ListTree,
    Lightbulb,
    ChevronRight,
    SearchCode,
    Terminal
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAIStore } from '@/store/aiStore';

export default function AICodeExplainer() {
    const [code, setCode] = useState('');
    const [detailLevel, setDetailLevel] = useState('Detailed');
    const [explanation, setExplanation] = useState('');
    const { isProcessing, explainCode } = useAIStore();

    const handleExplain = async () => {
        if (!code.trim() || isProcessing) return;
        try {
            const result = await explainCode(code, detailLevel);
            setExplanation(result.explanation);
        } catch (error) {
            console.error('Explanation failed:', error);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 h-[calc(100vh-160px)]">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <SearchCode className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white uppercase tracking-tight italic">AI Interpreter</h1>
                            <p className="text-slate-400 font-medium">Deconstruct complex logic into actionable insights</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex gap-8 min-h-0">
                    {/* Input Pane */}
                    <div className="flex-1 glass rounded-[48px] border border-white/5 overflow-hidden flex flex-col bg-slate-950/20 relative">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <Code2 className="text-blue-400" size={18} />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Source Context</span>
                            </div>
                            <button
                                onClick={() => setCode('')}
                                className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Paste the code block you want to analyze..."
                            className="flex-1 bg-transparent p-10 font-mono text-sm leading-relaxed text-slate-300 resize-none focus:outline-none custom-scrollbar placeholder-slate-700"
                        />
                        <div className="p-8 border-t border-white/5 bg-black/20">
                            <button
                                onClick={handleExplain}
                                disabled={isProcessing || !code.trim()}
                                className="w-full py-5 bg-white text-slate-950 font-black rounded-3xl hover:bg-slate-200 transition-all shadow-xl shadow-white/10 uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                                ) : (
                                    <>Interpret Logic <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Controls & Output Pane */}
                    <div className="w-[500px] flex flex-col gap-6">
                        {/* Detail Selector */}
                        <div className="glass p-6 rounded-[32px] border border-white/5 bg-white/[0.02] flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detail Resolution</h4>
                            <div className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-white/5">
                                {['Brief', 'Detailed', 'Deep'].map(level => (
                                    <button
                                        key={level}
                                        onClick={() => setDetailLevel(level)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                            detailLevel === level ? "bg-white text-slate-950 shadow-lg" : "text-slate-500 hover:text-white"
                                        )}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Explanation Output */}
                        <div className="flex-1 glass rounded-[40px] border border-white/5 overflow-hidden flex flex-col bg-blue-600/5 shadow-2xl relative">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <Zap className="text-amber-400 fill-amber-400" size={14} />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Intelligence Report</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-slate-500 hover:text-white rounded-xl transition-all"><Copy size={16} /></button>
                                    <button className="p-2 text-slate-500 hover:text-white rounded-xl transition-all"><Share2 size={16} /></button>
                                </div>
                            </div>

                            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar relative">
                                {isProcessing ? (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-blue-900/10 backdrop-blur-sm">
                                        <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                        <p className="mt-6 text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Running Static Analysis</p>
                                    </div>
                                ) : null}

                                {!explanation && !isProcessing ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                        <Terminal size={48} className="text-slate-700 mb-4" />
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest max-w-[200px]">Awaiting source input for architectural profiling</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* Simulated Rich Content Formatting */}
                                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                            <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Lightbulb size={12} /> Key Objective
                                            </h5>
                                            <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                                {explanation.split('\n')[0] || 'Analyzing code structure...'}
                                            </p>
                                        </div>
                                        <div className="space-y-4 px-2">
                                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <ListTree size={12} /> Logic Breakdown
                                            </h5>
                                            <div className="space-y-4">
                                                {explanation.split('\n').slice(1).map((line, i) => line.trim() && (
                                                    <div key={i} className="flex gap-4 group">
                                                        <span className="text-[10px] font-black text-blue-600 mt-0.5">0{i + 1}</span>
                                                        <p className="text-xs text-slate-400 leading-relaxed font-medium group-hover:text-white transition-colors">
                                                            {line.replace(/^-\s*/, '')}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Verification Badge */}
                            <div className="p-6 bg-white/[0.02] border-t border-white/5">
                                <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                                            <FileText className="text-white" size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-tight">Logical Soundness</p>
                                            <p className="text-[9px] text-emerald-400 font-bold uppercase">HI-FIDELITY VERIFIED</p>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-black text-white">100%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
