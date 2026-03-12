'use client';

import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { FileText, Download, Shield, Package, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ReportsPage() {
  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ['reports-audit'],
    queryFn: () => reportsApi.auditReport(12).then((r) => r.data?.data || r.data),
  });

  const { data: inventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ['reports-inventory'],
    queryFn: () => reportsApi.inventoryReport().then((r) => r.data?.data || r.data),
  });

  return (
    <div className="p-6 lg:p-8 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 text-sm mt-1">Audit compliance and asset inventory reports</p>
      </div>

      {/* Audit Report Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Audit Compliance Report</h2>
              <p className="text-sm text-slate-500">Last 12 months maintenance & inspection data</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-colors cursor-pointer">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>

        {auditLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
          </div>
        ) : auditData?.summary ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-slate-900">{auditData.summary.totalAssets}</p>
              <p className="text-xs text-slate-500 mt-1">Total Assets</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50">
              <p className="text-2xl font-bold text-slate-900">{auditData.summary.totalMaintenanceLogs}</p>
              <p className="text-xs text-slate-500 mt-1">Maintenance Records</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-50">
              <p className="text-2xl font-bold text-emerald-700">{auditData.summary.complianceRate}</p>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Compliance Rate
              </p>
            </div>
            <div className={`p-4 rounded-lg ${auditData.summary.overdueMaintenance > 0 ? 'bg-red-50' : 'bg-slate-50'}`}>
              <p className={`text-2xl font-bold ${auditData.summary.overdueMaintenance > 0 ? 'text-red-700' : 'text-slate-900'}`}>
                {auditData.summary.overdueMaintenance}
              </p>
              <p className={`text-xs mt-1 flex items-center gap-1 ${auditData.summary.overdueMaintenance > 0 ? 'text-red-600' : 'text-slate-500'}`}>
                {auditData.summary.overdueMaintenance > 0 && <AlertTriangle className="w-3 h-3" />}
                Overdue Items
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-4">No audit data available</p>
        )}
      </div>

      {/* Inventory Report Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Asset Inventory</h2>
              <p className="text-sm text-slate-500">Equipment grouped by category</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {inventoryLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
          </div>
        ) : inventoryData?.byCategory ? (
          <div className="space-y-3">
            {Object.entries(inventoryData.byCategory).map(([category, assets]: [string, any]) => (
              <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700 capitalize">{category.replace('_', ' ')}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{assets.length}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 py-4">No inventory data available</p>
        )}
      </div>
    </div>
  );
}
