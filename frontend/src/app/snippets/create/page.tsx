'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save,
    Share2,
    Settings,
    ChevronLeft,
    FileCode,
    Brain,
    Terminal,
    Play,
    RotateCcw,
    Sparkles,
    Columns,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Send,
    Zap,
    Bug,
    FileText,
    BookOpen,
    Maximize2,
    Minimize2,
    Keyboard
} from 'lucide-react';
import { cn, fetchApi } from '@/lib/utils';
import { useEditorStore } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { Markdown } from '@/components/Markdown';

const LANGUAGES = [
    { id: 'javascript', name: 'JavaScript', version: '18.15.0', piston: 'javascript' },
    { id: 'typescript', name: 'TypeScript', version: '5.0.3', piston: 'typescript' },
    { id: 'python', name: 'Python', version: '3.10.0', piston: 'python' },
    { id: 'rust', name: 'Rust', version: '1.68.2', piston: 'rust' },
    { id: 'go', name: 'Go', version: '1.16.2', piston: 'go' },
    { id: 'java', name: 'Java', version: '15.0.2', piston: 'java' },
    { id: 'c', name: 'C', version: '10.2.0', piston: 'c' },
    { id: 'cpp', name: 'C++', version: '10.2.0', piston: 'cpp' },
];

const QUICK_ACTIONS = [
    { id: 'optimize', label: 'Optimize', icon: Zap, prompt: 'Optimize this code for better performance and readability.' },
    { id: 'debug', label: 'Debug', icon: Bug, prompt: 'Find and fix potential bugs in this code.' },
    { id: 'explain', label: 'Explain', icon: BookOpen, prompt: 'Explain how this code works in detail.' },
    { id: 'docs', label: 'Docs', icon: FileText, prompt: 'Generate documentation for this code.' },
];

