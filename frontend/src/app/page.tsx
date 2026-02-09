'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Code2,
  Users2,
  Zap,
  ShieldCheck,
  Globe2,
  ChevronRight,
  Star,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      title: "AI Pair Programming",
      description: "Real-time AI assistance that understands your coding style and patterns.",
      icon: Cpu,
      color: "text-violet-500",
      bg: "bg-violet-500/10"
    },
    {
      title: "Real-time Collaboration",
      description: "Work together seamlessly with multi-cursor editing and live chat.",
      icon: Users2,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Universal Translation",
      description: "Translate code between 20+ languages while preserving logic and performance.",
      icon: Globe2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Global Snippet Library",
      description: "Save, version, and share code snippets with the global developer community.",
      icon: Code2,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ];

  const stats = [
    { label: "Active Developers", value: "125k+" },
    { label: "Code Snippets", value: "2.4M" },
    { label: "Collaborations", value: "850k" },
    { label: "AI Suggestions", value: "15M+" }
  ];

  return (
    <main className="min-h-screen bg-slate-950 selection:bg-violet-500/30">
      {/* Navigation Overlay */}
      <nav className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300 px-8 py-6",
        scrolled ? "bg-slate-950/80 backdrop-blur-md border-b border-white/5 py-4" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter italic">SUNDER<span className="text-violet-500">.</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Marketplace', 'Enterprise', 'Docs'].map(item => (
              <button key={item} className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-colors">{item}</button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login" className="text-xs font-bold text-white uppercase tracking-widest px-6 py-3 hover:text-violet-400 transition-colors">Login</Link>
            <Link href="/auth/register" className="px-6 py-3 bg-white text-slate-950 text-xs font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] opacity-20 pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-violet-600 blur-[120px] rounded-full opacity-30 animate-pulse" />
          <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-blue-600 blur-[120px] rounded-full opacity-30 animate-pulse" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-[10px] font-black uppercase tracking-widest animate-fade-in">
              <Zap size={12} fill="currentColor" /> Next Gen Intelligence v2.0 is Live
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter uppercase italic leading-[0.9] animate-slide-up">
              Code at the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-emerald-400">Speed of AI.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed animate-fade-in delay-200">
              The collaborative engineering platform for the modern era. Share snippets, collaborate in real-time, and leverage advanced Gemini-powered intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 animate-fade-in delay-300">
              <Link href="/dashboard" className="w-full sm:w-auto px-10 py-5 bg-violet-600 hover:bg-violet-550 text-white font-black rounded-2xl transition-all shadow-2xl shadow-violet-600/30 uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                Get Started Free <ChevronRight size={20} />
              </Link>
              <Link href="/snippets" className="w-full sm:w-auto px-10 py-5 glass hover:bg-white/10 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                View Marketplace
              </Link>
            </div>
          </div>

          {/* AI Demo Section */}
          <div className="mt-24 max-w-5xl mx-auto glass p-3 rounded-[48px] border border-white/10 shadow-3xl transform hover:scale-[1.02] transition-all group">
            <div className="bg-slate-900 rounded-[40px] overflow-hidden border border-white/5 aspect-video md:aspect-[21/9] flex flex-col">
              <div className="px-6 py-4 bg-slate-950/50 border-b border-white/5 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                </div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sunder Pair Assistant</div>
                <div className="w-8 h-8 rounded-lg bg-white/5" />
              </div>
              <div className="flex-1 p-8 font-mono text-sm md:text-base text-violet-400 flex flex-col justify-center">
                <div className="overflow-hidden whitespace-nowrap border-r-2 border-violet-500 animate-typing w-[34ch] mb-4">
                  $ sunder translate --to python "main.ts"
                </div>
                <div className="space-y-2 opacity-60 animate-fade-in delay-1000">
                  <p className="text-slate-500"># Result from sunder-engine-3.5</p>
                  <p className="text-emerald-400">def calculate_metrics(data):</p>
                  <p className="pl-4 text-emerald-400">return sum(data) / len(data) if data else 0</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-8 bg-slate-950/50 backdrop-blur-3xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="glass p-10 rounded-[40px] border border-white/5 hover:border-white/10 transition-all group hover:-translate-y-2">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110", feature.bg)}>
                  <feature.icon className={feature.color} size={28} />
                </div>
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight italic">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-violet-600">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="text-4xl md:text-5xl font-black text-white italic">{stat.value}</div>
                <div className="text-xs font-bold text-violet-200 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-slate-950 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="text-violet-500" size={24} />
              <span className="text-2xl font-black text-white tracking-tighter italic uppercase">SUNDER</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs">Empowering the next generation of engineers with collective intelligence.</p>
          </div>
          <div className="flex gap-12">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Connect</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer"><Globe2 size={18} className="text-slate-400" /></div>
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer"><Star size={18} className="text-slate-400" /></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
