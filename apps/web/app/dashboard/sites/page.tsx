'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sitesApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  MapPin, Plus, Pencil, Trash2, Loader2, X, Building,
  Globe, Navigation, FileText
} from 'lucide-react';

export default function SitesPage() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editSite, setEditSite] = useState<any | null>(null);

  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    notes: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: () => sitesApi.list().then((r) => r.data?.data || r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => sitesApi.create(data),
    onSuccess: () => {
      toast.success('Site created successfully!');
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setIsAddOpen(false);
      resetForm();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to create site'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => sitesApi.update(id, data),
    onSuccess: () => {
      toast.success('Site updated!');
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setEditSite(null);
      resetForm();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed to update site'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sitesApi.remove(id),
    onSuccess: () => {
      toast.success('Site removed');
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });

  const resetForm = () => setForm({ name: '', address: '', latitude: '', longitude: '', notes: '' });

  const openEdit = (site: any) => {
    setForm({
      name: site.name || '',
      address: site.address || '',
      latitude: site.latitude ? String(site.latitude) : '',
      longitude: site.longitude ? String(site.longitude) : '',
      notes: site.notes || '',
    });
    setEditSite(site);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { name: form.name };
    if (form.address) payload.address = form.address;
    if (form.latitude) payload.latitude = Number(form.latitude);
    if (form.longitude) payload.longitude = Number(form.longitude);
    if (form.notes) payload.notes = form.notes;

    if (editSite) {
      updateMutation.mutate({ id: editSite.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const sites = Array.isArray(data) ? data : (data?.data || []);

  return (
    <div className="p-6 lg:p-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sites</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your construction sites and locations</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsAddOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
        >
          <Plus className="w-4 h-4" />
          Add Site
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : sites.length === 0 ? (
        <div className="text-center py-20">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No sites added yet</p>
          <p className="text-sm text-slate-400 mt-1">Add your first construction site to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site: any, i: number) => (
            <div
              key={site.id}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all animate-fadeIn"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{site.name}</h3>
                    {site.address && (
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {site.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {site.notes && (
                <p className="text-xs text-slate-500 mb-3 flex items-start gap-1">
                  <FileText className="w-3 h-3 mt-0.5 shrink-0" /> {site.notes}
                </p>
              )}

              {(site.latitude || site.longitude) && (
                <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
                  <Navigation className="w-3 h-3" />
                  {site.latitude}, {site.longitude}
                </div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => openEdit(site)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => deleteMutation.mutate(site.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Site Modal */}
      {(isAddOpen || editSite) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slideUp">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" /> {editSite ? 'Edit Site' : 'Add New Site'}
              </h3>
              <button onClick={() => { setIsAddOpen(false); setEditSite(null); resetForm(); }} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Site Name *</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="e.g. Downtown Tower — Block A" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="123 Main St, City" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Latitude</label>
                  <input value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} type="number" step="any" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="40.7128" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Longitude</label>
                  <input value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} type="number" step="any" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="-74.0060" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="Optional site notes..." />
              </div>
              <button
                disabled={createMutation.isPending || updateMutation.isPending}
                type="submit"
                className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : editSite ? 'Save Changes' : 'Create Site'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
