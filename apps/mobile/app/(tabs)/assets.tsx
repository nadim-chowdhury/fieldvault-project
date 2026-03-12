import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { assetsApi } from '@/lib/api';

const statusColors: Record<string, { bg: string; text: string }> = {
  available: { bg: '#065f46', text: '#6ee7b7' },
  in_use: { bg: '#78350f', text: '#fde68a' },
  maintenance: { bg: '#3730a3', text: '#c4b5fd' },
  lost: { bg: '#7f1d1d', text: '#fca5a5' },
};

export default function AssetsTab() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await assetsApi.list({ search: search || undefined, limit: 50 });
      const d = res.data?.data || res.data;
      setAssets(d?.data || d || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [search]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const renderAsset = ({ item }: { item: any }) => {
    const sc = statusColors[item.status] || { bg: '#334155', text: '#94a3b8' };
    return (
      <View style={s.assetCard}>
        <View style={s.assetTop}>
          <View style={s.assetIconWrap}>
            <Ionicons name="cube" size={18} color="#2563eb" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.assetName} numberOfLines={1}>{item.name}</Text>
            <Text style={s.assetSerial}>{item.serialNumber}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[s.statusText, { color: sc.text }]}>{item.status?.replace('_', ' ')}</Text>
          </View>
        </View>
        <View style={s.assetDetails}>
          <View style={s.detailItem}>
            <Text style={s.detailLabel}>Category</Text>
            <Text style={s.detailValue}>{item.category?.replace('_', ' ')}</Text>
          </View>
          {item.purchaseValue && (
            <View style={s.detailItem}>
              <Text style={s.detailLabel}>Value</Text>
              <Text style={s.detailValue}>${Number(item.purchaseValue).toLocaleString()}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Assets</Text>
      </View>

      <View style={s.searchWrap}>
        <Ionicons name="search" size={18} color="#64748b" style={{ marginRight: 8 }} />
        <TextInput
          style={s.searchInput}
          placeholder="Search assets..."
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={assets}
          renderItem={renderAsset}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAssets(); }} tintColor="#2563eb" />}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="cube-outline" size={48} color="#334155" />
              <Text style={s.emptyText}>No assets found</Text>
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
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, marginHorizontal: 20, marginVertical: 12, paddingHorizontal: 14, paddingVertical: 12 },
  searchInput: { flex: 1, fontSize: 15, color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  assetCard: { backgroundColor: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 12 },
  assetTop: { flexDirection: 'row', alignItems: 'center' },
  assetIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#172554', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  assetName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  assetSerial: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  assetDetails: { flexDirection: 'row', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#334155', gap: 20 },
  detailItem: {},
  detailLabel: { fontSize: 11, color: '#64748b' },
  detailValue: { fontSize: 13, color: '#e2e8f0', fontWeight: '600', marginTop: 2, textTransform: 'capitalize' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#64748b', fontSize: 15, marginTop: 12 },
});
