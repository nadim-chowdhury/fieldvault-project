'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { toast } from 'sonner';
import { Users, UserPlus, Shield, Trash2, Loader2, X, Mail } from 'lucide-react';

const roleColors: Record<string, string> = {
  admin: 'bg-violet-100 text-violet-700',
  supervisor: 'bg-blue-100 text-blue-700',
  worker: 'bg-slate-100 text-slate-600',
};

const roleDescriptions: Record<string, string> = {
  admin: 'Full access — billing, team, all modules',
  supervisor: 'Manage assets, assignments, maintenance',
  worker: 'View assets, scan QR, check out/in',
};

export default function TeamPage() {
  const queryClient = useQueryClient();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'worker',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then((r) => r.data?.data || r.data),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      toast.success('User removed');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (data: { name: string; email: string; role: string }) => usersApi.invite(data),
    onSuccess: () => {
      toast.success(`Invitation sent to ${inviteForm.email}`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsInviteOpen(false);
      setInviteForm({ name: '', email: '', role: 'worker' });
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Failed to send invitation');
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate(inviteForm);
  };

  const rawUsers = data?.data || data;
  const users = Array.isArray(rawUsers) ? rawUsers : [];

  return (
    <div className="p-6 lg:p-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Team</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your crew and access roles</p>
        </div>
        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-semibold shadow-sm hover:shadow-md transition-all cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No team members yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Member</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Last Login</th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user: any, i: number) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors animate-fadeIn" style={{ animationDelay: `${i * 30}ms` }}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${roleColors[user.role] || 'bg-slate-100 text-slate-500'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium ${user.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {user.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => removeMutation.mutate(user.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slideUp">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Invite Team Member
              </h3>
              <button onClick={() => setIsInviteOpen(false)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
                <input
                  required
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400"
                  placeholder="e.g. John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
                <input
                  required
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm placeholder:text-slate-400"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role *</label>
                <div className="space-y-2">
                  {['admin', 'supervisor', 'worker'].map((role) => (
                    <label
                      key={role}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        inviteForm.role === role
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={inviteForm.role === role}
                        onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900 capitalize">{role}</p>
                        <p className="text-xs text-slate-500">{roleDescriptions[role]}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
                <Mail className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">An invitation email with login credentials will be sent to the team member.</p>
              </div>

              <button
                disabled={inviteMutation.isPending}
                type="submit"
                className="w-full py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
              >
                {inviteMutation.isPending ? 'Sending Invitation...' : 'Send Invitation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