export default function SnippetEditor() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { addToast } = useUIStore();
    const {
        currentSnippet,
        updateCode,
        updateTitle,
        updateLanguage,
        resetEditor,
        setSnippet,
        setExecutionResult,
        isRunning,
        setIsRunning
    } = useEditorStore();

    const [code, setCode] = useState(currentSnippet.code || '');
    const [language, setLanguage] = useState(currentSnippet.language || 'javascript');
    const [title, setTitle] = useState(currentSnippet.title || 'Untitled');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isAIResponding, setIsAIResponding] = useState(false);
    const [executionOutput, setExecutionOutput] = useState<{ output: string; error: string; status: string } | null>(null);
    const [aiMessage, setAIMessage] = useState('');
    const [aiHistory, setAIHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
    const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
    const [lineNumbers, setLineNumbers] = useState(true);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);

    const selectedLang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

    const getLineNumbers = () => {
        const lines = code.split('\n').length;
        return Array.from({ length: Math.max(lines, 20) }, (_, i) => i + 1);
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCode(e.target.value);
        updateCode(e.target.value);
    };

    const handleExecute = async () => {
        if (!code.trim()) return;
        setIsExecuting(true);
        setExecutionOutput(null);
        
        try {
            const response = await fetchApi('/snippets/run', {
                method: 'POST',
                body: JSON.stringify({
                    code,
                    language: selectedLang.piston,
                    version: selectedLang.version
                })
            });
            
            setExecutionOutput({
                output: response.run?.output || '',
                error: response.run?.stderr || '',
                status: response.run?.stderr ? 'error' : 'success'
            });
        } catch (error: any) {
            setExecutionOutput({
                output: '',
                error: error.message || 'Execution failed',
                status: 'error'
            });
        } finally {
            setIsExecuting(false);
        }
    };

    const handleAI = async (prompt?: string) => {
        const message = prompt || aiMessage;
        if (!message.trim() || isAIResponding) return;
        
        setIsAIResponding(true);
        const newHistory = [...aiHistory, { role: 'user', content: message }];
        setAIHistory(newHistory);
        setAIMessage('');

        try {
            const response = await fetchApi('/ai/pair', {
                method: 'POST',
                body: JSON.stringify({
                    code,
                    task: message,
                    language,
                    conversation_history: newHistory.slice(-6),
                    personality: 'helpful'
                })
            });

            const aiResponse = response.response || response.text || 'I apologize, but I could not generate a response.';
            setAIHistory([...newHistory, { role: 'assistant', content: aiResponse }]);
        } catch (error: any) {
            setAIHistory([...newHistory, { role: 'assistant', content: `Error: ${error.message}` }]);
        } finally {
            setIsAIResponding(false);
        }
    };

    const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
        handleAI(action.prompt);
    };

    const handleSave = async () => {
        if (!user) {
            router.push('/auth/login');
            return;
        }

        setIsSaving(true);
        try {
            const method = currentSnippet.id ? 'PATCH' : 'POST';
            const endpoint = currentSnippet.id ? `/snippets/${currentSnippet.id}` : '/snippets';
            
            const data = await fetchApi(endpoint, {
                method,
                body: JSON.stringify({
                    title,
                    code,
                    language,
                    description,
                    tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                    visibility: 'public'
                })
            });

            if (!currentSnippet.id) {
                setSnippet({ ...currentSnippet, id: data.id });
                addToast({ title: "Created", message: "Snippet saved successfully", type: "success" });
            } else {
                addToast({ title: "Saved", message: "Changes saved", type: "success" });
            }
        } catch (error) {
            addToast({ title: "Error", message: "Failed to save", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    const handleNew = () => {
        resetEditor();
        setCode('');
        setTitle('Untitled');
        setDescription('');
        setTags('');
        setAIHistory([]);
        setExecutionOutput(null);
    };

    return (
        <div className="h-screen flex flex-col bg-[#1e1e1e] text-gray-300 overflow-hidden">
            {/* Header */}
            <header className="h-12 flex items-center justify-between px-4 bg-[#252526] border-b border-[#3c3c3c] shrink-0">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => router.back()} 
                        className="p-1.5 hover:bg-[#3c3c3c] rounded transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center">
                            <FileCode size={12} className="text-white" />
                        </div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-transparent text-sm text-white font-medium focus:outline-none w-40"
                            placeholder="Untitled"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-[#3c3c3c] border-none text-xs text-gray-300 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-violet-500"
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleNew}
                        className="p-2 hover:bg-[#3c3c3c] rounded transition-colors"
                        title="New"
                    >
                        <RotateCcw size={14} />
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded transition-colors disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        Save
                    </button>
                </div>
            </header>

            {/* Toolbar */}
            <div className="h-10 flex items-center justify-between px-4 bg-[#1e1e1e] border-b border-[#3c3c3c] shrink-0">
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleExecute}
                        disabled={isExecuting || !code.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2d2d2] hover:bg-[#3c3c3c] text-gray-300 text-xs font-medium rounded transition-colors disabled:opacity-50"
                    >
                        {isExecuting ? (
                            <Loader2 size={12} className="animate-spin" />
                        ) : (
                            <Play size={12} className="text-green-400" />
                        )}
                        Run
                    </button>
                    <div className="w-px h-4 bg-[#3c3c3c] mx-2" />
                    <button
                        onClick={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors",
                            isBottomPanelOpen ? "bg-violet-600/20 text-violet-400" : "hover:bg-[#3c3c3c] text-gray-400"
                        )}
                    >
                        <Brain size={12} />
                        AI
                    </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{selectedLang.name}</span>
                    <span>•</span>
                    <span>{code.split('\n').length} lines</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Editor */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                    <div className="flex-1 flex overflow-hidden">
                        {/* Line Numbers */}
                        {lineNumbers && (
                            <div className="w-12 bg-[#1e1e1e] border-r border-[#3c3c3c] text-right py-4 pr-3 text-xs text-gray-600 font-mono select-none overflow-hidden shrink-0">
                                {getLineNumbers().map(num => (
                                    <div key={num} className="leading-6">{num}</div>
                                ))}
                            </div>
                        )}
                        
                        {/* Code Area */}
                        <div className="flex-1 relative overflow-hidden">
                            <textarea
                                ref={textareaRef}
                                value={code}
                                onChange={handleCodeChange}
                                spellCheck={false}
                                className="absolute inset-0 w-full h-full p-4 bg-transparent text-gray-300 font-mono text-sm leading-6 whitespace-pre resize-none focus:outline-none caret-violet-400"
                                style={{ tabSize: 4 }}
                                placeholder="// Start coding..."
                            />
                        </div>
                    </div>

                    {/* Output Panel */}
                    {isBottomPanelOpen && (
                        <div className="h-64 border-t border-[#3c3c3c] flex flex-col bg-[#1e1e1e] shrink-0">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-[#3c3c3c]">
                                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                    <Terminal size={12} />
                                    Output
                                </div>
                                {executionOutput && (
                                    <div className={cn(
                                        "text-xs px-2 py-0.5 rounded",
                                        executionOutput.status === 'success' ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
                                    )}>
                                        {executionOutput.status === 'success' ? 'Success' : 'Error'}
                                    </div>
                                )}
                            </div>
                            <div 
                                ref={outputRef}
                                className="flex-1 p-4 font-mono text-sm overflow-auto"
                            >
                                {isExecuting ? (
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <Loader2 size={14} className="animate-spin" />
                                        Running...
                                    </div>
                                ) : executionOutput ? (
                                    <pre className={cn(
                                        "whitespace-pre-wrap",
                                        executionOutput.status === 'error' ? "text-red-400" : "text-gray-300"
                                    )}>
                                        {executionOutput.error || executionOutput.output || 'No output'}
                                    </pre>
                                ) : (
                                    <span className="text-gray-600">Click Run to execute your code</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* AI Panel */}
                <AnimatePresence>
                    {isBottomPanelOpen && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 380, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="border-l border-[#3c3c3c] bg-[#252526] flex flex-col shrink-0"
                        >
                            {/* AI Header */}
                            <div className="h-10 flex items-center justify-between px-4 border-b border-[#3c3c3c]">
                                <div className="flex items-center gap-2 text-xs font-medium text-violet-400">
                                    <Brain size={14} />
                                    AI Assistant
                                </div>
                                <button 
                                    onClick={() => setIsBottomPanelOpen(false)}
                                    className="p-1 hover:bg-[#3c3c3c] rounded"
                                >
                                    <X size={14} />
                                </button>
                            </div>

                            {/* AI Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {aiHistory.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Sparkles size={24} className="mx-auto mb-3 text-violet-500/50" />
                                        <p className="text-xs text-gray-500 mb-4">How can I help you code today?</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {QUICK_ACTIONS.map(action => (
                                                <button
                                                    key={action.id}
                                                    onClick={() => handleQuickAction(action)}
                                                    className="flex items-center gap-2 px-3 py-2 bg-[#3c3c3c] hover:bg-[#4c4c4c] rounded text-xs text-gray-300 transition-colors"
                                                >
                                                    <action.icon size={12} />
                                                    {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    aiHistory.map((msg, i) => (
                                        <div key={i} className={cn(
                                            "p-3 rounded-lg text-sm",
                                            msg.role === 'user' ? "bg-[#3c3c3c] ml-8" : "bg-[#2d2d2d] mr-4"
                                        )}>
                                            <Markdown content={msg.content} className="text-gray-300 prose prose-invert prose-sm" />
                                        </div>
                                    ))
                                )}
                                {isAIResponding && (
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <Loader2 size={14} className="animate-spin" />
                                        Thinking...
                                    </div>
                                )}
                            </div>

                            {/* AI Input */}
                            <div className="p-3 border-t border-[#3c3c3c]">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={aiMessage}
                                        onChange={(e) => setAIMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAI()}
                                        placeholder="Ask AI..."
                                        className="flex-1 bg-[#3c3c3c] border-none rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
                                    />
                                    <button
                                        onClick={() => handleAI()}
                                        disabled={isAIResponding || !aiMessage.trim()}
                                        className="p-2 bg-violet-600 hover:bg-violet-500 rounded text-white disabled:opacity-50"
                                    >
                                        {isAIResponding ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Status Bar */}
            <div className="h-6 flex items-center justify-between px-4 bg-[#007acc] text-white text-xs shrink-0">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <Brain size={10} />
                        AI Ready
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Ln {code.split('\n').length}, Col {code.split('\n').pop()?.length || 0}</span>
                    <span>{selectedLang.name}</span>
                    <span>UTF-8</span>
                </div>
            </div>
        </div>
    );
}
