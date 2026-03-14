'use client';

import { useState, use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assetsApi, assignmentsApi } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Package, ChevronLeft, Calendar, FileText, Activity, MapPin, Search,
  ArrowUpRight, ArrowDownLeft, Camera, Shield, X, Loader2, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-700',
  in_use: 'bg-amber-100 text-amber-700',
  maintenance: 'bg-violet-100 text-violet-700',
  lost: 'bg-red-100 text-red-700',
  retired: 'bg-slate-100 text-slate-500',
};

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const assetId = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isCheckoutModal, setIsCheckoutModal] = useState(false);
  const [isCheckinModal, setIsCheckinModal] = useState(false);

  // checkout form
  const [siteLocation, setSiteLocation] = useState('');
  const [checkoutCondition, setCheckoutCondition] = useState('');
  const [checkoutNotes, setCheckoutNotes] = useState('');

  // checkin form
  const [returnCondition, setReturnCondition] = useState('');
  const [returnPhotoUrl, setReturnPhotoUrl] = useState('');
  const [checkinNotes, setCheckinNotes] = useState('');

  const { data: assetData, isLoading: assetLoading } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => assetsApi.get(assetId).then(r => r.data?.data),
  });

  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['assignments', assetId],
    queryFn: () => assignmentsApi.findByAsset(assetId).then(r => r.data),
  });

  const checkoutMut = useMutation({
    mutationFn: (data: any) => assignmentsApi.checkOut(data),
    onSuccess: () => {
      toast.success('Asset checked out!');
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
      queryClient.invalidateQueries({ queryKey: ['assignments', assetId] });
      setIsCheckoutModal(false);
      setSiteLocation(''); setCheckoutCondition(''); setCheckoutNotes('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Check-out failed'),
  });

  const checkinMut = useMutation({
    mutationFn: (data: any) => assignmentsApi.checkIn(data.id, data.payload),
    onSuccess: () => {
      toast.success('Asset checked in!');
      queryClient.invalidateQueries({ queryKey: ['asset', assetId] });
      queryClient.invalidateQueries({ queryKey: ['assignments', assetId] });
      setIsCheckinModal(false);
      setReturnCondition(''); setReturnPhotoUrl(''); setCheckinNotes('');
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Check-in failed'),
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    checkoutMut.mutate({ assetId, siteLocation, conditionOnCheckout: checkoutCondition, notes: checkoutNotes });
  };

  const handleCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    const activeAssignment = assignmentsData?.find((a: any) => !a.checkedInAt);
    if (!activeAssignment) return toast.error('No active assignment found');
    checkinMut.mutate({
      id: activeAssignment.id,
      payload: { conditionOnReturn: returnCondition, photoOnReturnUrl: returnPhotoUrl, notes: checkinNotes }
    });
  };

  if (assetLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>;
  if (!assetData) return <div className="p-8 text-center text-slate-500 font-medium">Asset not found.</div>;

  return (
    <div className="p-6 lg:p-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
        <Link href="/dashboard/assets" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">{assetData.name}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[assetData.status] || 'bg-slate-100 text-slate-500'}`}>
              {assetData.status?.replace('_', ' ')}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">SN: {assetData.serialNumber}</p>
        </div>
        
        {assetData.status === 'available' && (
          <button onClick={() => setIsCheckoutModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
            <ArrowUpRight className="w-4 h-4" /> Check-out
          </button>
        )}
        {assetData.status === 'in_use' && (
          <button onClick={() => setIsCheckinModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm">
            <ArrowDownLeft className="w-4 h-4" /> Check-in
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Details Column */}
        <div className="col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-blue-500" /> Asset Info
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Category</p>
                <p className="font-medium text-slate-900 capitalize">{assetData.category?.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Manufacturer</p>
                <p className="font-medium text-slate-900">{assetData.manufacturer || '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Purchase Value</p>
                <p className="font-medium text-slate-900">${assetData.purchaseValue ? Number(assetData.purchaseValue).toLocaleString() : '-'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Warranty Details</p>
                <p className="font-medium text-slate-900">{assetData.warrantyDetails || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Column */}
        <div className="col-span-2">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Assignment History
          </h3>
          <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm min-h-[400px]">
            {assignmentsLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
            ) : assignmentsData?.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-500 font-medium">No assignments found</p>
                <p className="text-sm text-slate-400 mt-1">Check out this asset to build history</p>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {assignmentsData.map((asg: any, i: number) => (
                  <div key={asg.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-50 text-slate-500 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      {asg.checkedInAt ? <ArrowDownLeft className="w-4 h-4 text-emerald-600" /> : <ArrowUpRight className="w-4 h-4 text-blue-600" />}
                    </div>
                    
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-slate-300 transition-colors">
                      <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>{new Date(asg.checkedOutAt).toLocaleDateString()}</span>
                        {asg.checkedInAt ? (
                          <span className="text-emerald-600 font-medium">In: {new Date(asg.checkedInAt).toLocaleDateString()}</span>
                        ) : (
                          <span className="text-amber-600 font-medium">Currently Out</span>
                        )}
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {asg.siteLocation}
                      </h4>
                      <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-lg">
                        <p><strong>Worker:</strong> {asg.user?.name || 'Unknown User'}</p>
                        <p><strong>Out Condition:</strong> {asg.conditionOnCheckout || '-'}</p>
                        {asg.checkedInAt && (
                          <>
                            <p><strong>In Condition:</strong> {asg.conditionOnReturn || '-'}</p>
                            {asg.photoOnReturn && (
                              <a href={asg.photoOnReturn} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded font-medium transition-colors">
                                <Camera className="w-3.5 h-3.5" /> View Return Photo
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slideUp">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-blue-600" /> Check-out Asset
              </h3>
              <button onClick={() => setIsCheckoutModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCheckout} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Site Location *</label>
                <input required value={siteLocation} onChange={e => setSiteLocation(e.target.value)} type="text" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="e.g. Block A, Site 42" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Initial Condition</label>
                <input value={checkoutCondition} onChange={e => setCheckoutCondition(e.target.value)} type="text" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="e.g. Good, fully charged" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                <textarea value={checkoutNotes} onChange={e => setCheckoutNotes(e.target.value)} rows={3} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="Optional notes..." />
              </div>
              <button disabled={checkoutMut.isPending} type="submit" className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                {checkoutMut.isPending ? 'Processing...' : 'Confirm Check-out'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Checkin Modal */}
      {isCheckinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slideUp">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-600" /> Check-in Asset
              </h3>
              <button onClick={() => setIsCheckinModal(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCheckin} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Return Condition</label>
                <input value={returnCondition} onChange={e => setReturnCondition(e.target.value)} type="text" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="e.g. Minor scratches, battery low" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Photo Return (URL)</label>
                <input value={returnPhotoUrl} onChange={e => setReturnPhotoUrl(e.target.value)} type="url" className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="https://..." />
                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1"><Camera className="w-3 h-3" /> Provide a link to the return photo (MVP)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                <textarea value={checkinNotes} onChange={e => setCheckinNotes(e.target.value)} rows={3} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400" placeholder="Optional notes..."/>
              </div>
              <button disabled={checkinMut.isPending} type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm">
                {checkinMut.isPending ? 'Processing...' : 'Confirm Check-in'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
