import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ companyName: '', name: '', email: '', password: '' });

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { data } = await authApi.login({ email: form.email, password: form.password });
        const res = data.data || data;
        await login(res.user, res.company, res.tokens);
      } else {
        if (!form.companyName || !form.name) {
          Alert.alert('Error', 'Please fill in all fields');
          setLoading(false);
          return;
        }
        const { data } = await authApi.register(form);
        const res = data.data || data;
        await login(res.user, res.company, res.tokens);
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={s.logoIcon}>
            <Ionicons name="construct" size={28} color="#fff" />
          </View>
          <Text style={s.logoText}>FieldVault</Text>
        </View>
        <Text style={s.subtitle}>{isLogin ? 'Sign in to your account' : 'Start your 14-day free trial'}</Text>

        {/* Form */}
        <View style={s.formCard}>
          {!isLogin && (
            <>
              <Text style={s.label}>Company Name</Text>
              <TextInput style={s.input} value={form.companyName} onChangeText={(v) => setForm({ ...form, companyName: v })} placeholder="Acme Construction" placeholderTextColor="#94a3b8" />
              <Text style={s.label}>Your Name</Text>
              <TextInput style={s.input} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="John Doe" placeholderTextColor="#94a3b8" />
            </>
          )}

          <Text style={s.label}>Email</Text>
          <TextInput style={s.input} value={form.email} onChangeText={(v) => setForm({ ...form, email: v })} placeholder="you@company.com" placeholderTextColor="#94a3b8" keyboardType="email-address" autoCapitalize="none" />

          <Text style={s.label}>Password</Text>
          <View style={s.passwordWrap}>
            <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} value={form.password} onChangeText={(v) => setForm({ ...form, password: v })} placeholder="••••••••" placeholderTextColor="#94a3b8" secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={s.toggleBtn}>
            <Text style={s.toggleText}>{isLogin ? "Don't have an account? Start free trial" : 'Already have an account? Sign in'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  logoIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  logoText: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: '#94a3b8', textAlign: 'center', marginBottom: 28 },
  formCard: { backgroundColor: '#1e293b', borderRadius: 20, padding: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#cbd5e1', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#0f172a', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff', marginBottom: 4, borderWidth: 1, borderColor: '#334155' },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  eyeBtn: { position: 'absolute', right: 14, top: 14 },
  submitBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  toggleBtn: { marginTop: 16, alignItems: 'center' },
  toggleText: { color: '#60a5fa', fontSize: 14, fontWeight: '500' },
});
