'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Save,
    Share2,
    Settings,
    ChevronLeft,
    ChevronRight,
    FileCode,
    Brain,
    Layout,
    History,
    Terminal as TerminalIcon,
    Play,
    RotateCcw,
    Sparkles,
    Columns,
    PanelLeftClose,
    PanelRightClose,
    PanelBottomClose,
    Maximize2,
    MessageSquare,
    AlertCircle,
    CheckCircle2,
    X
} from 'lucide-react';
import { cn, fetchApi } from '@/lib/utils';
import { useEditorStore } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function SnippetEditor() {
    const router = useRouter();
    const { user } = useAuthStore();
    const {
        currentSnippet,
        updateCode,
        updateTitle,
        updateLanguage,
        panes,
        togglePane,
        resetEditor
    } = useEditorStore();
    const { addToast } = useUIStore();

    const [isSaving, setIsSaving] = useState(false);
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [aiInput, setAiInput] = useState('');

    const handleSave = async () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        setIsSaving(true);
        try {
            const data = await fetchApi('/snippets', {
                method: 'POST',
                body: JSON.stringify({
                    ...currentSnippet,
                    description,
                    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                    visibility: 'public'
                })
            });
            addToast({ title: "Success", message: "Snippet saved to cloud", type: "success" });
            router.push(`/snippets/${data.id}`);
        } catch (error) {
            addToast({ title: "Error", message: "Failed to save snippet", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-screen bg-slate-950 flex flex-col overflow-hidden text-slate-300 transition-all duration-500">
            {/* Header: TitleInput, SaveStatus, ActionButtons */}
            <header className="h-14 border-b border-white/5 px-4 flex items-center justify-between bg-slate-900/50 backdrop-blur-xl z-50">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
                            <FileCode size={16} className="text-white" />
                        </div>
                        <input
                            type="text"
                            value={currentSnippet.title}
                            onChange={(e) => updateTitle(e.target.value)}
                            className="bg-transparent text-white font-bold text-sm focus:outline-none w-64 border-b border-transparent focus:border-violet-500/50 transition-all placeholder:text-slate-600"
                            placeholder="Enter snippet title..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold border border-emerald-500/20 uppercase tracking-widest">
                        <CheckCircle2 size={12} /> Auto-saved
                    </div>
                    <div className="h-4 w-px bg-white/10 mx-2" />
                    <button className="p-2 text-slate-500 hover:text-white transition-colors"><Settings size={18} /></button>
                    <button className="p-2 text-slate-500 hover:text-white transition-colors" title="Toggle Layout"><Columns size={18} /></button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="ml-2 px-4 py-1.5 bg-violet-600 hover:bg-violet-550 text-white text-xs font-black rounded-lg transition-all shadow-lg shadow-violet-600/20 flex items-center gap-2 uppercase tracking-widest disabled:opacity-50"
                    >
                        {isSaving ? <RotateCcw size={14} className="animate-spin" /> : <Save size={14} />}
                        {isSaving ? 'Saving' : 'Save'}
                    </button>
                </div>
            </header>

            {/* Workspace: Four-pane Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Pane: FileTree & Properties */}
                {panes.left && (
                    <aside className="w-64 border-r border-white/5 bg-slate-900/30 flex flex-col shrink-0 animate-in slide-in-from-left duration-300">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Explorer</span>
                            <button onClick={() => togglePane('left')} className="text-slate-600 hover:text-white transition-colors">
                                <PanelLeftClose size={14} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-violet-400 font-bold bg-violet-500/5 p-2 rounded-lg border border-violet-500/10 cursor-pointer">
                                    <FileCode size={14} /> main.{currentSnippet.language.toLowerCase()}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
                                    <FileCode size={14} /> config.json
                                </div>
                            </div>
                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Properties</span>
                                <div className="space-y-3">
                                    <select
                                        value={currentSnippet.language}
                                        onChange={(e) => updateLanguage(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-violet-500/50"
                                    >
                                        {['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Ruby', 'Java'].map(l => (
                                            <option key={l} value={l} className="bg-slate-900">{l}</option>
                                        ))}
                                    </select>
                                    <textarea
                                        className="w-full bg-slate-950 border border-white/5 rounded-lg px-3 py-2 text-xs text-slate-400 resize-none h-24 focus:outline-none focus:border-violet-500/50"
                                        placeholder="Add description..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </aside>
                )}

                {/* Center & Right Pannels */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex-1 flex min-h-0">
                        {/* Center Pane: Editor */}
                        <main className="flex-1 flex flex-col bg-slate-950 min-w-0">
                            <div className="h-10 border-b border-white/5 px-4 flex items-center justify-between bg-black/20">
                                <div className="flex gap-4">
                                    <button className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest">
                                        <Play size={12} className="text-emerald-500" /> Run
                                    </button>
                                    <button className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-widest">
                                        <History size={12} /> History
                                    </button>
                                </div>
                                <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                                    L1, C1 • {currentSnippet.language}
                                </div>
                            </div>
                            <div className="flex-1 relative overflow-hidden group">
                                <textarea
                                    className="absolute inset-0 w-full h-full bg-transparent p-6 font-mono text-sm leading-relaxed text-slate-300 resize-none focus:outline-none selection:bg-violet-500/20"
                                    value={currentSnippet.code}
                                    onChange={(e) => updateCode(e.target.value)}
                                    spellCheck={false}
                                />
                                <div className="absolute top-0 left-0 w-12 h-full bg-white/[0.01] pointer-events-none border-r border-white/5" />
                            </div>
                        </main>

                        {/* Right Pane: Live Preview */}
                        {panes.right && (
                            <aside className="w-80 border-l border-white/5 bg-slate-900/30 flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
                                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic flex items-center gap-2">
                                        <Layout size={14} className="text-blue-400" /> Preview
                                    </span>
                                    <button onClick={() => togglePane('right')} className="text-slate-600 hover:text-white transition-colors">
                                        <PanelRightClose size={14} />
                                    </button>
                                </div>
                                <div className="flex-1 p-6 flex flex-col gap-6">
                                    <div className="flex-1 bg-slate-950 rounded-2xl border border-white/5 flex items-center justify-center p-8 text-center">
                                        <div className="space-y-4">
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center">
                                                <Activity size={32} className="text-slate-700" />
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Compiler ready</p>
                                        </div>
                                    </div>
                                    <div className="h-40 bg-slate-950 rounded-2xl border border-white/5 flex flex-col overflow-hidden">
                                        <div className="p-3 bg-black/40 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                            <TerminalIcon size={12} /> Console
                                        </div>
                                        <div className="flex-1 p-3 font-mono text-[10px] text-emerald-400/70">
                                            &gt; Process started
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        )}
                    </div>

                    {/* Bottom Pane: AI Assistant & Problems */}
                    <footer className={cn(
                        "border-t border-white/5 transition-all duration-300 ease-in-out",
                        panes.bottom ? "h-64" : "h-10"
                    )}>
                        {!panes.bottom ? (
                            <div className="h-full flex items-center justify-between px-6 bg-slate-900/50">
                                <div className="flex gap-6">
                                    <button onClick={() => togglePane('bottom')} className="text-[10px] font-black text-slate-500 hover:text-violet-400 transition-colors uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Sparkles size={12} fill="currentColor" /> AI Companion
                                    </button>
                                    <button className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em] flex items-center gap-2">
                                        <AlertCircle size={12} /> 0 Problems
                                    </button>
                                </div>
                                <button className="text-slate-600 hover:text-white transition-colors">
                                    <Maximize2 size={14} />
                                </button>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col bg-slate-900">
                                <div className="px-6 py-3 border-b border-white/5 flex justify-between items-center bg-black/20">
                                    <span className="text-xs font-black text-white uppercase italic flex items-center gap-2 tracking-widest">
                                        <Brain size={16} className="text-violet-400" /> Neural Assistant
                                    </span>
                                    <button onClick={() => togglePane('bottom')} className="p-1 hover:bg-white/5 rounded transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="flex-1 flex">
                                    <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
                                        <div className="flex gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-violet-600/10 flex items-center justify-center shrink-0">
                                                <Sparkles size={16} className="text-violet-400" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-white font-bold">Sunder Engine</p>
                                                <p className="text-xs text-slate-400 leading-relaxed italic max-w-2xl">
                                                    I'm monitoring your code. You can ask me to optimize functions, write unit tests, or transform this {currentSnippet.language} code to another language.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-80 border-l border-white/5 p-4 flex flex-col gap-3 shrink-0 bg-black/10">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quick Actions</span>
                                        <button className="text-[10px] font-bold text-left px-3 py-2 bg-white/5 rounded-lg border border-white/5 hover:border-violet-500/30 transition-all uppercase tracking-widest">Optimize Speed</button>
                                        <button className="text-[10px] font-bold text-left px-3 py-2 bg-white/5 rounded-lg border border-white/5 hover:border-violet-500/30 transition-all uppercase tracking-widest">Generate Docs</button>
                                        <button className="text-[10px] font-bold text-left px-3 py-2 bg-white/5 rounded-lg border border-white/5 hover:border-emerald-500/30 transition-all uppercase tracking-widest">Add Tests</button>
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-black/40 border-t border-white/5 flex gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            placeholder="Ask the neural assistant..."
                                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-violet-500/50"
                                            value={aiInput}
                                            onChange={(e) => setAiInput(e.target.value)}
                                        />
                                        <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700" size={14} />
                                    </div>
                                    <button className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-violet-550 transition-all">
                                        Execute
                                    </button>
                                </div>
                            </div>
                        )}
                    </footer>
                </div>
            </div>

            {/* Float Toolbar Overlay */}
            <div className="fixed bottom-16 right-8 flex flex-col gap-3">
                <button
                    onClick={() => togglePane('left')}
                    className={cn("w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center transition-all hover:scale-110", panes.left ? "text-violet-400" : "text-slate-600")}
                >
                    <PanelLeftClose size={20} />
                </button>
                <button
                    onClick={() => togglePane('right')}
                    className={cn("w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center transition-all hover:scale-110", panes.right ? "text-violet-400" : "text-slate-600")}
                >
                    <PanelRightClose size={20} />
                </button>
            </div>
        </div>
    );
}
