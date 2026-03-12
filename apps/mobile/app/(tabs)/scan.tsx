import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { assignmentsApi, assetsApi } from '@/lib/api';

type ScanState = 'scanning' | 'found' | 'checkout';

export default function ScanTab() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('scanning');
  const [scannedAsset, setScannedAsset] = useState<any>(null);
  const [siteLocation, setSiteLocation] = useState('');
  const [condition, setCondition] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanState !== 'scanning') return;

    // Extract asset ID from QR URL (format: https://app/scan/{assetId})
    const parts = data.split('/scan/');
    const assetId = parts.length > 1 ? parts[1] : data;

    setScanState('found');
    try {
      const res = await assetsApi.get(assetId);
      const asset = res.data?.data || res.data;
      setScannedAsset(asset);
    } catch {
      Alert.alert('Error', 'Asset not found');
      setScanState('scanning');
    }
  };

  const handleCheckout = async () => {
    if (!siteLocation.trim()) {
      Alert.alert('Error', 'Please enter the site location');
      return;
    }
    setLoading(true);
    try {
      await assignmentsApi.checkout({
        assetId: scannedAsset.id,
        siteLocation,
        conditionOnCheckout: condition || undefined,
      });
      Alert.alert('Success', `${scannedAsset.name} checked out successfully!`);
      resetScanner();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Checkout failed');
    }
    setLoading(false);
  };

  const resetScanner = () => {
    setScanState('scanning');
    setScannedAsset(null);
    setSiteLocation('');
    setCondition('');
  };

  if (!permission) {
    return <View style={s.container}><ActivityIndicator color="#2563eb" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={s.container}>
        <View style={s.permissionCard}>
          <Ionicons name="camera" size={48} color="#64748b" />
          <Text style={s.permTitle}>Camera Access Required</Text>
          <Text style={s.permDesc}>Grant camera access to scan QR codes on your equipment</Text>
          <TouchableOpacity style={s.permBtn} onPress={requestPermission}>
            <Text style={s.permBtnText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (scanState === 'found' && scannedAsset) {
    return (
      <View style={s.container}>
        <View style={s.foundHeader}>
          <TouchableOpacity onPress={resetScanner}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={s.foundTitle}>Asset Found</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={s.assetCard}>
          <View style={s.assetIconWrap}>
            <Ionicons name="cube" size={24} color="#2563eb" />
          </View>
          <Text style={s.assetName}>{scannedAsset.name}</Text>
          <Text style={s.assetSerial}>{scannedAsset.serialNumber}</Text>
          <View style={s.assetStatusBadge}>
            <Text style={s.assetStatusText}>{scannedAsset.status?.replace('_', ' ')}</Text>
          </View>
        </View>

        {scannedAsset.status === 'available' ? (
          <View style={s.checkoutForm}>
            <Text style={s.formLabel}>Site Location *</Text>
            <TextInput style={s.formInput} value={siteLocation} onChangeText={setSiteLocation} placeholder="e.g. Block A, 3rd Floor" placeholderTextColor="#64748b" />

            <Text style={s.formLabel}>Condition Notes</Text>
            <TextInput style={s.formInput} value={condition} onChangeText={setCondition} placeholder="Good condition, fully charged" placeholderTextColor="#64748b" multiline />

            <TouchableOpacity style={s.checkoutBtn} onPress={handleCheckout} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                  <Ionicons name="arrow-down-circle" size={20} color="#fff" />
                  <Text style={s.checkoutBtnText}>Check Out Asset</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.infoCard}>
            <Ionicons name="information-circle" size={20} color="#f59e0b" />
            <Text style={s.infoText}>This asset is currently {scannedAsset.status?.replace('_', ' ')} and cannot be checked out.</Text>
          </View>
        )}

        <TouchableOpacity style={s.scanAgainBtn} onPress={resetScanner}>
          <Ionicons name="qr-code" size={18} color="#2563eb" />
          <Text style={s.scanAgainText}>Scan Another</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.container}>
      <View style={s.scanHeader}>
        <Text style={s.scanTitle}>Scan QR Code</Text>
        <Text style={s.scanSubtitle}>Point your camera at an asset QR code</Text>
      </View>

      <View style={s.cameraWrap}>
        <CameraView
          style={s.camera}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarCodeScanned}
        />
        <View style={s.overlay}>
          <View style={s.scanFrame} />
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  // Permission
  permissionCard: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  permTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginTop: 16 },
  permDesc: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 8, lineHeight: 20 },
  permBtn: { backgroundColor: '#2563eb', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14, marginTop: 24 },
  permBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Scanner
  scanHeader: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  scanTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  scanSubtitle: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  cameraWrap: { flex: 1, margin: 20, borderRadius: 20, overflow: 'hidden' },
  camera: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: 220, height: 220, borderWidth: 3, borderColor: '#2563eb', borderRadius: 16 },
  // Found
  foundHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  foundTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  assetCard: { backgroundColor: '#1e293b', borderRadius: 20, margin: 20, padding: 24, alignItems: 'center' },
  assetIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#172554', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  assetName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  assetSerial: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  assetStatusBadge: { backgroundColor: '#065f46', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 12 },
  assetStatusText: { color: '#6ee7b7', fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  // Checkout form
  checkoutForm: { paddingHorizontal: 20 },
  formLabel: { fontSize: 13, fontWeight: '600', color: '#cbd5e1', marginBottom: 6, marginTop: 12 },
  formInput: { backgroundColor: '#1e293b', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff', borderWidth: 1, borderColor: '#334155' },
  checkoutBtn: { backgroundColor: '#2563eb', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  infoCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#78350f', borderRadius: 14, padding: 16, marginHorizontal: 20, gap: 10 },
  infoText: { flex: 1, color: '#fde68a', fontSize: 14 },
  scanAgainBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16, marginTop: 16 },
  scanAgainText: { color: '#2563eb', fontSize: 15, fontWeight: '600' },
});
