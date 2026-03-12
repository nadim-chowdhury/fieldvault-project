'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { toast } from 'sonner';
import { Bell, CheckCheck, AlertTriangle, Package, Wrench, Info, Loader2 } from 'lucide-react';

const typeIcons: Record<string, any> = {
  maintenance_due: Wrench,
  asset_checked_out: Package,
  asset_checked_in: Package,
  system: Info,
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then((r) => r.data?.data || r.data),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = Array.isArray(data) ? data : [];

  return (
    <div className="p-6 lg:p-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">Stay updated on equipment and maintenance</p>
        </div>
        {notifications.some((n: any) => !n.isRead) && (
          <button
            onClick={() => markAllMutation.mutate()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No notifications yet</p>
          <p className="text-sm text-slate-400 mt-1">You'll be notified about important updates</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any, i: number) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <div
                key={n.id}
                onClick={() => !n.isRead && markOneMutation.mutate(n.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer animate-fadeIn ${
                  n.isRead
                    ? 'bg-white border-slate-100 opacity-60'
                    : 'bg-blue-50/50 border-blue-100 hover:bg-blue-50'
                }`}
                style={{ animationDelay: `${i * 20}ms` }}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${n.isRead ? 'bg-slate-100' : 'bg-blue-100'}`}>
                  <Icon className={`w-4.5 h-4.5 ${n.isRead ? 'text-slate-400' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${n.isRead ? 'text-slate-500' : 'text-slate-900'}`}>{n.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
