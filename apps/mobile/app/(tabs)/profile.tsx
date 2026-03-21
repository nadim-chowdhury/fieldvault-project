import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/lib/auth-store';
import { authApi } from '@/lib/api';
import { useOfflineStatus } from '@/lib/offline-sync';

export default function ProfileTab() {
  const router = useRouter();
  const { user, company, logout } = useAuthStore();
  const { isOnline, pendingCount, syncNow } = useOfflineStatus();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

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

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to change password');
    }
    setChangingPassword(false);
  };

  const handleSync = async () => {
    const result = await syncNow();
    Alert.alert(
      'Sync Complete',
      `${result.synced} item${result.synced !== 1 ? 's' : ''} synced${result.failed > 0 ? `, ${result.failed} failed` : ''}`
    );
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={s.header}>
        <Text style={s.title}>Profile</Text>
      </View>

      {/* Online/Offline Status Banner */}
      <View style={[s.statusBanner, { backgroundColor: isOnline ? '#065f46' : '#78350f' }]}>
        <Ionicons
          name={isOnline ? 'cloud-done' : 'cloud-offline'}
          size={18}
          color={isOnline ? '#6ee7b7' : '#fde68a'}
        />
        <Text style={[s.statusText, { color: isOnline ? '#6ee7b7' : '#fde68a' }]}>
          {isOnline ? 'Online' : 'Offline'}
          {pendingCount > 0 ? ` · ${pendingCount} pending` : ''}
        </Text>
        {pendingCount > 0 && isOnline && (
          <TouchableOpacity onPress={handleSync} style={s.syncBtn}>
            <Ionicons name="sync" size={16} color="#fff" />
            <Text style={s.syncBtnText}>Sync</Text>
          </TouchableOpacity>
        )}
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

      {/* Security */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Security</Text>
        <TouchableOpacity
          style={s.row}
          onPress={() => setShowPasswordForm(!showPasswordForm)}
        >
          <Ionicons name="lock-closed-outline" size={18} color="#64748b" />
          <Text style={s.rowText}>Change Password</Text>
          <Ionicons
            name={showPasswordForm ? 'chevron-up' : 'chevron-forward'}
            size={16}
            color="#334155"
            style={{ marginLeft: 'auto' }}
          />
        </TouchableOpacity>

        {showPasswordForm && (
          <View style={s.passwordForm}>
            <TextInput
              style={s.input}
              placeholder="Current Password"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={s.input}
              placeholder="New Password"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={s.input}
              placeholder="Confirm New Password"
              placeholderTextColor="#64748b"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={s.changePasswordBtn}
              onPress={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.changePasswordBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginTop: 12, padding: 12,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  statusText: { fontSize: 14, fontWeight: '600' },
  syncBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginLeft: 'auto', backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  syncBtnText: { color: '#fff', fontSize: 12, fontWeight: '600' },
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
  passwordForm: { backgroundColor: '#1e293b', borderRadius: 12, padding: 16, marginTop: 4, gap: 10 },
  input: {
    backgroundColor: '#0f172a', borderRadius: 10, padding: 14,
    fontSize: 15, color: '#fff', borderWidth: 1, borderColor: '#334155',
  },
  changePasswordBtn: {
    backgroundColor: '#2563eb', borderRadius: 10, padding: 14,
    alignItems: 'center', marginTop: 4,
  },
  changePasswordBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#450a0a', borderRadius: 14, padding: 16, marginHorizontal: 20, marginTop: 8, gap: 8 },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '700' },
  version: { textAlign: 'center', color: '#475569', fontSize: 13, marginTop: 20 },
});
