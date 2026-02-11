'use client';

import React, { useEffect } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-bash';
import { cn } from '@/lib/utils';

interface MarkdownProps {
    content: string;
    className?: string;
}

export const Markdown: React.FC<MarkdownProps> = ({ content, className }) => {
    useEffect(() => {
        Prism.highlightAll();
    }, [content]);

    // Split content into code blocks and regular text
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
        <div className={cn("space-y-4 text-slate-300 leading-relaxed", className)}>
            {parts.map((part, index) => {
                if (part.startsWith('```')) {
                    const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
                    const lang = match?.[1] || 'javascript';
                    const code = match?.[2] || '';

                    return (
                        <div key={index} className="relative group my-4">
                            <div className="absolute top-0 right-4 px-2 py-1 bg-white/5 border border-white/5 rounded-b-lg text-[8px] font-black uppercase tracking-widest text-slate-500 z-10 group-hover:text-white transition-colors">
                                {lang}
                            </div>
                            <pre className={cn(`language-${lang.toLowerCase()} !bg-black/40 !p-4 !rounded-xl border border-white/5 overflow-x-auto custom-scrollbar shadow-inner`)}>
                                <code className={`language-${lang.toLowerCase()} text-xs md:text-sm font-mono`}>
                                    {code}
                                </code>
                            </pre>
                        </div>
                    );
                }

                // Basic text formatting (Bold, Inline Code, Lists)
                return (
                    <div key={index} className="markdown-text space-y-3 whitespace-pre-wrap">
                        {part.split('\n\n').map((paragraph, pIndex) => {
                            if (!paragraph.trim()) return null;

                            // Handle Lists
                            if (paragraph.startsWith('- ') || paragraph.startsWith('* ') || /^\d+\.\s/.test(paragraph)) {
                                const items = paragraph.split('\n');
                                return (
                                    <ul key={pIndex} className="list-disc list-inside space-y-1 ml-2">
                                        {items.map((item, iIndex) => (
                                            <li key={iIndex} className="text-slate-400">
                                                {renderFormattedText(item.replace(/^[-*]\s|\d+\.\s/, ''))}
                                            </li>
                                        ))}
                                    </ul>
                                );
                            }

                            // Handle Headers
                            if (paragraph.startsWith('### ')) {
                                return <h3 key={pIndex} className="text-sm md:text-base font-black text-white uppercase tracking-tight italic mt-6 mb-2">{renderFormattedText(paragraph.replace('### ', ''))}</h3>;
                            }
                            if (paragraph.startsWith('#### ')) {
                                return <h4 key={pIndex} className="text-xs md:text-sm font-black text-slate-200 uppercase tracking-widest mt-4 mb-1">{renderFormattedText(paragraph.replace('#### ', ''))}</h4>;
                            }

                            return (
                                <p key={pIndex} className="text-[11px] md:text-xs">
                                    {renderFormattedText(paragraph)}
                                </p>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
};

// Helper to render bold and inline code
function renderFormattedText(text: string) {
    // This is a simplified regex-based formatter
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-white font-black">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="px-1.5 py-0.5 bg-white/10 rounded font-mono text-violet-300 text-[0.9em]">{part.slice(1, -1)}</code>;
        }
        return part;
    });
}
