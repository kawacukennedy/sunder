'use client';

import { useEffect, useRef, useCallback } from 'react';
import Prism from 'prismjs';
import '@/styles/sunder-prism-theme.css';

// Import all supported languages
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-json';

import { cn } from '@/lib/utils';

// Map common language names to Prism grammar keys
const LANGUAGE_MAP: Record<string, string> = {
  typescript: 'typescript',
  javascript: 'javascript',
  python: 'python',
  rust: 'rust',
  go: 'go',
  ruby: 'ruby',
  java: 'java',
  'c++': 'cpp',
  cpp: 'cpp',
  c: 'c',
  css: 'css',
  html: 'markup',
  markup: 'markup',
  sql: 'sql',
  bash: 'bash',
  shell: 'bash',
  swift: 'swift',
  kotlin: 'kotlin',
  json: 'json',
};

function getPrismLanguage(lang: string): string {
  return LANGUAGE_MAP[lang.toLowerCase()] || 'javascript';
}

interface CodeEditorProps {
  code: string;
  language: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  /** Dim the highlighted code (e.g. for pending AI suggestions) */
  dimmed?: boolean;
}

export default function CodeEditor({
  code,
  language,
  onChange,
  readOnly = false,
  className,
  placeholder = '',
  dimmed = false,
}: CodeEditorProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prismLang = getPrismLanguage(language);

  // Re-highlight when code or language changes
  useEffect(() => {
    if (preRef.current) {
      const codeEl = preRef.current.querySelector('code');
      if (codeEl) {
        Prism.highlightElement(codeEl);
      }
    }
  }, [code, prismLang]);

  // Sync scroll from textarea → pre
  const handleScroll = useCallback(() => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  // Display text: add trailing space if code ends with newline (prevents collapse)
  const displayCode = code + (code.endsWith('\n') ? ' ' : '');

  if (readOnly) {
    return (
      <pre
        ref={preRef}
        className={cn(
          `language-${prismLang}`,
          'code-editor-scrollable m-0 p-4 bg-transparent font-mono text-xs md:text-sm leading-relaxed overflow-auto h-full',
          className,
        )}
      >
        <code className={`language-${prismLang}`}>
          {code || placeholder}
        </code>
      </pre>
    );
  }

  return (
    <div className={cn('relative w-full h-full min-h-0', className)}>
      {/* Highlighted layer (behind textarea) */}
      <pre
        ref={preRef}
        aria-hidden="true"
        className={cn(
          `language-${prismLang}`,
          'absolute inset-0 w-full h-full m-0 p-4 pointer-events-none overflow-hidden bg-transparent font-mono text-xs md:text-sm leading-relaxed whitespace-pre',
          dimmed && 'opacity-40',
        )}
      >
        <code className={`language-${prismLang}`}>
          {displayCode}
        </code>
      </pre>

      {/* Editable textarea (on top) */}
      <textarea
        ref={textareaRef}
        value={code}
        onScroll={handleScroll}
        onChange={(e) => onChange?.(e.target.value)}
        spellCheck={false}
        placeholder={placeholder}
        className={cn(
          'absolute inset-0 w-full h-full bg-transparent p-4 font-mono text-xs md:text-sm leading-relaxed',
          'text-transparent caret-violet-400 focus:outline-none selection:bg-violet-500/30',
          'whitespace-pre border-none outline-none resize-none z-10',
          'overflow-auto code-editor-scrollable',
          'placeholder:text-slate-600',
        )}
        style={{ WebkitTextFillColor: 'transparent' }}
      />
    </div>
  );
}
