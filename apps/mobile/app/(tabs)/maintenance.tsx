import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { maintenanceApi } from '@/lib/api';

const statusColors: Record<string, { bg: string; text: string }> = {
  scheduled: { bg: '#78350f', text: '#fde68a' },
  in_progress: { bg: '#1e3a5f', text: '#93c5fd' },
  completed: { bg: '#065f46', text: '#6ee7b7' },
  overdue: { bg: '#7f1d1d', text: '#fca5a5' },
  cancelled: { bg: '#334155', text: '#94a3b8' },
};

const typeLabels: Record<string, string> = {
  routine_service: 'Routine Service',
  safety_inspection: 'Safety Inspection',
  repair: 'Repair',
  calibration: 'Calibration',
  certification: 'Certification',
};

export default function MaintenanceTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overdueCount, setOverdueCount] = useState(0);

  const fetchMaintenance = useCallback(async () => {
    try {
      const [logsRes, overdueRes] = await Promise.all([
        maintenanceApi.list({ limit: 50 }),
        maintenanceApi.listOverdue(),
      ]);

      const logsData = logsRes.data?.data || logsRes.data;
      const rawLogs = logsData?.data || logsData;
      setLogs(Array.isArray(rawLogs) ? rawLogs : []);

      const overdueData = overdueRes.data?.data || overdueRes.data;
      setOverdueCount(Array.isArray(overdueData) ? overdueData.length : 0);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchMaintenance(); }, [fetchMaintenance]);

  const renderItem = ({ item }: { item: any }) => {
    const isOverdue = item.status === 'scheduled' && new Date(item.scheduledDate) < new Date();
    const sc = isOverdue
      ? statusColors.overdue
      : statusColors[item.status] || { bg: '#334155', text: '#94a3b8' };

    return (
      <View style={s.card}>
        <View style={s.cardTop}>
          <View style={[s.iconWrap, { backgroundColor: isOverdue ? '#450a0a' : '#1e1b4b' }]}>
            <Ionicons
              name={isOverdue ? 'warning' : 'construct'}
              size={18}
              color={isOverdue ? '#ef4444' : '#a78bfa'}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.assetName} numberOfLines={1}>{item.asset?.name || 'Asset'}</Text>
            <Text style={s.typeLabel}>{typeLabels[item.type] || item.type}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[s.statusText, { color: sc.text }]}>
              {isOverdue ? 'overdue' : item.status?.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {item.description && (
          <Text style={s.description} numberOfLines={2}>{item.description}</Text>
        )}

        <View style={s.cardFooter}>
          <View style={s.footerItem}>
            <Ionicons name="calendar-outline" size={14} color="#64748b" />
            <Text style={s.footerText}>
              {new Date(item.scheduledDate).toLocaleDateString()}
            </Text>
          </View>
          {item.completedAt && (
            <View style={s.footerItem}>
              <Ionicons name="checkmark-circle" size={14} color="#10b981" />
              <Text style={[s.footerText, { color: '#10b981' }]}>
                {new Date(item.completedAt).toLocaleDateString()}
              </Text>
            </View>
          )}
          {item.cost && (
            <Text style={s.footerText}>${Number(item.cost).toLocaleString()}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Maintenance</Text>
        <Text style={s.subtitle}>Inspections & service history</Text>
      </View>

      {/* Overdue alert */}
      {overdueCount > 0 && (
        <View style={s.alertCard}>
          <Ionicons name="warning" size={20} color="#ef4444" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={s.alertTitle}>{overdueCount} Overdue Item{overdueCount > 1 ? 's' : ''}</Text>
            <Text style={s.alertDesc}>Require immediate attention</Text>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={logs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchMaintenance(); }}
              tintColor="#2563eb"
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="construct-outline" size={48} color="#334155" />
              <Text style={s.emptyText}>No maintenance tasks</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  alertCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#450a0a',
    borderRadius: 14, padding: 16, marginHorizontal: 20, marginTop: 12,
    borderWidth: 1, borderColor: '#7f1d1d',
  },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#fca5a5' },
  alertDesc: { fontSize: 12, color: '#dc2626', marginTop: 2 },
  list: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12 },
  card: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  assetName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  typeLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  description: { fontSize: 13, color: '#94a3b8', marginTop: 10, lineHeight: 18 },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#334155',
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: '#64748b' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#64748b', fontSize: 15, marginTop: 12 },
});
