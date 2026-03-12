'use client';

import { useQuery } from '@tanstack/react-query';
import { maintenanceApi } from '@/lib/api';
import { Wrench, AlertTriangle, CheckCircle2, Clock, Plus, Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  scheduled: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

const typeLabels: Record<string, string> = {
  routine_service: 'Routine Service',
  safety_inspection: 'Safety Inspection',
  repair: 'Repair',
  calibration: 'Calibration',
};

export default function MaintenancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => maintenanceApi.list().then((r) => r.data?.data || r.data),
  });

  const { data: overdueData } = useQuery({
    queryKey: ['maintenance-overdue'],
    queryFn: () => maintenanceApi.listOverdue().then((r) => r.data?.data || r.data),
  });

  const logs = Array.isArray(data) ? data : [];
  const overdue = Array.isArray(overdueData) ? overdueData : [];

  return (
    <div className="p-6 lg:p-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance</h1>
          <p className="text-slate-500 text-sm mt-1">Schedule inspections and track service history</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
          <Plus className="w-4 h-4" />
          Schedule Maintenance
        </button>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">{overdue.length} Overdue Maintenance Item{overdue.length > 1 ? 's' : ''}</p>
            <p className="text-xs text-red-600 mt-0.5">These items require immediate attention to maintain compliance.</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No maintenance scheduled</p>
          <p className="text-sm text-slate-400 mt-1">Schedule your first maintenance task</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log: any, i: number) => {
            const isOverdue = log.status === 'scheduled' && new Date(log.scheduledDate) < new Date();
            return (
              <div
                key={log.id}
                className={`bg-white rounded-xl border p-5 animate-fadeIn transition-all hover:shadow-sm ${isOverdue ? 'border-red-200' : 'border-slate-100'}`}
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOverdue ? 'bg-red-100' : 'bg-violet-50'}`}>
                      {isOverdue ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <Wrench className="w-5 h-5 text-violet-600" />}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{log.asset?.name || 'Asset'}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{typeLabels[log.type] || log.type}</p>
                      {log.description && <p className="text-xs text-slate-400 mt-1">{log.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[log.status] || 'bg-slate-100 text-slate-500'}`}>
                      {log.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Scheduled: {new Date(log.scheduledDate).toLocaleDateString()}
                  </div>
                  {log.completedAt && (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed: {new Date(log.completedAt).toLocaleDateString()}
                    </div>
                  )}
                  {log.cost && <span>Cost: ${Number(log.cost).toLocaleString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
