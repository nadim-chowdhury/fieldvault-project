'use client';

import { useQuery } from '@tanstack/react-query';
import { auditLogsApi } from '@/lib/api';
import { useState } from 'react';
import { Shield, Clock, User, Package, Wrench, FileText, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const actionColors: Record<string, string> = {
  CREATE: 'bg-emerald-100 text-emerald-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
};

const entityIcons: Record<string, any> = {
  Asset: Package,
  MaintenanceLog: Wrench,
  User: User,
  Assignment: FileText,
};

export default function AuditLogsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => auditLogsApi.list({ limit: 100 }).then((r) => r.data?.data || r.data),
  });

  const rawLogs = data?.data || data;
  const logs = Array.isArray(rawLogs) ? rawLogs : [];

  return (
    <div className="p-6 lg:p-8 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-600" /> Audit Trail
        </h1>
        <p className="text-slate-500 text-sm mt-1">Complete history of all system changes — audit-ready compliance data</p>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Shield className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Audit-Ready Compliance</p>
          <p className="text-xs text-emerald-700 mt-0.5">Every create, update, and delete action is automatically logged with full before/after data snapshots for regulatory compliance.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-20">
          <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No audit logs yet</p>
          <p className="text-sm text-slate-400 mt-1">Actions will be logged automatically as you use the system</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Action</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Entity</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Timestamp</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log: any, i: number) => {
                const Icon = entityIcons[log.entityName] || FileText;
                const isExpanded = expandedId === log.id;

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer animate-fadeIn"
                    style={{ animationDelay: `${i * 15}ms` }}
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  >
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${actionColors[log.action] || 'bg-slate-100 text-slate-500'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{log.entityName}</p>
                          <p className="text-xs text-slate-400 font-mono">{log.entityId?.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <button className="text-xs text-blue-600 font-medium flex items-center gap-1 hover:text-blue-700 cursor-pointer">
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {isExpanded ? 'Hide' : 'View'} Changes
                      </button>
                      {isExpanded && (
                        <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                          {log.oldData && (
                            <div>
                              <p className="text-xs font-semibold text-red-600 mb-1">Before:</p>
                              <pre className="text-xs bg-red-50 text-red-800 p-2 rounded-lg overflow-x-auto max-h-32">
                                {JSON.stringify(log.oldData, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.newData && (
                            <div>
                              <p className="text-xs font-semibold text-emerald-600 mb-1">After:</p>
                              <pre className="text-xs bg-emerald-50 text-emerald-800 p-2 rounded-lg overflow-x-auto max-h-32">
                                {JSON.stringify(log.newData, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
