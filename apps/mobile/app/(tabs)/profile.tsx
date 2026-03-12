import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/lib/auth-store';

export default function ProfileTab() {
  const router = useRouter();
  const { user, company, logout } = useAuthStore();

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Profile</Text>
      </View>

      {/* User card */}
      <View style={s.userCard}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user?.name?.charAt(0)?.toUpperCase()}</Text>
        </View>
        <Text style={s.userName}>{user?.name}</Text>
        <Text style={s.userEmail}>{user?.email}</Text>
        <View style={s.roleBadge}>
          <Text style={s.roleText}>{user?.role}</Text>
        </View>
      </View>

      {/* Company */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Company</Text>
        <View style={s.row}>
          <Ionicons name="business" size={18} color="#64748b" />
          <Text style={s.rowText}>{company?.name}</Text>
        </View>
        <View style={s.row}>
          <Ionicons name="ribbon" size={18} color="#64748b" />
          <Text style={s.rowText}>{company?.plan} Plan</Text>
        </View>
      </View>

      {/* Settings */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Settings</Text>
        <TouchableOpacity style={s.row}>
          <Ionicons name="notifications-outline" size={18} color="#64748b" />
          <Text style={s.rowText}>Push Notifications</Text>
          <Ionicons name="chevron-forward" size={16} color="#334155" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        <TouchableOpacity style={s.row}>
          <Ionicons name="finger-print" size={18} color="#64748b" />
          <Text style={s.rowText}>Biometric Login</Text>
          <Ionicons name="chevron-forward" size={16} color="#334155" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={s.version}>FieldVault v1.0.0</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  userCard: { backgroundColor: '#1e293b', borderRadius: 20, margin: 20, padding: 24, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12, backgroundColor: '#6366f1' },
  avatarText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  userName: { fontSize: 20, fontWeight: '700', color: '#fff' },
  userEmail: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  roleBadge: { backgroundColor: '#172554', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 12 },
  roleText: { color: '#60a5fa', fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  section: { marginHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, padding: 14, gap: 12, marginBottom: 4 },
  rowText: { fontSize: 15, color: '#e2e8f0', fontWeight: '500' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#450a0a', borderRadius: 14, padding: 16, marginHorizontal: 20, marginTop: 8, gap: 8 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '700' },
  version: { textAlign: 'center', color: '#475569', fontSize: 13, marginTop: 20 },
});
