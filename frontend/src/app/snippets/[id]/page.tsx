'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    Star,
    Users,
    MessageSquare,
    Share2,
    ShieldCheck,
    Zap,
    BarChart3,
    Copy,
    Terminal,
    ChevronRight,
    User as UserIcon,
    Clock,
    ArrowRight,
    Flag,
    Trash2,
    Edit3,
    GitFork,
    X,
    AlertTriangle,
    Check
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn, fetchApi, formatRelativeTime } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import CodeEditor from '@/components/CodeEditor';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function SnippetPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { user } = useAuthStore();
    const { addToast } = useUIStore();
    const queryClient = useQueryClient();

    const [commentText, setCommentText] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [showFlagModal, setShowFlagModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [flagReason, setFlagReason] = useState('inappropriate');
    const [flagDescription, setFlagDescription] = useState('');
    const [isStarred, setIsStarred] = useState(false);

    // Fetch snippet
    const { data: snippet, isLoading, error } = useQuery({
        queryKey: ['snippet', id],
        queryFn: () => fetchApi(`/snippets/${id}`)
    });

    // Fetch versions
    const { data: versions } = useQuery({
        queryKey: ['snippet-versions', id],
        queryFn: () => fetchApi(`/snippets/${id}/versions`),
        enabled: !!id
    });

    // Check if user has starred
    const { data: starredSnippets } = useQuery({
        queryKey: ['starred-snippets'],
        queryFn: () => fetchApi('/snippets?visibility=public&limit=1'),
        enabled: !!user
    });

    const isAuthor = user && snippet?.author?.id === user.id;

    // Star mutation
    const starMutation = useMutation({
        mutationFn: async () => {
            if (isStarred) {
                await fetchApi(`/snippets/${id}/star`, { method: 'DELETE' });
            } else {
                await fetchApi(`/snippets/${id}/star`, { method: 'POST' });
            }
        },
        onMutate: () => {
            setIsStarred(!isStarred);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['snippet', id] });
            addToast({
                title: isStarred ? 'Unstarred' : 'Starred',
                message: isStarred ? 'Removed from favorites' : 'Added to favorites',
                type: 'success'
            });
        },
        onError: () => {
            setIsStarred(!isStarred); // revert
            addToast({ title: 'Error', message: 'Failed to update star', type: 'error' });
        }
    });

    // Fork mutation
    const forkMutation = useMutation({
        mutationFn: () => fetchApi(`/snippets/${id}/fork`, { method: 'POST' }),
        onSuccess: (data) => {
            addToast({ title: 'Forked!', message: 'Snippet forked successfully', type: 'success' });
            router.push(`/snippets/${data.id}`);
        },
        onError: () => {
            addToast({ title: 'Error', message: 'Failed to fork snippet', type: 'error' });
        }
    });

    // Comment mutation
    const commentMutation = useMutation({
        mutationFn: (content: string) => fetchApi(`/snippets/${id}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        }),
        onSuccess: () => {
            setCommentText('');
            queryClient.invalidateQueries({ queryKey: ['snippet', id] });
            addToast({ title: 'Comment posted', message: 'Your comment has been added', type: 'success' });
        },
        onError: () => {
            addToast({ title: 'Error', message: 'Failed to post comment', type: 'error' });
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: () => fetchApi(`/snippets/${id}`, { method: 'DELETE' }),
        onSuccess: () => {
            addToast({ title: 'Deleted', message: 'Snippet has been deleted', type: 'success' });
            router.push('/snippets');
        },
        onError: () => {
            addToast({ title: 'Error', message: 'Failed to delete snippet', type: 'error' });
        }
    });

    // Flag mutation
    const flagMutation = useMutation({
        mutationFn: () => fetchApi(`/snippets/${id}/flag`, {
            method: 'POST',
            body: JSON.stringify({ reason: flagReason, description: flagDescription })
        }),
        onSuccess: () => {
            setShowFlagModal(false);
            setFlagReason('inappropriate');
            setFlagDescription('');
            addToast({ title: 'Reported', message: 'Content has been flagged for review', type: 'success' });
        },
        onError: () => {
            addToast({ title: 'Error', message: 'Failed to submit report', type: 'error' });
        }
    });

    const handleShare = async () => {
        const url = `${window.location.origin}/snippets/${id}`;
        try {
            await navigator.clipboard.writeText(url);
            addToast({ title: 'Link Copied', message: 'Snippet URL copied to clipboard', type: 'success' });
            setShowShareModal(false);
        } catch {
            addToast({ title: 'Error', message: 'Failed to copy link', type: 'error' });
        }
    };

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(snippet?.code || '');
            addToast({ title: 'Copied', message: 'Code copied to clipboard', type: 'success' });
        } catch {
            addToast({ title: 'Error', message: 'Failed to copy code', type: 'error' });
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="max-w-6xl mx-auto space-y-10 animate-pulse">
                    <div className="h-8 w-48 bg-white/5 rounded-xl" />
                    <div className="h-24 w-full bg-white/5 rounded-[32px]" />
                    <div className="h-[400px] w-full bg-white/5 rounded-[40px]" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !snippet) {
        return (
            <DashboardLayout>
                <div className="max-w-6xl mx-auto py-20 text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Snippet not found</h2>
                    <Link href="/snippets" className="text-violet-400 hover:text-white transition-colors">Return to Explorer</Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <Link href="/snippets" className="hover:text-white transition-colors">Explorer</Link>
                    <ChevronRight size={14} />
                    <span className="text-white">Active Snippet</span>
                </nav>

                {/* Snippet Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-violet-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-violet-600/20">
                                <Terminal className="text-white" size={24} />
                            </div>
                            <h1 className="text-4xl font-bold text-white uppercase tracking-tight">{snippet.title}</h1>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link href={`/profile/${snippet.author?.username}`} className="flex items-center gap-2 group">
                                <div className="w-6 h-6 rounded-full bg-slate-800 border border-white/10 group-hover:border-violet-500/50 transition-all flex items-center justify-center">
                                    <UserIcon size={12} className="text-slate-400" />
                                </div>
                                <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{snippet.author?.username || 'anonymous'}</span>
                            </Link>
                            <span className="text-slate-700">|</span>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5"><Star size={14} className="text-amber-400" /> {snippet.star_count || 0}</span>
                                <span className="flex items-center gap-1.5"><Users size={14} className="text-blue-400" /> {snippet.fork_count || 0} Forks</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Star Button */}
                        <button
                            onClick={() => {
                                if (!user) { router.push('/auth/login'); return; }
                                starMutation.mutate();
                            }}
                            className={cn(
                                "px-5 py-3 rounded-2xl font-bold transition-all border flex items-center justify-center gap-2 text-sm",
                                isStarred
                                    ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20"
                                    : "glass hover:bg-white/10 text-white border-white/5"
                            )}
                        >
                            <Star size={18} className={isStarred ? "fill-amber-400" : ""} />
                            {isStarred ? 'Starred' : 'Star'}
                        </button>

                        {/* Share Button */}
                        <button
                            onClick={handleShare}
                            className="px-5 py-3 glass hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/5 flex items-center justify-center gap-2 text-sm"
                        >
                            <Share2 size={18} /> Share
                        </button>

                        {/* Fork Button */}
                        <button
                            onClick={() => {
                                if (!user) { router.push('/auth/login'); return; }
                                forkMutation.mutate();
                            }}
                            disabled={forkMutation.isPending}
                            className="px-6 py-3 bg-white text-slate-950 rounded-2xl font-black transition-all shadow-xl shadow-white/10 hover:bg-slate-200 flex items-center justify-center gap-2 uppercase tracking-wide text-sm disabled:opacity-50"
                        >
                            <GitFork size={18} />
                            {forkMutation.isPending ? 'Forking...' : 'Fork'}
                        </button>

                        {/* Author-only actions */}
                        {isAuthor && (
                            <>
                                <Link
                                    href={`/snippets/${id}/edit`}
                                    className="px-5 py-3 glass hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/5 flex items-center justify-center gap-2 text-sm"
                                >
                                    <Edit3 size={18} /> Edit
                                </Link>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="px-5 py-3 glass hover:bg-red-500/10 text-red-400 rounded-2xl font-bold transition-all border border-red-500/20 flex items-center justify-center gap-2 text-sm"
                                >
                                    <Trash2 size={18} /> Delete
                                </button>
                            </>
                        )}

                        {/* Report */}
                        {!isAuthor && user && (
                            <button
                                onClick={() => setShowFlagModal(true)}
                                className="p-3 glass hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-2xl transition-all border border-white/5"
                                title="Report snippet"
                            >
                                <Flag size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {/* AI Insight Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Security Score', value: snippet.analysis?.score_aggregate?.security || '98/100', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                        { label: 'Performance', value: snippet.analysis?.score_aggregate?.performance || 'High', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                        { label: 'Readability', value: snippet.analysis?.score_aggregate?.readability || 'A+', icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    ].map(insight => (
                        <div key={insight.label} className="glass p-5 rounded-[24px] border border-white/5 flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", insight.bg)}>
                                <insight.icon size={20} className={insight.color} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{insight.label}</p>
                                <p className="text-lg font-bold text-white leading-none">{insight.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Code Section */}
                <div className="glass rounded-[40px] border border-white/5 overflow-hidden flex flex-col bg-slate-950/20 shadow-2xl">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                            </div>
                            <span className="text-xs font-mono text-slate-500">{snippet.title?.toLowerCase().replace(/\s+/g, '-')}.{snippet.language}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-1 rounded uppercase">{snippet.language}</span>
                            <button
                                onClick={handleCopyCode}
                                className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-all border border-white/10"
                                title="Copy code"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="p-0 font-mono text-sm leading-relaxed text-slate-300 relative group h-[500px]">
                        <CodeEditor
                            code={snippet.code}
                            language={snippet.language}
                            readOnly
                        />
                    </div>
                </div>

                {/* Description & Metadata */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <h2 className="text-xl font-bold text-white mb-4">Description</h2>
                            <p className="text-slate-400 leading-relaxed">
                                {snippet.description || 'No description provided.'}
                            </p>
                        </div>

                        {/* Comments Section */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <MessageSquare size={20} className="text-emerald-400" /> Comments ({snippet.comments?.length || 0})
                            </h2>
                            <div className="space-y-4">
                                {snippet.comments?.map((comment: any) => (
                                    <div key={comment.id} className="glass p-6 rounded-3xl border border-white/5 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-white">
                                                    {comment.user?.username?.slice(0, 2).toUpperCase() || 'AN'}
                                                </div>
                                                <Link href={`/profile/${comment.user?.username}`} className="text-sm font-bold text-white hover:text-violet-400 transition-colors">
                                                    {comment.user?.username || 'anonymous'}
                                                </Link>
                                            </div>
                                            <span className="text-xs text-slate-600">{formatRelativeTime(comment.created_at)} ago</span>
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            {comment.content}
                                        </p>
                                    </div>
                                ))}

                                {(!snippet.comments || snippet.comments.length === 0) && (
                                    <div className="glass p-8 rounded-3xl border border-white/5 text-center">
                                        <p className="text-sm text-slate-500">No comments yet. Be the first to share your thoughts!</p>
                                    </div>
                                )}

                                {/* Comment Input */}
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder={user ? "Add a comment..." : "Login to comment..."}
                                        className="flex-1 bg-slate-900/50 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all font-mono disabled:opacity-50"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && commentText.trim()) {
                                                commentMutation.mutate(commentText.trim());
                                            }
                                        }}
                                        disabled={!user || commentMutation.isPending}
                                    />
                                    <button
                                        onClick={() => {
                                            if (!user) { router.push('/auth/login'); return; }
                                            if (commentText.trim()) commentMutation.mutate(commentText.trim());
                                        }}
                                        disabled={!commentText.trim() || commentMutation.isPending}
                                        className="px-8 py-4 bg-white text-slate-950 font-bold rounded-2xl hover:bg-slate-200 transition-all text-sm uppercase tracking-widest disabled:opacity-50"
                                    >
                                        {commentMutation.isPending ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Version History */}
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <Clock size={20} className="text-blue-400" /> Version History
                            </h2>
                            <div className="bg-slate-950/50 rounded-[32px] border border-white/5 overflow-hidden">
                                {versions && versions.length > 0 ? (
                                    versions.map((v: any, i: number) => (
                                        <div key={v.id || i} className={cn(
                                            "p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer group",
                                            i !== versions.length - 1 && "border-b border-white/5"
                                        )}>
                                            <div className="flex items-center gap-6">
                                                <span className="text-sm font-mono text-violet-400 group-hover:text-white transition-colors">v{v.version_number}</span>
                                                <div>
                                                    <p className="text-sm text-white font-medium">{v.change_summary || 'Code update'}</p>
                                                    <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-0.5">{formatRelativeTime(v.created_at)} ago</p>
                                                </div>
                                            </div>
                                            <ArrowRight size={16} className="text-slate-700 group-hover:text-violet-500 transition-colors" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-sm text-slate-500">No version history available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-10">
                        <div className="glass p-8 rounded-[32px] border border-white/5 space-y-8 h-fit">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Community Insights</h3>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Views</span>
                                    <span className="text-white font-bold">{snippet.view_count || 0}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Stars</span>
                                    <span className="text-white font-bold">{snippet.star_count || 0}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Forks</span>
                                    <span className="text-white font-bold">{snippet.fork_count || 0}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Created</span>
                                    <span className="text-white font-bold">{snippet.created_at ? formatRelativeTime(snippet.created_at) + ' ago' : 'Unknown'}</span>
                                </div>
                                {snippet.updated_at && snippet.updated_at !== snippet.created_at && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-500">Updated</span>
                                        <span className="text-white font-bold">{formatRelativeTime(snippet.updated_at)} ago</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-widest px-2">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {snippet.tags?.length > 0 ? snippet.tags.map((tag: string) => (
                                    <Link
                                        key={tag}
                                        href={`/snippets?tags=${tag}`}
                                        className="px-4 py-2 bg-slate-900 border border-white/5 rounded-2xl text-[11px] text-slate-400 hover:border-violet-500/50 hover:text-white transition-all cursor-pointer font-bold uppercase tracking-tighter"
                                    >
                                        {tag}
                                    </Link>
                                )) : (
                                    <span className="text-xs text-slate-600 italic">No tags</span>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 space-y-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center">
                                <AlertTriangle size={24} className="text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Delete Snippet</h3>
                                <p className="text-sm text-slate-400">This action cannot be undone.</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-400">Are you sure you want to delete &quot;{snippet.title}&quot;? All associated comments, stars, and version history will be lost.</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-6 py-3 glass hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/5 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => { deleteMutation.mutate(); setShowDeleteConfirm(false); }}
                                disabled={deleteMutation.isPending}
                                className="px-6 py-3 bg-red-600 text-white rounded-2xl font-bold transition-all hover:bg-red-700 text-sm disabled:opacity-50"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report/Flag Modal */}
            {showFlagModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowFlagModal(false)}>
                    <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-md w-full mx-4 space-y-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                                    <Flag size={24} className="text-amber-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white">Report Snippet</h3>
                            </div>
                            <button onClick={() => setShowFlagModal(false)} className="p-2 hover:bg-white/5 rounded-xl"><X size={18} className="text-slate-500" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Reason</label>
                                <select
                                    value={flagReason}
                                    onChange={(e) => setFlagReason(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50"
                                >
                                    <option value="inappropriate">Inappropriate Content</option>
                                    <option value="spam">Spam</option>
                                    <option value="malicious">Malicious Code</option>
                                    <option value="copyright">Copyright Violation</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Description (optional)</label>
                                <textarea
                                    value={flagDescription}
                                    onChange={(e) => setFlagDescription(e.target.value)}
                                    placeholder="Provide additional details..."
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 resize-none h-24"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowFlagModal(false)}
                                className="px-6 py-3 glass hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/5 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => flagMutation.mutate()}
                                disabled={flagMutation.isPending}
                                className="px-6 py-3 bg-amber-600 text-white rounded-2xl font-bold transition-all hover:bg-amber-700 text-sm disabled:opacity-50"
                            >
                                {flagMutation.isPending ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
