'use client';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  Users,
  DollarSign,
  ArrowDownRight,
  TrendingUp,
  Activity,
} from 'lucide-react';

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats().then((r) => r.data?.data || r.data),
  });

  const stats = data?.assets;

  return (
    <div className="p-6 lg:p-8 animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of your equipment and operations</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Assets"
          value={isLoading ? '...' : stats?.total ?? 0}
          icon={Package}
          color="#2563eb"
          trend="+12%"
        />
        <StatCard
          label="Available"
          value={isLoading ? '...' : stats?.available ?? 0}
          icon={CheckCircle2}
          color="#10b981"
        />
        <StatCard
          label="In Use"
          value={isLoading ? '...' : stats?.inUse ?? 0}
          icon={Activity}
          color="#f59e0b"
        />
        <StatCard
          label="Total Value"
          value={isLoading ? '...' : `$${((stats?.totalValue ?? 0) / 1000).toFixed(0)}K`}
          icon={DollarSign}
          color="#6366f1"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCardSmall
          label="Team Members"
          value={isLoading ? '...' : data?.team?.totalUsers ?? 0}
          icon={Users}
          color="#8b5cf6"
        />
        <StatCardSmall
          label="Active Checkouts"
          value={isLoading ? '...' : data?.assignments?.active ?? 0}
          icon={ArrowDownRight}
          color="#0ea5e9"
        />
        <StatCardSmall
          label="Overdue Maintenance"
          value={isLoading ? '...' : data?.maintenance?.overdue ?? 0}
          icon={AlertTriangle}
          color={data?.maintenance?.overdue > 0 ? '#ef4444' : '#10b981'}
          alert={data?.maintenance?.overdue > 0}
        />
      </div>

      {/* Asset Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Asset Status Distribution</h3>
          <div className="space-y-3">
            {[
              { label: 'Available', value: stats?.available ?? 0, total: stats?.total ?? 1, color: '#10b981' },
              { label: 'In Use', value: stats?.inUse ?? 0, total: stats?.total ?? 1, color: '#f59e0b' },
              { label: 'Maintenance', value: stats?.maintenance ?? 0, total: stats?.total ?? 1, color: '#6366f1' },
              { label: 'Lost / Missing', value: stats?.lost ?? 0, total: stats?.total ?? 1, color: '#ef4444' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-medium text-slate-900">{item.value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity</h3>
          {data?.assignments?.recent?.length > 0 ? (
            <div className="space-y-3">
              {data.assignments.recent.map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 animate-slideIn" style={{ animationDelay: `${i * 50}ms` }}>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{a.asset?.name || 'Asset'}</p>
                    <p className="text-xs text-slate-500">{a.user?.name || 'User'} — {a.siteLocation || 'Unknown location'}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    a.checkedInAt ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {a.checkedInAt ? 'Returned' : 'Checked Out'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              No recent activity yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, trend }: any) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-600">{trend} this month</span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

function StatCardSmall({ label, value, icon: Icon, color, alert }: any) {
  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border ${alert ? 'border-red-200' : 'border-slate-100'} hover:shadow-md transition-shadow`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${alert ? 'animate-pulse-glow' : ''}`} style={{ background: `${color}15` }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          <p className="text-xs text-slate-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
