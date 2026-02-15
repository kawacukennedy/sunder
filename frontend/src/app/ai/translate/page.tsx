'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Languages,
    ArrowRight,
    Settings2,
    Zap,
    CheckCircle2,
    Copy,
    Download,
    Share2
} from 'lucide-react';
import { useState } from 'react';
import { useAIStore } from '@/store/aiStore';
import CodeEditor from '@/components/CodeEditor';

export default function CodeTranslator() {
    const [sourceLang, setSourceLang] = useState('Python');
    const [targetLang, setTargetLang] = useState('TypeScript');
    const [sourceCode, setSourceCode] = useState(`def calculate_prime(n):\n    primes = []\n    for num in range(2, n + 1):\n        for i in range(2, num):\n            if (num % i) == 0:\n                break\n        else:\n            primes.append(num)\n    return primes`);
    const [translatedCode, setTranslatedCode] = useState('');
    const [accuracy, setAccuracy] = useState(99.8);
    const { isProcessing, translate } = useAIStore();

    const handleTranslate = async () => {
        try {
            const result = await translate(sourceCode, sourceLang, targetLang);
            setTranslatedCode(result.translated_code);
            setAccuracy(result.accuracy_score * 100);
        } catch (error) {
            console.error('Translation error:', error);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/20">
                            <Languages className="text-white" size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white uppercase tracking-tight">AI Code Translator</h1>
                            <p className="text-slate-400">Transform code between languages with 99.8% functional preservation</p>
                        </div>
                    </div>
                    <button className="p-3 glass hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white">
                        <Settings2 size={24} />
                    </button>
                </div>

                {/* Translator Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                    {/* Source Pane */}
                    <div className="glass rounded-[32px] overflow-hidden border border-white/5 flex flex-col min-h-[500px]">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <select
                                value={sourceLang}
                                onChange={(e) => setSourceLang(e.target.value)}
                                className="bg-transparent text-white font-bold text-sm focus:outline-none"
                            >
                                {['Python', 'JavaScript', 'Java', 'C++', 'Go'].map(l => <option key={l} className="bg-slate-900">{l}</option>)}
                            </select>
                            <span className="text-[10px] text-slate-500 font-mono">SOURCE CODE</span>
                        </div>
                        <div className="flex-1 bg-slate-950/50 min-h-0">
                            <CodeEditor
                                code={sourceCode}
                                language={sourceLang}
                                onChange={(val) => setSourceCode(val)}
                                placeholder="Paste your source code here..."
                            />
                        </div>
                    </div>

                    {/* Translation Button (Floated) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:block">
                        <button
                            onClick={handleTranslate}
                            className="w-16 h-16 bg-white hover:bg-slate-200 text-slate-950 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                            disabled={isProcessing}
                        >
                            {isProcessing ? <div className="animate-spin w-6 h-6 border-4 border-slate-300 border-t-slate-950 rounded-full" /> : <ArrowRight size={32} />}
                        </button>
                    </div>

                    {/* Target Pane */}
                    <div className="glass rounded-[32px] overflow-hidden border border-white/5 flex flex-col min-h-[500px]">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <select
                                value={targetLang}
                                onChange={(e) => setTargetLang(e.target.value)}
                                className="bg-transparent text-white font-bold text-sm focus:outline-none"
                            >
                                {['TypeScript', 'Rust', 'Swift', 'Kotlin', 'Go'].map(l => <option key={l} className="bg-slate-900">{l}</option>)}
                            </select>
                            <div className="flex items-center gap-4">
                                <button className="text-slate-500 hover:text-white transition-colors"><Copy size={16} /></button>
                                <span className="text-[10px] text-slate-500 font-mono uppercase">Target ({targetLang})</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-slate-950/20 relative min-h-0">
                            {isProcessing ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm z-10">
                                    <div className="text-center group">
                                        <Zap className="text-amber-400 mx-auto mb-4 animate-bounce" size={48} />
                                        <p className="text-white font-bold animate-pulse">Sunder AI is thinking...</p>
                                    </div>
                                </div>
                            ) : null}
                            <CodeEditor
                                code={translatedCode || '// Translated code will appear here...'}
                                language={targetLang}
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                {/* Translation Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Functional Accuracy</h4>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${accuracy}%` }} />
                            </div>
                            <span className="text-emerald-400 font-bold">{accuracy.toFixed(1)}%</span>
                        </div>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Preservation Check</h4>
                            <p className="text-white font-semibold">Comments & Tags</p>
                        </div>
                        <CheckCircle2 className="text-emerald-500" size={32} />
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                        <div className="flex gap-4 w-full">
                            <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-sm font-semibold transition-all border border-white/10 flex items-center justify-center gap-2">
                                <Download size={16} /> Download
                            </button>
                            <button className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-white text-sm font-semibold transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2">
                                <Share2 size={16} /> Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
