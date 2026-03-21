'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { companiesApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
  MapPin,
  Shield,
  ChevronDown,
  Check,
  Plus,
  Building2,
  Loader2,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Assets', href: '/dashboard/assets', icon: Package },
  { label: 'Sites', href: '/dashboard/sites', icon: MapPin },
  { label: 'Team', href: '/dashboard/team', icon: Users },
  { label: 'Maintenance', href: '/dashboard/maintenance', icon: Wrench },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'Audit Trail', href: '/dashboard/audit-logs', icon: Shield },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user, company, companies, isAuthenticated, logout, switchCompany, addCompany, setCompanies } = useAuthStore();

  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [switching, setSwitching] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Load companies from API on mount if we only have 0 or 1
  useEffect(() => {
    if (isAuthenticated && companies.length <= 1) {
      companiesApi.listMyCompanies().then((r) => {
        const list = r.data?.data || r.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setCompanies(list);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSwitch = async (targetCompanyId: string) => {
    if (targetCompanyId === company?.id) {
      setSwitcherOpen(false);
      return;
    }
    setSwitching(true);
    try {
      const { data } = await companiesApi.switchCompany(targetCompanyId);
      const res = data.data || data;
      switchCompany(res.company, res.user, res.tokens);
      queryClient.clear();
      setSwitcherOpen(false);
      toast.success(`Switched to ${res.company.name}`);
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to switch company');
    } finally {
      setSwitching(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    setCreating(true);
    try {
      const { data } = await companiesApi.createCompany({ name: newCompanyName.trim() });
      const newCompany = data.data || data;
      addCompany(newCompany);
      toast.success(`"${newCompany.name}" created! Switch to it from the company menu.`);
      setCreateOpen(false);
      setNewCompanyName('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create company');
    } finally {
      setCreating(false);
    }
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

        {/* Company Switcher */}
        <div className="px-3 py-3 border-b border-slate-700/50 relative">
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-700/40 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-slate-200 truncate">{company?.name || 'Loading...'}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{company?.plan || 'starter'} plan</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${switcherOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {switcherOpen && (
            <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-slate-800 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden animate-fadeIn">
              <div className="px-3 py-2 border-b border-slate-700/30">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Your Companies</p>
              </div>
              <div className="max-h-48 overflow-y-auto py-1">
                {companies.map((c: any) => (
                  <button
                    key={c.id}
                    onClick={() => handleSwitch(c.id)}
                    disabled={switching}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-700/40 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                      c.id === company?.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {c.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${c.id === company?.id ? 'text-white font-medium' : 'text-slate-300'}`}>
                        {c.name}
                      </p>
                    </div>
                    {c.id === company?.id && (
                      <Check className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-700/30 p-2">
                <button
                  onClick={() => { setSwitcherOpen(false); setCreateOpen(true); }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-blue-400 hover:bg-blue-600/10 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Create New Company
                </button>
              </div>
            </div>
          )}
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

      {/* ─── Create Company Modal ──────────────────── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slideUp">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" /> Create New Company
              </h3>
              <button onClick={() => setCreateOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name *</label>
                <input
                  required
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  type="text"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="e.g. Acme Construction"
                />
              </div>
              <p className="text-xs text-slate-400">
                A new company will be created with a 14-day trial on the Starter plan. You'll be the admin.
              </p>
              <button
                disabled={creating}
                type="submit"
                className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {creating ? 'Creating...' : 'Create Company'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Click outside to close switcher */}
      {switcherOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setSwitcherOpen(false)} />
      )}
    </div>
  );
}
