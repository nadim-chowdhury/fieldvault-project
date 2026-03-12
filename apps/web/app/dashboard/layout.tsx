'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import {
  LayoutDashboard,
  Package,
  Users,
  Wrench,
  FileText,
  Bell,
  LogOut,
  HardHat,
  Settings,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Assets', href: '/dashboard/assets', icon: Package },
  { label: 'Team', href: '/dashboard/team', icon: Users },
  { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, company, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ─── Sidebar ────────────────────────────────── */}
      <aside className="w-64 flex flex-col shrink-0" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-slate-700/50">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">FieldVault</span>
        </div>

        {/* Company */}
        <div className="px-5 py-3 border-b border-slate-700/50">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">Company</p>
          <p className="text-sm text-slate-300 font-medium truncate mt-0.5">{company?.name || 'Loading...'}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-400/60" />}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="px-3 py-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Main ──────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto" style={{ background: '#f8fafc' }}>
        {children}
      </main>
    </div>
  );
}
