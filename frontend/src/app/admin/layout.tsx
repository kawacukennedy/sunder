'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    ShieldAlert,
    LayoutDashboard,
    Users,
    FileCode,
    History,
    Settings,
    Activity
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const tabs = [
        { label: 'Overview', href: '/admin', icon: LayoutDashboard },
        { label: 'Users', href: '/admin/users', icon: Users },
        { label: 'Snippets', href: '/admin/snippets', icon: FileCode },
        { label: 'Audit Logs', href: '/admin/audit', icon: History },
        { label: 'System', href: '/admin/system', icon: Settings },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-10">
                {/* Admin Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 rounded-[28px] flex items-center justify-center border border-white/10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <ShieldAlert className="text-white relative z-10" size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold text-white uppercase tracking-tighter italic leading-none mb-2">Systems Command</h1>
                            <p className="text-slate-400 font-medium">Global infrastructure orchestration and governance module</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">All Systems Nominal</span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-2xl border border-white/5 w-fit">
                    {tabs.map(tab => (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                pathname === tab.href
                                    ? "bg-white text-slate-950 shadow-2xl"
                                    : "text-slate-500 hover:text-white"
                            )}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </Link>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </div>
        </DashboardLayout>
    );
}
