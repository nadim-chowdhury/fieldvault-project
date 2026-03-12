import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';

export default function DashboardTab() {
  const { user, company } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await dashboardApi.getStats();
      setData(res.data?.data || res.data);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchStats(); }, []);

  const stats = data?.assets;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>Welcome back,</Text>
          <Text style={s.name}>{user?.name} 👋</Text>
        </View>
        <View style={s.companyBadge}>
          <Text style={s.companyText}>{company?.name}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} tintColor="#2563eb" />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Main stats */}
            <View style={s.statsGrid}>
              <StatCard icon="cube" label="Total Assets" value={stats?.total ?? 0} color="#2563eb" />
              <StatCard icon="checkmark-circle" label="Available" value={stats?.available ?? 0} color="#10b981" />
              <StatCard icon="time" label="In Use" value={stats?.inUse ?? 0} color="#f59e0b" />
              <StatCard icon="cash" label="Value" value={`$${((stats?.totalValue ?? 0) / 1000).toFixed(0)}K`} color="#6366f1" />
            </View>

            {/* Alerts */}
            {data?.maintenance?.overdue > 0 && (
              <View style={s.alertCard}>
                <Ionicons name="warning" size={20} color="#ef4444" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={s.alertTitle}>{data.maintenance.overdue} Overdue Maintenance</Text>
                  <Text style={s.alertDesc}>Items need immediate attention</Text>
                </View>
              </View>
            )}

            {/* Quick stats row */}
            <View style={s.quickRow}>
              <View style={s.quickItem}>
                <Text style={s.quickValue}>{data?.team?.totalUsers ?? 0}</Text>
                <Text style={s.quickLabel}>Team Members</Text>
              </View>
              <View style={[s.quickItem, { borderLeftWidth: 1, borderLeftColor: '#1e293b' }]}>
                <Text style={s.quickValue}>{data?.assignments?.active ?? 0}</Text>
                <Text style={s.quickLabel}>Active Checkouts</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
  return (
    <View style={s.statCard}>
      <View style={[s.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  greeting: { fontSize: 14, color: '#94a3b8' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },
  companyBadge: { backgroundColor: '#1e293b', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  companyText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  statCard: { width: '47%', backgroundColor: '#1e293b', borderRadius: 16, padding: 16 },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#450a0a', borderRadius: 14, padding: 16, marginTop: 16, borderWidth: 1, borderColor: '#7f1d1d' },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#fca5a5' },
  alertDesc: { fontSize: 12, color: '#dc2626', marginTop: 2 },
  quickRow: { flexDirection: 'row', backgroundColor: '#1e293b', borderRadius: 16, marginTop: 16 },
  quickItem: { flex: 1, padding: 20, alignItems: 'center' },
  quickValue: { fontSize: 28, fontWeight: '800', color: '#fff' },
  quickLabel: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
});
