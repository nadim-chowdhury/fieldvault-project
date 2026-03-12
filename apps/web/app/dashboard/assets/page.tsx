'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Package, Plus, Search, Filter, QrCode, Pencil, Archive,
  ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-700',
  in_use: 'bg-amber-100 text-amber-700',
  maintenance: 'bg-violet-100 text-violet-700',
  lost: 'bg-red-100 text-red-700',
  retired: 'bg-slate-100 text-slate-500',
};

const categoryLabels: Record<string, string> = {
  power_tool: '⚡ Power Tool',
  hand_tool: '🔧 Hand Tool',
  heavy_equipment: '🚜 Heavy Equipment',
  safety_gear: '🦺 Safety Gear',
  measurement: '📐 Measurement',
  vehicle: '🚗 Vehicle',
  other: '📦 Other',
};

export default function AssetsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['assets', search, status, page],
    queryFn: () =>
      assetsApi.list({ search: search || undefined, status: status || undefined, page, limit: 12 })
        .then((r) => r.data?.data || r.data),
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => assetsApi.archive(id),
    onSuccess: () => {
      toast.success('Asset archived');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });

  const assets = data?.data || [];
  const meta = data?.meta;

  return (
    <div className="p-6 lg:p-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Assets</h1>
          <p className="text-slate-500 text-sm mt-1">Manage equipment, tools and machinery</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
          <Plus className="w-4 h-4" />
          Add Asset
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="in_use">In Use</option>
          <option value="maintenance">Maintenance</option>
          <option value="lost">Lost</option>
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : assets.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No assets found</p>
          <p className="text-sm text-slate-400 mt-1">Add your first asset to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {assets.map((asset: any, i: number) => (
            <div
              key={asset.id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 animate-fadeIn"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 truncate max-w-[180px]">{asset.name}</h3>
                    <p className="text-xs text-slate-500">{asset.serialNumber}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[asset.status] || 'bg-slate-100 text-slate-500'}`}>
                  {asset.status?.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Category</span>
                  <span className="text-slate-700 font-medium">{categoryLabels[asset.category] || asset.category}</span>
                </div>
                {asset.purchaseValue && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Value</span>
                    <span className="text-slate-700 font-medium">${Number(asset.purchaseValue).toLocaleString()}</span>
                  </div>
                )}
                {asset.manufacturer && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Manufacturer</span>
                    <span className="text-slate-700 font-medium">{asset.manufacturer}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                  <QrCode className="w-3.5 h-3.5" /> QR Code
                </button>
                <button
                  onClick={() => archiveMutation.mutate(asset.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" /> Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-500">
            Showing {((page - 1) * meta.limit) + 1}–{Math.min(page * meta.limit, meta.total)} of {meta.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-slate-700 font-medium px-2">{page} / {meta.totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!meta.hasNextPage}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
