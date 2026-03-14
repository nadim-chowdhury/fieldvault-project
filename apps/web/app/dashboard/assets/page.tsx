'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Package, Plus, Search, Filter, QrCode, Pencil, Archive,
  ChevronLeft, ChevronRight, Loader2, Printer, X, Download
} from 'lucide-react';
import Link from 'next/link';

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
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [qrModalAsset, setQrModalAsset] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Asset Form State
  const [addForm, setAddForm] = useState({
    name: '',
    serialNumber: '',
    category: 'power_tool',
    purchaseValue: '',
    manufacturer: '',
    warrantyDetails: '',
  });

  const { data: qrData, isLoading: qrLoading } = useQuery({
    queryKey: ['asset-qr', qrModalAsset?.id],
    queryFn: () => assetsApi.getQrCode(qrModalAsset.id, 'svg').then(r => r.data?.data),
    enabled: !!qrModalAsset,
  });

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

  const createMutation = useMutation({
    mutationFn: (data: any) => assetsApi.create(data),
    onSuccess: () => {
      toast.success('Asset created successfully!');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setIsAddModalOpen(false);
      setAddForm({ name: '', serialNumber: '', category: 'power_tool', purchaseValue: '', manufacturer: '', warrantyDetails: '' });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Failed to create asset');
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      name: addForm.name,
      serialNumber: addForm.serialNumber,
      category: addForm.category,
    };
    if (addForm.purchaseValue) payload.purchaseValue = Number(addForm.purchaseValue);
    if (addForm.manufacturer) payload.manufacturer = addForm.manufacturer;
    if (addForm.warrantyDetails) payload.notes = `Warranty Details: ${addForm.warrantyDetails}`;

    createMutation.mutate(payload);
  };

  const handleSelect = (id: string) => {
    setSelectedAssets(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  };

  const handleBulkPrint = async () => {
    if (!selectedAssets.length) return;
    try {
      toast.loading('Generating Print Sheet...', { id: 'bulk-qr' });
      const res = await assetsApi.getBulkQrCodes(selectedAssets);
      const blob = new Blob([res.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
      toast.success('Print sheet opened!', { id: 'bulk-qr' });
      setSelectedAssets([]);
    } catch (e: any) {
      toast.error('Failed to generate sheet', { id: 'bulk-qr' });
    }
  };

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
        <div className="flex items-center gap-3">
          {selectedAssets.length > 0 && (
            <button onClick={handleBulkPrint} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-colors cursor-pointer">
              <Printer className="w-4 h-4" />
              Print QR ({selectedAssets.length})
            </button>
          )}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer" 
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            <Plus className="w-4 h-4" />
            Add Asset
          </button>
        </div>
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
                  <div className="pt-0.5">
                    <input 
                      type="checkbox" 
                      checked={selectedAssets.includes(asset.id)} 
                      onChange={() => handleSelect(asset.id)} 
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                    />
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <Link href={`/dashboard/assets/${asset.id}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors truncate max-w-[180px] block">
                      {asset.name}
                    </Link>
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
                <button 
                  onClick={() => setQrModalAsset(asset)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                >
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

      {/* QR Code Modal */}
      {qrModalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-slideUp">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">Asset Label</h3>
              <button 
                onClick={() => setQrModalAsset(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="text-center mb-6">
                <p className="font-bold text-lg text-slate-900">{qrModalAsset.name}</p>
                <p className="text-sm text-slate-500">SN: {qrModalAsset.serialNumber}</p>
              </div>
              
              <div className="w-48 h-48 bg-slate-50 rounded-xl mb-6 flex items-center justify-center border border-slate-100 p-2">
                {qrLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                ) : qrData?.qrCode ? (
                  <div dangerouslySetInnerHTML={{ __html: qrData.qrCode }} className="w-full h-full [&>svg]:w-full [&>svg]:h-full" />
                ) : (
                  <p className="text-sm text-slate-400">Failed to load</p>
                )}
              </div>

              <div className="w-full flex gap-3">
                <button 
                  onClick={() => {
                    if (!qrData?.qrCode) return;
                    const blob = new Blob([qrData.qrCode], { type: 'image/svg+xml' });
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `qr-${qrModalAsset.id}.svg`;
                    link.click();
                    window.URL.revokeObjectURL(url);
                  }}
                  disabled={qrLoading || !qrData?.qrCode}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download SVG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slideUp">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Track New Asset
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Asset Name *</label>
                  <input required value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} type="text" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="e.g. DeWalt Hammer Drill" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Serial Number *</label>
                  <input required value={addForm.serialNumber} onChange={e => setAddForm({...addForm, serialNumber: e.target.value})} type="text" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="SN-12345" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                  <select required value={addForm.category} onChange={e => setAddForm({...addForm, category: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Purchase Value ($)</label>
                  <input value={addForm.purchaseValue} onChange={e => setAddForm({...addForm, purchaseValue: e.target.value})} type="number" step="0.01" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="e.g. 299.99" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Manufacturer</label>
                  <input value={addForm.manufacturer} onChange={e => setAddForm({...addForm, manufacturer: e.target.value})} type="text" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="e.g. DeWalt" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Warranty Details</label>
                  <input value={addForm.warrantyDetails} onChange={e => setAddForm({...addForm, warrantyDetails: e.target.value})} type="text" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="e.g. 3 years manufacturer warranty until 2029" />
                </div>
              </div>
              <button disabled={createMutation.isPending} type="submit" className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm mt-2">
                {createMutation.isPending ? 'Saving Asset...' : 'Save Asset'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
