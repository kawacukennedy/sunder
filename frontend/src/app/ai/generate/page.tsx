'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Sparkles,
    Code2,
    Zap,
    Copy,
    Save,
    RotateCcw,
    Layout,
    Box,
    ChevronDown,
    Cpu,
    ArrowRight,
    Terminal
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAIStore } from '@/store/aiStore';
import CodeEditor from '@/components/CodeEditor';

export default function AICodeGenerator() {
    const [prompt, setPrompt] = useState('');
    const [language, setLanguage] = useState('TypeScript');
    const [framework, setFramework] = useState('Next.js');
    const [generatedCode, setGeneratedCode] = useState('');
    const { isProcessing, generateCode } = useAIStore();

    const handleGenerate = async () => {
        if (!prompt.trim() || isProcessing) return;
        try {
            const result = await generateCode(prompt, language, framework);
            setGeneratedCode(result.code);
        } catch (error) {
            console.error('Generation failed:', error);
        }
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-8 h-[calc(100vh-160px)]">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/20">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white uppercase tracking-tight italic">AI Architect</h1>
                            <p className="text-slate-400 font-medium">Generate production-ready modules with Gemini 1.5 Pro</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-slate-900 border border-white/5 px-4 py-2 rounded-xl">
                            <Cpu size={14} className="text-violet-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GEMINI_v1.5_PRO</span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex gap-8 min-h-0">
                    {/* Input Pane */}
                    <div className="w-[450px] flex flex-col gap-6">
                        <div className="glass p-8 rounded-[40px] border border-white/5 flex flex-col gap-8 bg-white/[0.02]">
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Architectural Prompt</label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe the component or utility you need... (e.g., 'A performant useDebounce hook with TypeScript support')"
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-3xl p-6 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/50 transition-all resize-none min-h-[200px] custom-scrollbar placeholder-slate-700"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Language</label>
                                        <div className="relative group">
                                            <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                            <select
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                                className="w-full pl-11 pr-10 py-3 bg-slate-950/50 border border-white/5 rounded-2xl text-xs text-white font-bold focus:outline-none appearance-none cursor-pointer"
                                            >
                                                {['TypeScript', 'JavaScript', 'Rust', 'Python', 'Go'].map(l => <option key={l} className="bg-slate-900">{l}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Framework</label>
                                        <div className="relative group">
                                            <Box className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                            <select
                                                value={framework}
                                                onChange={(e) => setFramework(e.target.value)}
                                                className="w-full pl-11 pr-10 py-3 bg-slate-950/50 border border-white/5 rounded-2xl text-xs text-white font-bold focus:outline-none appearance-none cursor-pointer"
                                            >
                                                {['Next.js', 'React', 'Node.js', 'Axum', 'Standard'].map(f => <option key={f} className="bg-slate-900">{f}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" size={14} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={isProcessing || !prompt.trim()}
                                className="w-full py-5 bg-white text-slate-950 font-black rounded-3xl hover:bg-slate-200 transition-all shadow-xl shadow-white/10 uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                                ) : (
                                    <>Construct Code <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>
                        </div>

                        <div className="glass p-6 rounded-[32px] border border-white/5 bg-violet-600/5 mt-auto">
                            <h4 className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Zap size={12} className="fill-current" /> Design Tokens
                            </h4>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-500 font-bold uppercase">Optimization</span>
                                    <span className="text-emerald-400 font-black uppercase">ULTRA</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="text-slate-500 font-bold uppercase">Safety Scanned</span>
                                    <span className="text-white font-black uppercase">YES</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Output Pane */}
                    <div className="flex-1 glass rounded-[48px] border border-white/5 overflow-hidden flex flex-col bg-black/40 shadow-2xl">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                                </div>
                                <div className="h-4 w-px bg-white/10" />
                                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">MANIFEST: {language.toUpperCase()} • {framework.toUpperCase()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"><RotateCcw size={18} /></button>
                                <button className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"><Copy size={18} /></button>
                                <button className="px-5 py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-[10px] font-black rounded-xl border border-emerald-500/20 transition-all uppercase tracking-widest flex items-center gap-2">
                                    <Save size={14} /> Save Snippet
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 relative overflow-hidden group">
                            {isProcessing ? (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
                                    <div className="relative">
                                        <div className="w-24 h-24 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
                                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-violet-400 animate-pulse" size={32} />
                                    </div>
                                    <p className="mt-8 text-sm font-black text-white uppercase tracking-[0.3em] animate-pulse">Assembling Bytecode</p>
                                </div>
                            ) : null}

                            {!generatedCode && !isProcessing ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-20 opacity-40">
                                    <Terminal size={64} className="text-slate-700 mb-6" />
                                    <h3 className="text-xl font-black text-slate-600 uppercase tracking-tight">Vortex Idle</h3>
                                    <p className="text-sm text-slate-600 font-medium max-w-xs mt-2">Submit architectural parameters to begin materialization</p>
                                </div>
                            ) : (
                                <CodeEditor
                                    code={generatedCode}
                                    language={language}
                                    readOnly
                                />
                            )}
                        </div>

                        {/* Status Bar */}
                        <div className="px-8 py-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Link Synchronized</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Latency: 24ms</span>
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Tokens: 1,402 / 32k</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
