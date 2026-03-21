'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companiesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { toast } from 'sonner';
import {
  Settings, Building2, Globe, Phone, MapPin, Clock, CreditCard,
  Loader2, Save, Shield, Crown
} from 'lucide-react';

const planBadges: Record<string, { label: string; color: string; bg: string }> = {
  starter: { label: 'Starter', color: '#f59e0b', bg: '#fef3c7' },
  pro: { label: 'Pro', color: '#3b82f6', bg: '#dbeafe' },
  enterprise: { label: 'Enterprise', color: '#8b5cf6', bg: '#ede9fe' },
};

const timezones = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai',
  'Asia/Kolkata', 'Asia/Dubai', 'Australia/Sydney', 'Pacific/Auckland',
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { company: storeCompany } = useAuthStore();

  const { data: companyData, isLoading } = useQuery({
    queryKey: ['company-settings'],
    queryFn: () => companiesApi.getMyCompany().then((r) => r.data?.data || r.data),
  });

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    country: '',
    timezone: 'UTC',
  });

  useEffect(() => {
    if (companyData) {
      setForm({
        name: companyData.name || '',
        phone: companyData.phone || '',
        address: companyData.address || '',
        country: companyData.country || '',
        timezone: companyData.timezone || 'UTC',
      });
    }
  }, [companyData]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => companiesApi.update(data),
    onSuccess: () => {
      toast.success('Settings saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Failed to save settings');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  const company = companyData || storeCompany;
  const plan = planBadges[company?.plan] || planBadges.starter;

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 animate-fadeIn max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your company information and preferences</p>
      </div>

      {/* Plan Card */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: plan.bg }}>
              <Crown className="w-5 h-5" style={{ color: plan.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-900">{plan.label} Plan</h2>
                <span
                  className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                  style={{ background: plan.bg, color: plan.color }}
                >
                  Active
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {company?.trialEndsAt
                  ? `Trial ends ${new Date(company.trialEndsAt).toLocaleDateString()}`
                  : 'Full access to all features'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Company ID</p>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{company?.slug || '—'}</p>
          </div>
        </div>
      </div>

      {/* Company Info Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-6">
            <Building2 className="w-4 h-4 text-blue-500" /> Company Information
          </h3>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> Country</span>
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900"
                  placeholder="United States"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Address</span>
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm text-slate-900"
                placeholder="123 Main St, Suite 200, City, State 12345"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Timezone</span>
              </label>
              <select
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-slate-900"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 mb-6">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-emerald-500" /> Security
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-slate-600">Data Encryption</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> AES-256 Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-slate-600">Multi-Tenant Isolation</span>
              <span className="text-emerald-600 font-medium">● Enabled</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-slate-600">Member Since</span>
              <span className="text-slate-900 font-medium">
                {company?.createdAt ? new Date(company.createdAt).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full py-3 rounded-lg text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all disabled:opacity-60 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Settings
            </>
          )}
        </button>
      </form>
    </div>
  );
}
