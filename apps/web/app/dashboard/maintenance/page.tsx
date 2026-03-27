'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi, assetsApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Wrench, AlertTriangle, CheckCircle2, Clock, Plus, Loader2, X,
  Trash2, RotateCcw
} from 'lucide-react';

const statusColors: Record<string, string> = {
  scheduled: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

const typeLabels: Record<string, string> = {
  routine_service: 'Routine Service',
  safety_inspection: 'Safety Inspection',
  repair: 'Repair',
  calibration: 'Calibration',
  certification: 'Certification',
};

export default function MaintenancePage() {
  const queryClient = useQueryClient();
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [completeId, setCompleteId] = useState<string | null>(null);

  // Schedule form state
  const [schedForm, setSchedForm] = useState({
    assetId: '',
    type: 'routine_service',
    scheduledDate: '',
    description: '',
    cost: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => maintenanceApi.list({ limit: 50 }).then((r) => r.data?.data || r.data),
  });

  const { data: overdueData } = useQuery({
    queryKey: ['maintenance-overdue'],
    queryFn: () => maintenanceApi.listOverdue().then((r) => r.data?.data || r.data),
  });

  // Fetch assets for the dropdown
  const { data: assetsData } = useQuery({
    queryKey: ['assets-for-maintenance'],
    queryFn: () => assetsApi.list({ limit: 100 }).then((r) => r.data?.data || r.data),
    enabled: isScheduleOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => maintenanceApi.create(data),
    onSuccess: () => {
      toast.success('Maintenance scheduled successfully!');
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-overdue'] });
      setIsScheduleOpen(false);
      setSchedForm({ assetId: '', type: 'routine_service', scheduledDate: '', description: '', cost: '' });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Failed to schedule maintenance');
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) =>
      maintenanceApi.update(id, {
        status: 'completed' as any,
        completedAt: new Date().toISOString(),
      }),
    onSuccess: () => {
      toast.success('Maintenance marked as complete!');
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-overdue'] });
      setCompleteId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => maintenanceApi.remove(id),
    onSuccess: () => {
      toast.success('Maintenance task removed');
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-overdue'] });
    },
  });

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      assetId: schedForm.assetId,
      type: schedForm.type,
      scheduledDate: schedForm.scheduledDate,
    };
    if (schedForm.description) payload.description = schedForm.description;
    if (schedForm.cost) payload.cost = Number(schedForm.cost);
    createMutation.mutate(payload);
  };

  const rawLogs = data?.data || data;
  const logs = Array.isArray(rawLogs) ? rawLogs : [];
  const overdue = Array.isArray(overdueData) ? overdueData : [];

  return (
    <div className="p-6 lg:p-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance</h1>
          <p className="text-slate-500 text-sm mt-1">Schedule inspections and track service history</p>
        </div>
        <button
          onClick={() => setIsScheduleOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
        >
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
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
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
                  <div className="flex items-center gap-1">
                    {log.status !== 'completed' && log.status !== 'cancelled' && (
                      <button
                        onClick={() => completeMutation.mutate(log.id)}
                        className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Mark Complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteMutation.mutate(log.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Maintenance Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slideUp">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-violet-600" /> Schedule Maintenance
              </h3>
              <button onClick={() => setIsScheduleOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSchedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Asset *</label>
                <select
                  required
                  value={schedForm.assetId}
                  onChange={(e) => setSchedForm({ ...schedForm, assetId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                >
                  <option value="">Select an asset...</option>
                  {(Array.isArray(assetsData) ? assetsData : []).map((asset: any) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} — {asset.serialNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Type *</label>
                  <select
                    required
                    value={schedForm.type}
                    onChange={(e) => setSchedForm({ ...schedForm, type: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                  >
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Scheduled Date *</label>
                  <input
                    required
                    type="date"
                    value={schedForm.scheduledDate}
                    onChange={(e) => setSchedForm({ ...schedForm, scheduledDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={schedForm.description}
                  onChange={(e) => setSchedForm({ ...schedForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400"
                  placeholder="e.g. Quarterly oil change and safety inspection"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Estimated Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={schedForm.cost}
                  onChange={(e) => setSchedForm({ ...schedForm, cost: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400"
                  placeholder="e.g. 150.00"
                />
              </div>

              <button
                disabled={createMutation.isPending}
                type="submit"
                className="w-full py-2.5 bg-violet-600 text-white font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-sm mt-2 cursor-pointer"
              >
                {createMutation.isPending ? 'Scheduling...' : 'Schedule Maintenance'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
