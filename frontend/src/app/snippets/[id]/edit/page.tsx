'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save,
    Share2,
    Settings,
    ChevronLeft,
    FileCode,
    Brain,
    Layout,
    History,
    Terminal as TerminalIcon,
    Play,
    RotateCcw,
    Sparkles,
    PanelLeftClose,
    PanelRightClose,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    X,
    Activity,
    Check,
    Cloud,
    CloudOff
} from 'lucide-react';
import CodeEditor from '@/components/CodeEditor';
import { cn, fetchApi, formatRelativeTime } from '@/lib/utils';
import { useEditorStore } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useAIStore } from '@/store/aiStore';
import { useQuery } from '@tanstack/react-query';
import { Markdown } from '@/components/Markdown';

export default function SnippetEditPage() {
    const router = useRouter();
    const params = useParams();
    const snippetId = params.id as string;
    const { user } = useAuthStore();
    const {
        currentSnippet,
        updateCode,
        updateTitle,
        updateLanguage,
        panes,
        togglePane,
        setSnippet,
        executionResult,
        setExecutionResult,
        isRunning,
        setIsRunning
    } = useEditorStore();
    const { addToast } = useUIStore();
    const { setLanguage } = useAIStore();

    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'idle'>('idle');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResults, setAnalysisResults] = useState<any>(null);
    const [aiInput, setAiInput] = useState('');
    const [aiResponse, setAiResponse] = useState<{ fullContent: string, code?: string } | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    const [leftWidth, setLeftWidth] = useState(280);
    const [rightWidth, setRightWidth] = useState(320);
    const [bottomHeight, setBottomHeight] = useState(256);
    const [isResizingLeft, setIsResizingLeft] = useState(false);
    const [isResizingRight, setIsResizingRight] = useState(false);
    const [isResizingBottom, setIsResizingBottom] = useState(false);

    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch the snippet to edit
    const { data: fetchedSnippet, isLoading } = useQuery({
        queryKey: ['snippet', snippetId],
        queryFn: () => fetchApi(`/snippets/${snippetId}`),
        enabled: !!snippetId
    });

    // Load snippet into editor on mount
    useEffect(() => {
        if (fetchedSnippet && currentSnippet.id !== snippetId) {
            setSnippet({
                id: fetchedSnippet.id,
                title: fetchedSnippet.title,
                code: fetchedSnippet.code,
                language: fetchedSnippet.language,
                tags: fetchedSnippet.tags || []
            });
            setDescription(fetchedSnippet.description || '');
            setTags(fetchedSnippet.tags?.join(', ') || '');
            setVisibility(fetchedSnippet.visibility || 'public');
            setLanguage(fetchedSnippet.language);
            setSaveStatus('saved');
        }
    }, [fetchedSnippet, snippetId]);

    // Auto-save: 2 second debounce after code changes
    const autoSave = useCallback(async () => {
        if (!snippetId || !user) return;
        setSaveStatus('saving');
        try {
            await fetchApi(`/snippets/${snippetId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    title: currentSnippet.title,
                    code: currentSnippet.code,
                    language: currentSnippet.language,
                    description,
                    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                    visibility
                })
            });
            setLastSaved(new Date());
            setSaveStatus('saved');
        } catch {
            setSaveStatus('unsaved');
        }
    }, [snippetId, currentSnippet, description, tags, visibility, user]);

    // Trigger auto-save on code/title/language changes
    useEffect(() => {
        if (saveStatus === 'idle' || !snippetId) return;
        setSaveStatus('unsaved');

        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => {
            autoSave();
        }, 2000);

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [currentSnippet.code, currentSnippet.title, currentSnippet.language, description]);

    // Resize handlers
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizingLeft) setLeftWidth(Math.max(160, Math.min(480, e.clientX)));
            if (isResizingRight) setRightWidth(Math.max(240, Math.min(600, window.innerWidth - e.clientX)));
            if (isResizingBottom) setBottomHeight(Math.max(120, Math.min(600, window.innerHeight - e.clientY)));
        };
        const handleMouseUp = () => { setIsResizingLeft(false); setIsResizingRight(false); setIsResizingBottom(false); };

        if (isResizingLeft || isResizingRight || isResizingBottom) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = isResizingBottom ? 'row-resize' : 'col-resize';
        } else {
            document.body.style.cursor = 'default';
        }
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }, [isResizingLeft, isResizingRight, isResizingBottom]);

    const handleManualSave = async () => {
        setIsSaving(true);
        setSaveStatus('saving');
        try {
            await fetchApi(`/snippets/${snippetId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    title: currentSnippet.title,
                    code: currentSnippet.code,
                    language: currentSnippet.language,
                    description,
                    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                    visibility
                })
            });
            setLastSaved(new Date());
            setSaveStatus('saved');
            addToast({ title: 'Saved', message: 'Snippet updated successfully', type: 'success' });
        } catch {
            setSaveStatus('unsaved');
            addToast({ title: 'Error', message: 'Failed to save snippet', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRun = async () => {
        setIsRunning(true);
        setExecutionResult('> Compiling and preparing runtime...\n');
        try {
            const result = await fetchApi('/snippets/run', {
                method: 'POST',
                body: JSON.stringify({ code: currentSnippet.code, language: currentSnippet.language })
            });
            setExecutionResult(result.output);
            addToast({ title: result.status === 'success' ? 'Execution Success' : 'Runtime Error', message: result.status === 'success' ? 'Runtime results received' : 'Code exited with errors', type: result.status === 'success' ? 'success' : 'warning' });
        } catch {
            setExecutionResult('> ERROR: Execution environment failed to respond.\n');
            addToast({ title: 'Runtime Error', message: 'Failed to connect to execution engine', type: 'error' });
        } finally {
            setIsRunning(false);
        }
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        try {
            const result = await fetchApi('/ai/analyze', { method: 'POST', body: JSON.stringify({ code: currentSnippet.code, language: currentSnippet.language }) });
            setAnalysisResults(result);
            addToast({ title: 'Analysis Complete', message: 'Intelligence report ready', type: 'success' });
        } catch {
            addToast({ title: 'Analysis Failed', message: 'Failed to scan code', type: 'error' });
        } finally { setIsAnalyzing(false); }
    };

    const handleAIExecute = async (overridePrompt?: string) => {
        const prompt = overridePrompt || aiInput;
        if (!prompt) return;
        setAiInput('');
        try {
            const result = await fetchApi('/ai/pair', {
                method: 'POST',
                body: JSON.stringify({ code: currentSnippet.code, task: prompt, language: currentSnippet.language, personality: 'educational', options: { suggest_improvements: true, explain_changes: true } })
            });
            setAiResponse({ fullContent: result.response || '', code: result.suggested_code || undefined });
            addToast({ title: 'Neural Response', message: 'Companion updated with insights.', type: 'success' });
        } catch {
            addToast({ title: 'AI Error', message: 'Failed to reach neural engine', type: 'error' });
        }
    };

    const fetchHistory = async () => {
        try {
            const data = await fetchApi(`/snippets/${snippetId}/versions`);
            setHistory(data);
            setShowHistory(true);
        } catch {
            addToast({ title: 'History Error', message: 'Failed to fetch version history', type: 'error' });
        }
    };

    const languages = [
        { id: 'typescript', name: 'TypeScript' }, { id: 'javascript', name: 'JavaScript' },
        { id: 'rust', name: 'Rust' }, { id: 'python', name: 'Python' },
        { id: 'go', name: 'Go' }, { id: 'ruby', name: 'Ruby' }
    ];

    if (isLoading) {
        return (
            <div className="h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-pulse text-slate-500 text-sm font-bold uppercase tracking-widest">Loading editor...</div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-slate-950 flex flex-col min-h-0 overflow-hidden text-slate-300 transition-all duration-500">
            {/* Header */}
            <header className="h-14 border-b border-white/5 px-4 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push(`/snippets/${snippetId}`)} className="p-1.5 md:p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-600/20 shrink-0">
                            <FileCode size={14} className="text-white" />
                        </div>
                        <input
                            type="text"
                            value={currentSnippet.title}
                            onChange={(e) => updateTitle(e.target.value)}
                            className="bg-transparent border-none text-[12px] md:text-sm font-bold text-white focus:outline-none placeholder:text-slate-600 w-24 sm:w-48 lg:w-64"
                            placeholder="Untitled Snippet"
                        />
                    </div>
                    {/* Save Status */}
                    <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                        {saveStatus === 'saved' && (
                            <span className="text-emerald-400 flex items-center gap-1"><Cloud size={12} /> Saved {lastSaved ? formatRelativeTime(lastSaved) + ' ago' : ''}</span>
                        )}
                        {saveStatus === 'saving' && (
                            <span className="text-amber-400 flex items-center gap-1 animate-pulse"><Cloud size={12} /> Saving...</span>
                        )}
                        {saveStatus === 'unsaved' && (
                            <span className="text-red-400 flex items-center gap-1"><CloudOff size={12} /> Unsaved</span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/5 rounded-xl">
                        <select
                            value={currentSnippet.language}
                            onChange={(e) => { updateLanguage(e.target.value); setLanguage(e.target.value); }}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-violet-400 outline-none cursor-pointer"
                        >
                            {languages.map(lang => (
                                <option key={lang.id} value={lang.id} className="bg-slate-900 text-white">{lang.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="h-6 w-px bg-white/5 hidden md:block" />
                    <button
                        onClick={handleManualSave}
                        disabled={isSaving || saveStatus === 'saved'}
                        className="px-4 md:px-6 py-2 rounded-xl bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        <Save size={14} />
                        <span className="hidden lg:inline">{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar */}
                <AnimatePresence>
                    {panes.left && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => togglePane('left')} className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" />
                            <motion.aside
                                initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                                style={{ width: leftWidth }}
                                className="fixed md:relative inset-y-0 left-0 z-40 border-r border-white/5 bg-slate-900 md:bg-slate-900/30 flex flex-col shrink-0 min-h-0"
                            >
                                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Properties</span>
                                    <button onClick={() => togglePane('left')} className="text-slate-600 hover:text-white transition-colors"><PanelLeftClose size={14} /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Visibility</label>
                                        <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-violet-500/50">
                                            <option value="public">Public</option>
                                            <option value="private">Private</option>
                                            <option value="unlisted">Unlisted</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Description</label>
                                        <textarea className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-400 resize-none h-24 focus:outline-none focus:border-violet-500/50" placeholder="Add description..." value={description} onChange={(e) => setDescription(e.target.value)} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600">Tags (comma separated)</label>
                                        <input type="text" className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-violet-500/50" placeholder="react, hooks, auth" value={tags} onChange={(e) => setTags(e.target.value)} />
                                    </div>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {panes.left && (
                    <div onMouseDown={() => setIsResizingLeft(true)} className="hidden md:flex relative w-1 items-center justify-center hover:bg-violet-500/50 cursor-col-resize z-50 transition-all group">
                        <div className="w-px h-8 bg-white/20 group-hover:bg-white/40" />
                    </div>
                )}

                {/* Editor Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
                    <main className="flex-1 flex flex-col min-w-0">
                        <div className="h-10 border-b border-white/5 px-4 flex items-center justify-between bg-black/20">
                            <div className="flex gap-4">
                                <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest disabled:opacity-50">
                                    <Play size={12} className={cn("text-emerald-500", isRunning && "animate-pulse")} /> {isRunning ? 'Running...' : 'Run'}
                                </button>
                                <button onClick={handleAnalyze} disabled={isAnalyzing} className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest disabled:opacity-50">
                                    <Brain size={12} className={cn(isAnalyzing ? "text-violet-400 animate-pulse" : "text-violet-500")} /> {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                                </button>
                                <button onClick={fetchHistory} className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest">
                                    <History size={12} /> History
                                </button>
                            </div>
                            <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{currentSnippet.language}</div>
                        </div>
                        <div className="flex-1 relative overflow-hidden bg-black/20">
                            <div className="absolute top-0 left-0 w-12 h-full bg-white/[0.01] pointer-events-none border-r border-white/5 z-20" />
                            <CodeEditor code={currentSnippet.code} language={currentSnippet.language} onChange={(val) => updateCode(val)} className="pl-12" placeholder="// Start writing code..." />
                        </div>
                    </main>

                    {/* Bottom Pane */}
                    {panes.bottom && (
                        <div onMouseDown={() => setIsResizingBottom(true)} className="relative h-1 w-full flex items-center justify-center hover:bg-violet-500/50 cursor-row-resize z-50 transition-all group">
                            <div className="h-px w-8 bg-white/20 group-hover:bg-white/40" />
                        </div>
                    )}
                    <footer className={cn("border-t border-white/5 transition-all duration-300 ease-in-out bg-slate-900", panes.bottom ? "" : "h-10")} style={{ height: panes.bottom ? bottomHeight : 40 }}>
                        {!panes.bottom ? (
                            <div className="h-full flex items-center justify-between px-6 bg-slate-900/50">
                                <button onClick={() => togglePane('bottom')} className="text-[10px] font-black text-slate-500 hover:text-violet-400 transition-colors uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Sparkles size={12} fill="currentColor" /> AI Companion
                                </button>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                <div className="px-6 py-3 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
                                    <span className="text-xs font-black text-white uppercase italic flex items-center gap-2 tracking-widest"><Brain size={16} className="text-violet-400" /> Neural Assistant</span>
                                    <button onClick={() => togglePane('bottom')} className="p-1 hover:bg-white/5 rounded transition-colors"><X size={16} /></button>
                                </div>
                                <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center shrink-0"><Sparkles size={16} className="text-violet-400" /></div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-xs text-white font-bold">Sunder Engine</p>
                                            {aiResponse ? (
                                                <div className="space-y-4">
                                                    <Markdown content={aiResponse.fullContent} className="!text-slate-400" />
                                                    {aiResponse.code && (
                                                        <div className="space-y-2">
                                                            <div className="p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] text-violet-300 overflow-x-auto whitespace-pre">{aiResponse.code}</div>
                                                            <button onClick={() => { updateCode(aiResponse.code!); addToast({ title: 'Injected', message: 'AI code applied to editor', type: 'success' }); }} className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 text-white text-[10px] font-black rounded-lg transition-all uppercase tracking-widest">
                                                                <CheckCircle2 size={12} /> Apply Changes
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-slate-400 leading-relaxed italic">Ask me to optimize your {currentSnippet.language} code.</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                                        {[
                                            { label: 'Optimize', icon: <Activity size={12} />, prompt: 'Optimize this code for performance and readability.' },
                                            { label: 'Debug', icon: <AlertCircle size={12} />, prompt: 'Find potential bugs or edge cases in this code.' },
                                            { label: 'Explain', icon: <MessageSquare size={12} />, prompt: 'Explain how this code works in detail.' },
                                            { label: 'Docs', icon: <FileCode size={12} />, prompt: 'Generate JSDoc style documentation for this code.' }
                                        ].map((action) => (
                                            <button key={action.label} onClick={() => handleAIExecute(action.prompt)} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white hover:bg-violet-500/10 hover:border-violet-500/20 transition-all uppercase tracking-widest text-left">
                                                {action.icon} {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-black/40 border-t border-white/5 flex gap-4 shrink-0">
                                    <input type="text" placeholder="Ask for magic..." className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs focus:outline-none" value={aiInput} onChange={(e) => setAiInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAIExecute()} />
                                    <button onClick={() => handleAIExecute()} className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-violet-550 transition-all shadow-lg shadow-violet-600/20">Execute</button>
                                </div>
                            </div>
                        )}
                    </footer>
                </div>

                {/* Right Sidebar */}
                {panes.right && (
                    <div onMouseDown={() => setIsResizingRight(true)} className="hidden md:flex relative w-1 items-center justify-center hover:bg-blue-500/50 cursor-col-resize z-50 transition-all group">
                        <div className="w-px h-8 bg-white/20 group-hover:bg-white/40" />
                    </div>
                )}
                <AnimatePresence>
                    {panes.right && (
                        <>
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => togglePane('right')} className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm" />
                            <motion.aside
                                initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                                style={{ width: rightWidth }}
                                className="fixed md:relative inset-y-0 right-0 z-40 border-l border-white/5 bg-slate-900 md:bg-slate-900/30 flex flex-col shrink-0 min-h-0"
                            >
                                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic flex items-center gap-2"><Layout size={14} className="text-blue-400" /> Preview</span>
                                    <button onClick={() => togglePane('right')} className="text-slate-600 hover:text-white transition-colors"><PanelRightClose size={14} /></button>
                                </div>
                                <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                                    {analysisResults && (
                                        <div className="space-y-4">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">Neural Intelligence</span>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[
                                                    { label: 'Security', score: analysisResults.score_aggregate?.security || analysisResults.neural_analysis?.security?.score, color: 'text-emerald-400' },
                                                    { label: 'Perf', score: analysisResults.score_aggregate?.performance || analysisResults.neural_analysis?.performance?.score, color: 'text-blue-400' },
                                                    { label: 'Clean', score: analysisResults.score_aggregate?.readability || analysisResults.neural_analysis?.readability?.score, color: 'text-violet-400' }
                                                ].map(s => (
                                                    <div key={s.label} className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                                                        <div className={cn("text-lg font-black", s.color)}>{s.score || 'N/A'}</div>
                                                        <div className="text-[8px] font-black uppercase tracking-widest text-slate-500">{s.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    <div className={cn("flex-1 bg-slate-950 rounded-2xl border flex flex-col items-center justify-center p-8 text-center transition-all duration-500", executionResult ? "border-emerald-500/20 bg-emerald-500/5" : "border-white/5")}>
                                        {executionResult ? (
                                            <div className="space-y-4">
                                                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border border-emerald-500/20"><CheckCircle2 size={32} className="text-emerald-400" /></div>
                                                <div className="space-y-1"><p className="text-xs font-black text-white uppercase tracking-widest">Execution Complete</p></div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4 opacity-50"><Activity size={32} className="text-slate-700 animate-pulse mx-auto" /><p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Standby for compilation</p></div>
                                        )}
                                    </div>
                                    <div className="h-40 bg-slate-950 rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                                        <div className="p-3 bg-black/40 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2"><TerminalIcon size={12} /> Console</div>
                                        <div className="flex-1 p-3 font-mono text-[10px] text-emerald-400/80 overflow-y-auto whitespace-pre-wrap custom-scrollbar">{executionResult || '> Ready...'}</div>
                                    </div>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* History Drawer */}
            <AnimatePresence>
                {showHistory && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="w-96 max-w-full bg-slate-900 border-l border-white/10 relative z-10 flex flex-col shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                                <div className="flex items-center gap-3"><History className="text-violet-400" size={18} /><h3 className="text-sm font-black text-white uppercase tracking-widest italic">Version History</h3></div>
                                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500"><X size={18} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {history.length > 0 ? history.map((version) => (
                                    <div key={version.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all cursor-pointer group" onClick={() => { updateCode(version.code); setShowHistory(false); addToast({ title: 'Restored', message: `v${version.version_number}`, type: 'success' }); }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">v{version.version_number}</span>
                                            <span className="text-[10px] text-slate-500 italic">{formatRelativeTime(version.created_at)}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 line-clamp-2 italic">{version.change_summary || 'Autosave'}</p>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center"><p className="text-sm text-slate-500">No version history yet</p></div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
