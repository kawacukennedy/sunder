'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { fetchApi, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import { FileCode, Clock, Star, ExternalLink } from 'lucide-react';

export default function MySnippets() {
    const { data: snippets, isLoading } = useQuery({
        queryKey: ['my-snippets'],
        queryFn: () => fetchApi('/snippets/my')
    });

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white uppercase tracking-tight">My Snippets</h1>
                        <p className="text-slate-400">Library of code you've created and saved</p>
                    </div>
                    <Link href="/snippets/create" className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-violet-600/20">
                        Create New
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-3xl animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {snippets?.map((snippet: any) => (
                            <Link key={snippet.id} href={`/snippets/${snippet.id}`} className="glass group p-6 rounded-[32px] border border-white/5 hover:border-violet-500/30 transition-all flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center">
                                        <FileCode className="text-violet-400" size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{snippet.language}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white group-hover:text-violet-400 transition-colors uppercase tracking-tight line-clamp-1">{snippet.title}</h3>
                                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{snippet.description || 'No description provided.'}</p>
                                </div>
                                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                                        <Clock size={12} /> {formatRelativeTime(snippet.created_at)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                                            <Star size={12} className="fill-current" /> {snippet.star_count || 0}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!isLoading && snippets?.length === 0 && (
                    <div className="py-20 text-center">
                        <FileCode size={48} className="text-slate-700 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white">No snippets yet</h2>
                        <p className="text-slate-500 mt-2">Start building your library today!</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
