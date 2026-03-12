# FieldVault — Mobile App Architecture & System Design

> **Project Name:** FieldVault
> **Tagline:** Audit-Ready Asset Intelligence for Construction Teams
> **Stack:** React Native · Expo SDK 54 · TypeScript · Expo Router · MMKV · TanStack Query
> **Author:** Nadim Chowdhury | nadim-chowdhury@outlook.com
> **Version:** 1.0.0 | Phase 1 — Mobile App (iOS & Android)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Rationale](#2-tech-stack--rationale)
3. [Folder Structure](#3-folder-structure)
4. [Navigation Architecture (Expo Router)](#4-navigation-architecture-expo-router)
5. [Screen Inventory](#5-screen-inventory)
6. [Component Architecture](#6-component-architecture)
7. [State Management Strategy](#7-state-management-strategy)
8. [API Integration Layer](#8-api-integration-layer)
9. [Authentication Flow](#9-authentication-flow)
10. [QR Code Scanner Module](#10-qr-code-scanner-module)
11. [Offline Support Strategy](#11-offline-support-strategy)
12. [Push Notifications](#12-push-notifications)
13. [Camera & File Upload](#13-camera--file-upload)
14. [Form Architecture](#14-form-architecture)
15. [Design System & UI Standards](#15-design-system--ui-standards)
16. [Role-Based Access Control (RBAC)](#16-role-based-access-control-rbac)
17. [Performance Strategy](#17-performance-strategy)
18. [Error Handling Strategy](#18-error-handling-strategy)
19. [Testing Strategy](#19-testing-strategy)
20. [Environment & Configuration](#20-environment--configuration)
21. [Build & Deployment (EAS)](#21-build--deployment-eas)
22. [Development Roadmap (6 Weeks)](#22-development-roadmap-6-weeks)

---

## 1. Project Overview

The FieldVault mobile app is the **field-worker interface** of the FieldVault platform. While the web dashboard is used by office managers, the mobile app is used by workers **on construction sites** — often with one hand, outdoors, with poor internet connectivity.

### Primary Mobile Use Cases

| Use Case                           | Who              | Frequency            |
| ---------------------------------- | ---------------- | -------------------- |
| Scan QR code to check out a tool   | Worker           | Multiple times daily |
| Scan QR code to check in a tool    | Worker           | Multiple times daily |
| View which tools I currently have  | Worker           | Daily                |
| Report a damaged tool (with photo) | Worker           | Occasionally         |
| View maintenance schedule          | Supervisor       | Weekly               |
| Log a maintenance event            | Supervisor       | Weekly               |
| View asset details                 | All              | On demand            |
| Receive maintenance alerts         | Admin/Supervisor | Automated            |

### Design Philosophy for Mobile

- **Thumb-friendly** — all primary actions within thumb reach
- **Offline-first** — core features work without internet
- **One-task screens** — no clutter, one clear action per screen
- **Fast QR scanning** — camera opens in < 1 second
- **Minimal typing** — dropdowns, toggles, and photo capture over text input

---

## 2. Tech Stack & Rationale

| Layer         | Technology                             | Why                                          |
| ------------- | -------------------------------------- | -------------------------------------------- |
| Framework     | React Native 0.81 + Expo SDK 54    | Managed workflow, OTA updates, easy builds   |
| Language      | TypeScript 5.x                         | Shared types with backend/frontend           |
| Navigation    | Expo Router v6 (file-based)        | Consistent with Next.js mental model         |
| Storage       | MMKV (`react-native-mmkv`)             | 10x faster than AsyncStorage for auth tokens |
| Server State  | TanStack Query v5                      | Same pattern as web, offline persistence     |
| Client State  | Zustand                                | Lightweight, same pattern as web             |
| Forms         | React Hook Form + Zod                  | Same validators reused from web              |
| QR Scanner    | `expo-camera` + `expo-barcode-scanner` | Official Expo module, fast, reliable         |
| Camera        | `expo-image-picker` + `expo-camera`    | Photo capture for damage reports             |
| Notifications | `expo-notifications`                   | Push notifications, local alerts             |
| Offline Queue | `@tanstack/query` persist + MMKV       | Queue mutations offline, replay on reconnect |
| Network State | `@react-native-community/netinfo`      | Detect online/offline transitions            |
| Haptics       | `expo-haptics`                         | Feedback on QR scan success                  |
| Animations    | `react-native-reanimated` v3           | Smooth 60fps animations                      |
| Icons         | `@expo/vector-icons` (Lucide)          | Consistent with web dashboard                |
| Image         | `expo-image`                           | Fast, cached image loading                   |
| Secure Store  | `expo-secure-store`                    | Encrypted storage for refresh token          |
| Date          | `date-fns`                             | Same as web                                  |
| HTTP          | Axios                                  | Same interceptor pattern as web              |

---

## 3. Folder Structure

```
fieldvault-mobile/
├── app/                              # Expo Router — file-based navigation
│   ├── _layout.tsx                   # Root layout (providers, fonts)
│   ├── index.tsx                     # Entry → redirect to /auth or /home
│   │
│   ├── (auth)/                       # Public screens (no tab bar)
│   │   ├── _layout.tsx               # Stack layout
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (tabs)/                       # Main tab navigation
│   │   ├── _layout.tsx               # Tab bar config
│   │   ├── home.tsx                  # Dashboard / quick actions
│   │   ├── assets.tsx                # Asset list
│   │   ├── scan.tsx                  # QR scanner (center tab)
│   │   ├── maintenance.tsx           # Maintenance schedule
│   │   └── profile.tsx               # User profile + settings
│   │
│   ├── assets/                       # Asset stack screens
│   │   ├── [id].tsx                  # Asset detail
│   │   └── [id]/checkout.tsx         # Checkout flow for asset
│   │
│   ├── assignments/
│   │   ├── index.tsx                 # My active assignments
│   │   └── [id].tsx                  # Assignment detail + checkin
│   │
│   ├── maintenance/
│   │   ├── [id].tsx                  # Maintenance detail
│   │   └── new.tsx                   # Log maintenance
│   │
│   ├── scan/
│   │   └── result.tsx                # Post-scan action screen
│   │
│   └── notifications/
│       └── index.tsx
│
├── src/
│   ├── components/
│   │   ├── ui/                       # Base design system components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Divider.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── ScreenWrapper.tsx     # Safe area + background
│   │   │   ├── Header.tsx
│   │   │   └── TabBar.tsx            # Custom tab bar
│   │   │
│   │   ├── assets/
│   │   │   ├── AssetListItem.tsx
│   │   │   ├── AssetStatusBadge.tsx
│   │   │   ├── AssetDetailCard.tsx
│   │   │   └── AssetHistoryItem.tsx
│   │   │
│   │   ├── assignments/
│   │   │   ├── AssignmentCard.tsx
│   │   │   ├── CheckoutForm.tsx
│   │   │   └── CheckinForm.tsx
│   │   │
│   │   ├── maintenance/
│   │   │   ├── MaintenanceListItem.tsx
│   │   │   └── MaintenanceForm.tsx
│   │   │
│   │   ├── scan/
│   │   │   ├── QRScannerView.tsx     # Camera + overlay + torch toggle
│   │   │   ├── ScanResultCard.tsx
│   │   │   └── ScanOverlay.tsx       # Animated scan frame
│   │   │
│   │   ├── home/
│   │   │   ├── QuickActionButton.tsx
│   │   │   ├── StatsRow.tsx
│   │   │   └── AlertBanner.tsx
│   │   │
│   │   └── shared/
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       ├── SkeletonLoader.tsx
│   │       ├── OfflineBanner.tsx
│   │       ├── PhotoPicker.tsx
│   │       ├── ConfirmSheet.tsx
│   │       └── NetworkStatus.tsx
│   │
│   ├── hooks/
│   │   ├── useAssets.ts
│   │   ├── useAssignments.ts
│   │   ├── useMaintenance.ts
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts
│   │   ├── useNotifications.ts
│   │   ├── useOffline.ts
│   │   ├── useCamera.ts
│   │   └── useQRScanner.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── axios.ts              # Axios instance + interceptors
│   │   │   ├── assets.api.ts
│   │   │   ├── assignments.api.ts
│   │   │   ├── maintenance.api.ts
│   │   │   ├── auth.api.ts
│   │   │   └── notifications.api.ts
│   │   │
│   │   ├── query/
│   │   │   ├── queryClient.ts        # TanStack Query + offline persist
│   │   │   └── keys.ts
│   │   │
│   │   ├── storage/
│   │   │   ├── mmkv.ts               # MMKV instance
│   │   │   ├── secureStore.ts        # expo-secure-store wrapper
│   │   │   └── offlineQueue.ts       # Pending mutations store
│   │   │
│   │   └── utils/
│   │       ├── formatDate.ts
│   │       ├── parseQRPayload.ts
│   │       └── cn.ts
│   │
│   ├── store/
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   └── offline.store.ts
│   │
│   ├── types/
│   │   ├── asset.types.ts
│   │   ├── assignment.types.ts
│   │   ├── maintenance.types.ts
│   │   ├── user.types.ts
│   │   └── api.types.ts
│   │
│   ├── constants/
│   │   ├── routes.ts
│   │   ├── permissions.ts
│   │   ├── theme.ts
│   │   └── queryKeys.ts
│   │
│   └── validators/
│       ├── checkout.schema.ts
│       ├── checkin.schema.ts
│       └── maintenance.schema.ts
│
├── assets/
│   ├── fonts/
│   ├── images/
│   │   ├── logo.png
│   │   └── empty-state.png
│   └── animations/
│       └── scan-success.json         # Lottie animation
│
├── app.json                          # Expo config
├── eas.json                          # EAS Build config
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## 4. Navigation Architecture (Expo Router)

### Navigation Tree

```
Root Stack
│
├── (auth) Stack              [unauthenticated]
│   ├── /login
│   ├── /register
│   └── /forgot-password
│
└── (tabs) Tab Navigator      [authenticated]
    ├── /home                 🏠 Dashboard
    ├── /assets               🔧 Assets
    │   └── Stack
    │       ├── /assets           (list)
    │       ├── /assets/[id]      (detail)
    │       └── /assets/[id]/checkout
    │
    ├── /scan                 📷 Scanner (FAB-style center tab)
    │   └── Stack
    │       └── /scan/result
    │
    ├── /maintenance          🔩 Maintenance
    │   └── Stack
    │       ├── /maintenance          (list)
    │       ├── /maintenance/[id]     (detail)
    │       └── /maintenance/new
    │
    └── /profile              👤 Profile
        └── Stack
            ├── /profile
            └── /notifications
```

### Root Layout (`app/_layout.tsx`)

```typescript
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { queryClient } from '@/lib/query/queryClient';
import { AuthProvider } from '@/store/auth.store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
```

### Auth Guard (`app/index.tsx`)

```typescript
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth.store';

export default function Index() {
  const { token } = useAuthStore();
  return <Redirect href={token ? '/(tabs)/home' : '/(auth)/login'} />;
}
```

### Tab Bar Layout (`app/(tabs)/_layout.tsx`)

```typescript
import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/components/layout/TabBar';

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen name="home"        options={{ title: 'Home' }} />
      <Tabs.Screen name="assets"      options={{ title: 'Assets' }} />
      <Tabs.Screen name="scan"        options={{ title: 'Scan' }} />
      <Tabs.Screen name="maintenance" options={{ title: 'Maintenance' }} />
      <Tabs.Screen name="profile"     options={{ title: 'Profile' }} />
    </Tabs>
  );
}
```

---

## 5. Screen Inventory

### Auth Screens

| Route              | Screen                 | Description                              |
| ------------------ | ---------------------- | ---------------------------------------- |
| `/login`           | `LoginScreen`          | Email + password, biometric option       |
| `/register`        | `RegisterScreen`       | Company + admin setup (invite-only flow) |
| `/forgot-password` | `ForgotPasswordScreen` | Email reset request                      |

### Tab Screens

| Route          | Screen              | Roles             | Description                         |
| -------------- | ------------------- | ----------------- | ----------------------------------- |
| `/home`        | `HomeScreen`        | All               | Quick actions, active tools, alerts |
| `/assets`      | `AssetsScreen`      | All               | Searchable asset list with filters  |
| `/scan`        | `ScanScreen`        | All               | QR scanner with torch + overlay     |
| `/maintenance` | `MaintenanceScreen` | Admin, Supervisor | Schedule list, overdue highlights   |
| `/profile`     | `ProfileScreen`     | All               | User info, settings, logout         |

### Stack Screens

| Route                   | Screen                    | Roles             | Description                              |
| ----------------------- | ------------------------- | ----------------- | ---------------------------------------- |
| `/assets/[id]`          | `AssetDetailScreen`       | All               | Full asset profile + history             |
| `/assets/[id]/checkout` | `CheckoutScreen`          | All               | Check out this specific tool             |
| `/scan/result`          | `ScanResultScreen`        | All               | Post-scan action (checkout/checkin/view) |
| `/assignments`          | `MyAssignmentsScreen`     | All               | My active checkouts                      |
| `/assignments/[id]`     | `AssignmentDetailScreen`  | All               | Detail + check-in action                 |
| `/maintenance/[id]`     | `MaintenanceDetailScreen` | Admin, Supervisor | Log detail                               |
| `/maintenance/new`      | `NewMaintenanceScreen`    | Admin, Supervisor | Log a maintenance event                  |
| `/notifications`        | `NotificationsScreen`     | All               | All alerts history                       |

---

## 6. Component Architecture

### ScreenWrapper (Safe Area + Background)

```typescript
// src/components/layout/ScreenWrapper.tsx
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  padding?: boolean;
}

export function ScreenWrapper({
  children,
  scrollable = true,
  padding = true,
}: ScreenWrapperProps) {
  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={padding && styles.padding}
    >
      {children}
    </ScrollView>
  ) : (
    <>{children}</>
  );

  return (
    <SafeAreaView style={styles.root}>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  padding: { padding: 16, paddingBottom: 32 },
});
```

### Custom Tab Bar

```typescript
// src/components/layout/TabBar.tsx
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors } from '@/constants/theme';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const isScan = route.name === 'scan';  // Center FAB-style button

        const onPress = () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          if (!isFocused) navigation.navigate(route.name);
        };

        if (isScan) {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.scanButton}
            >
              {/* Large orange circle FAB */}
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}
          >
            <TabIcon name={route.name} focused={isFocused} />
            <TabLabel name={route.name} focused={isFocused} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
```

### Asset List Item

```typescript
// src/components/assets/AssetListItem.tsx
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { AssetStatusBadge } from './AssetStatusBadge';
import type { Asset } from '@/types/asset.types';

interface AssetListItemProps {
  asset: Asset;
}

export function AssetListItem({ asset }: AssetListItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/assets/${asset.id}`)}
      activeOpacity={0.7}
    >
      <Image
        source={asset.photoUrl ?? require('@/assets/images/tool-placeholder.png')}
        style={styles.photo}
        contentFit="cover"
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{asset.name}</Text>
        <Text style={styles.serial}>S/N: {asset.serialNumber}</Text>
        <AssetStatusBadge status={asset.status} />
      </View>
    </TouchableOpacity>
  );
}
```

### QR Scanner View

```typescript
// src/components/scan/QRScannerView.tsx
import { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ScanOverlay } from './ScanOverlay';
import { parseQRPayload } from '@/lib/utils/parseQRPayload';

export function QRScannerView() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    const assetId = parseQRPayload(data);  // Extract UUID from URL
    if (!assetId) {
      // Not a valid FieldVault QR code
      setScanned(false);
      return;
    }

    // Haptic feedback on success
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Navigate to result screen
    router.push({ pathname: '/scan/result', params: { assetId } });
    setTimeout(() => setScanned(false), 2000);  // Re-enable after 2s
  };

  if (!permission?.granted) {
    return <CameraPermissionRequest onRequest={requestPermission} />;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchOn}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      <ScanOverlay />
      <TorchButton active={torchOn} onToggle={() => setTorchOn(!torchOn)} />
    </View>
  );
}
```

---

## 7. State Management Strategy

### Same Two-Layer Model as Web

```
Server State  →  TanStack Query (remote data, caching, offline persistence)
Client State  →  Zustand (auth, UI flags, offline queue)
```

### TanStack Query with Offline Persistence

```typescript
// src/lib/query/queryClient.ts
import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { storage } from "@/lib/storage/mmkv";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (persist offline)
      retry: 2,
      networkMode: "offlineFirst", // Use cache when offline
    },
    mutations: {
      networkMode: "offlineFirst", // Queue mutations when offline
    },
  },
});

// Persist entire query cache to MMKV for offline use
const persister = createSyncStoragePersister({
  storage: {
    getItem: (key) => storage.getString(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  },
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hour cache max age
});
```

### Auth Store with MMKV + SecureStore

```typescript
// src/store/auth.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storage } from "@/lib/storage/mmkv";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  user: User | null;
  accessToken: string | null; // MMKV (fast, memory-like)
  company: Company | null;
  setAuth: (user: User, accessToken: string, company: Company) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      company: null,
      setAuth: async (user, accessToken, company) => {
        set({ user, accessToken, company });
        // Refresh token stored in encrypted SecureStore separately
      },
      setAccessToken: (token) => set({ accessToken: token }),
      clearAuth: async () => {
        await SecureStore.deleteItemAsync("fieldvault_refresh_token");
        set({ user: null, accessToken: null, company: null });
      },
    }),
    {
      name: "fieldvault-auth",
      storage: createJSONStorage(() => ({
        getItem: (key) => storage.getString(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      })),
    },
  ),
);
```

### Offline Store (Pending Mutations Queue)

```typescript
// src/store/offline.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storage } from "@/lib/storage/mmkv";

interface PendingMutation {
  id: string;
  type: "checkout" | "checkin" | "maintenance_log";
  payload: unknown;
  createdAt: string;
  retryCount: number;
}

interface OfflineStore {
  pendingMutations: PendingMutation[];
  addPending: (
    mutation: Omit<PendingMutation, "id" | "createdAt" | "retryCount">,
  ) => void;
  removePending: (id: string) => void;
  clearAll: () => void;
}

export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set) => ({
      pendingMutations: [],
      addPending: (mutation) =>
        set((s) => ({
          pendingMutations: [
            ...s.pendingMutations,
            {
              ...mutation,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              retryCount: 0,
            },
          ],
        })),
      removePending: (id) =>
        set((s) => ({
          pendingMutations: s.pendingMutations.filter((m) => m.id !== id),
        })),
      clearAll: () => set({ pendingMutations: [] }),
    }),
    {
      name: "fieldvault-offline-queue",
      storage: createJSONStorage(() => ({
        getItem: (key) => storage.getString(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
        removeItem: (key) => storage.delete(key),
      })),
    },
  ),
);
```

---

## 8. API Integration Layer

### Axios Instance (Mobile)

```typescript
// src/lib/api/axios.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000, // Longer timeout for mobile networks
  headers: { "Content-Type": "application/json" },
});

// Request — attach access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response — handle 401 with refresh flow
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue requests while refreshing
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await SecureStore.getItemAsync(
        "fieldvault_refresh_token",
      );
      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`,
        { refreshToken },
      );

      const newToken = data.data.accessToken;
      useAuthStore.getState().setAccessToken(newToken);

      // Store new refresh token
      await SecureStore.setItemAsync(
        "fieldvault_refresh_token",
        data.data.refreshToken,
      );

      failedQueue.forEach(({ resolve }) => resolve(newToken));
      failedQueue = [];

      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch {
      failedQueue.forEach(({ reject }) => reject(error));
      failedQueue = [];
      useAuthStore.getState().clearAuth();
      router.replace("/(auth)/login");
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
```

---

## 9. Authentication Flow

### Login Flow

```
1. User enters email + password
2. POST /auth/login → { accessToken, refreshToken, user, company }
3. accessToken → Zustand store (MMKV persisted)
4. refreshToken → expo-secure-store (AES-256 encrypted)
5. Redirect to /(tabs)/home
6. On app reopen:
   - Zustand rehydrates from MMKV (accessToken available instantly)
   - If accessToken expired → interceptor uses refreshToken → silent renewal
   - If refreshToken expired → redirect to login
```

### Biometric Authentication (Optional Enhancement)

```typescript
// src/hooks/useAuth.ts
import * as LocalAuthentication from "expo-local-authentication";

export function useAuth() {
  const authenticateWithBiometrics = async (): Promise<boolean> => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Verify your identity to access FieldVault",
      fallbackLabel: "Use PIN",
    });

    return result.success;
  };

  return { authenticateWithBiometrics };
}
```

---

## 10. QR Code Scanner Module

### Full QR Scan Flow

```
Worker taps Scan tab
  → Camera opens instantly (permissions pre-requested on first launch)
  → Worker points at QR code sticker on tool
  → Camera detects QR code
  → Parse URL: https://app.fieldvault.io/scan/{assetId}
  → Extract assetId
  → Haptic feedback + success sound
  → Navigate to /scan/result?assetId={assetId}
  → Fetch asset details from API (or cache if offline)
  → Show asset card with context-aware actions:
      - If asset is "available" → Show "Check Out" button
      - If asset is "in_use" by ME → Show "Check In" button
      - If asset is "in_use" by SOMEONE ELSE → Show "View Details" only
      - If asset is "maintenance" → Show "View Maintenance Log"
```

### QR Payload Parser

```typescript
// src/lib/utils/parseQRPayload.ts
const QR_PATTERN = /\/scan\/([0-9a-f-]{36})$/i;

export function parseQRPayload(data: string): string | null {
  const match = data.match(QR_PATTERN);
  return match?.[1] ?? null;
}

// Handles:
// "https://app.fieldvault.io/scan/abc-123-def"  → "abc-123-def"
// "http://localhost:3000/scan/abc-123-def"       → "abc-123-def" (dev)
// "random text"                                  → null (invalid)
```

### Scan Result Screen (`app/scan/result.tsx`)

```typescript
'use client';
import { useLocalSearchParams } from 'expo-router';
import { useAssetDetail } from '@/hooks/useAssets';
import { useAuthStore } from '@/store/auth.store';
import { CheckoutButton } from '@/components/assignments/CheckoutButton';
import { CheckinButton } from '@/components/assignments/CheckinButton';

export default function ScanResultScreen() {
  const { assetId } = useLocalSearchParams<{ assetId: string }>();
  const { user } = useAuthStore();
  const { data: asset, isLoading } = useAssetDetail(assetId);

  if (isLoading) return <ScanResultSkeleton />;
  if (!asset) return <InvalidQRState />;

  const myActiveAssignment = asset.assignments?.find(
    (a) => a.userId === user?.id && !a.checkedInAt
  );

  const renderAction = () => {
    if (asset.status === 'available') {
      return <CheckoutButton assetId={asset.id} />;
    }
    if (myActiveAssignment) {
      return <CheckinButton assignment={myActiveAssignment} />;
    }
    return <ViewOnlyNotice assignedTo={asset.currentUser} />;
  };

  return (
    <ScreenWrapper>
      <AssetDetailCard asset={asset} />
      {renderAction()}
    </ScreenWrapper>
  );
}
```

### Scan Overlay Animation

```typescript
// src/components/scan/ScanOverlay.tsx
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, Easing,
} from 'react-native-reanimated';

export function ScanOverlay() {
  const scanLineY = useSharedValue(0);

  useEffect(() => {
    scanLineY.value = withRepeat(
      withTiming(240, { duration: 2000, easing: Easing.linear }),
      -1,  // Infinite
      true // Reverse
    );
  }, []);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
  }));

  return (
    <View style={styles.overlay}>
      {/* Dark mask with clear center box */}
      <View style={styles.frame} />
      {/* Corner brackets */}
      <CornerBrackets />
      {/* Animated scan line */}
      <Animated.View style={[styles.scanLine, scanLineStyle]} />
      <Text style={styles.hint}>Point camera at QR code</Text>
    </View>
  );
}
```

---

## 11. Offline Support Strategy

### Offline Architecture

```
Layer 1: Query Cache (TanStack Query + MMKV)
  → All GET requests cached for 24 hours
  → App works fully read-only offline

Layer 2: Optimistic Updates
  → Mutations update UI instantly before API call
  → Rolled back on failure

Layer 3: Offline Mutation Queue (Zustand + MMKV)
  → If mutation fails due to network → added to queue
  → Queue replayed automatically on reconnect

Layer 4: Offline Banner
  → Shown when NetInfo detects no connection
  → Worker knows to expect delayed sync
```

### Network Status Hook

```typescript
// src/hooks/useOffline.ts
import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";
import { useOfflineStore } from "@/store/offline.store";
import { queryClient } from "@/lib/query/queryClient";

export function useOffline() {
  const { pendingMutations, removePending } = useOfflineStore();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected && pendingMutations.length > 0) {
        // Replay queued mutations
        for (const mutation of pendingMutations) {
          try {
            await replayMutation(mutation);
            removePending(mutation.id);
          } catch {
            // Will retry on next reconnect
          }
        }
        // Refetch stale queries after sync
        queryClient.invalidateQueries();
      }
    });

    return unsubscribe;
  }, [pendingMutations]);
}

async function replayMutation(mutation: PendingMutation) {
  switch (mutation.type) {
    case "checkout":
      return assignmentsApi.checkout(mutation.payload as CheckoutDto);
    case "checkin":
      return assignmentsApi.checkin(mutation.payload as CheckinDto);
    case "maintenance_log":
      return maintenanceApi.create(mutation.payload as CreateMaintenanceDto);
  }
}
```

### Offline Banner Component

```typescript
// src/components/shared/OfflineBanner.tsx
import { useNetInfo } from '@react-native-community/netinfo';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

export function OfflineBanner() {
  const netInfo = useNetInfo();
  const isOffline = !netInfo.isConnected;

  const style = useAnimatedStyle(() => ({
    height: withSpring(isOffline ? 40 : 0),
    opacity: withSpring(isOffline ? 1 : 0),
  }));

  return (
    <Animated.View style={[styles.banner, style]}>
      <Text style={styles.text}>
        ⚡ Offline — Changes will sync when reconnected
      </Text>
    </Animated.View>
  );
}
```

---

## 12. Push Notifications

### Setup with Expo Notifications

```typescript
// src/hooks/useNotifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useEffect } from "react";
import { Platform } from "react-native";
import { usersApi } from "@/lib/api/users.api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications() {
  useEffect(() => {
    registerForPushNotificationsAsync();

    // Handle notification tap (app in background)
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        handleNotificationTap(data);
      },
    );

    return () => subscription.remove();
  }, []);
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) return null; // Simulator — skip

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "FieldVault Alerts",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Register token with backend
  await usersApi.registerPushToken(token);

  return token;
}

function handleNotificationTap(data: Record<string, unknown>) {
  if (data.type === "maintenance_due" && data.assetId) {
    router.push(`/assets/${data.assetId}`);
  }
  if (data.type === "tool_overdue" && data.assignmentId) {
    router.push(`/assignments/${data.assignmentId}`);
  }
}
```

### Push Notification Types (Received on Mobile)

| Type                  | Trigger (Backend)            | Action on Tap          |
| --------------------- | ---------------------------- | ---------------------- |
| `maintenance_due`     | 7 days before scheduled date | Open asset detail      |
| `maintenance_overdue` | Day of overdue maintenance   | Open maintenance log   |
| `tool_overdue`        | 48h after checkout           | Open assignment detail |
| `tool_damaged`        | Worker reports damage        | Open assignment detail |

---

## 13. Camera & File Upload

### Photo Picker Hook

```typescript
// src/hooks/useCamera.ts
import * as ImagePicker from "expo-image-picker";

export function useCamera() {
  const pickFromCamera = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return null;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8, // 80% quality — good balance size/clarity
    });

    return result.canceled ? null : result.assets[0].uri;
  };

  const pickFromGallery = async (): Promise<string | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    return result.canceled ? null : result.assets[0].uri;
  };

  return { pickFromCamera, pickFromGallery };
}
```

### Upload to Backend

```typescript
// src/lib/api/uploads.api.ts
export const uploadsApi = {
  uploadImage: async (localUri: string): Promise<string> => {
    const formData = new FormData();
    formData.append("file", {
      uri: localUri,
      name: `photo_${Date.now()}.jpg`,
      type: "image/jpeg",
    } as unknown as Blob);

    const response = await apiClient.post<{ url: string }>(
      "/uploads/image",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    return response.data.data.url;
  },
};
```

### Photo Picker Component

```typescript
// src/components/shared/PhotoPicker.tsx
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useCamera } from '@/hooks/useCamera';

interface PhotoPickerProps {
  value?: string;
  onChange: (uri: string) => void;
  label?: string;
}

export function PhotoPicker({ value, onChange, label }: PhotoPickerProps) {
  const { pickFromCamera, pickFromGallery } = useCamera();

  const handlePress = () => {
    // Show bottom sheet with Camera / Gallery options
    showActionSheet({
      options: ['Take Photo', 'Choose from Gallery', 'Cancel'],
      onSelect: async (index) => {
        const uri = index === 0
          ? await pickFromCamera()
          : await pickFromGallery();
        if (uri) onChange(uri);
      },
    });
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      {value ? (
        <Image source={{ uri: value }} style={styles.preview} />
      ) : (
        <PlaceholderView label={label ?? 'Add Photo'} />
      )}
    </TouchableOpacity>
  );
}
```

---

## 14. Form Architecture

### Checkout Form (Quick, Minimal Input)

```typescript
// src/validators/checkout.schema.ts
export const checkoutSchema = z.object({
  siteLocation: z.string().min(1, 'Site location is required'),
  conditionOnCheckout: z.enum(['good', 'fair', 'poor']).default('good'),
  notes: z.string().max(200).optional(),
});

// src/components/assignments/CheckoutForm.tsx
export function CheckoutForm({ assetId, onSuccess }: CheckoutFormProps) {
  const { mutate: checkout, isPending } = useCheckoutAsset();
  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { siteLocation: '', conditionOnCheckout: 'good' },
  });

  const onSubmit = (values: CheckoutFormValues) => {
    checkout({ assetId, ...values }, { onSuccess });
  };

  return (
    <View style={styles.form}>
      <Controller
        control={control}
        name="siteLocation"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Site location (e.g. Block A, Level 3)"
            onChangeText={onChange}
            value={value}
            style={[styles.input, errors.siteLocation && styles.inputError]}
          />
        )}
      />
      <ConditionSelector control={control} />
      <Button
        title={isPending ? 'Checking Out...' : 'Confirm Check Out'}
        onPress={handleSubmit(onSubmit)}
        loading={isPending}
      />
    </View>
  );
}
```

### Check-In Form (Condition Report + Optional Photo)

```typescript
// src/validators/checkin.schema.ts
export const checkinSchema = z.object({
  conditionOnReturn: z.enum(["good", "damaged", "missing_parts"]),
  photoOnReturn: z.string().url().optional(),
  notes: z.string().max(300).optional(),
});
```

---

## 15. Design System & UI Standards

### Theme Constants (`src/constants/theme.ts`)

```typescript
export const colors = {
  // Brand
  primary: "#F97316", // Orange — construction feel
  primaryDark: "#EA580C",
  primaryLight: "#FED7AA",

  // Neutrals
  background: "#F9FAFB",
  surface: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",

  // Status
  available: "#22C55E",
  inUse: "#3B82F6",
  maintenance: "#F59E0B",
  lost: "#EF4444",
  overdue: "#DC2626",

  // UI
  success: "#16A34A",
  warning: "#D97706",
  error: "#DC2626",
  info: "#2563EB",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 24, fontFamily: "Inter-Bold", color: colors.text },
  h2: { fontSize: 20, fontFamily: "Inter-SemiBold", color: colors.text },
  h3: { fontSize: 16, fontFamily: "Inter-SemiBold", color: colors.text },
  body: { fontSize: 14, fontFamily: "Inter-Regular", color: colors.text },
  caption: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: colors.textMuted,
  },
  label: {
    fontSize: 12,
    fontFamily: "Inter-SemiBold",
    color: colors.textMuted,
  },
};
```

### Button Component

```typescript
// src/components/ui/Button.tsx
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radius, typography } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title, onPress, variant = 'primary',
  size = 'md', loading, disabled, fullWidth,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
```

### Asset Status Badge

```typescript
const STATUS_CONFIG = {
  available:   { label: 'Available',   bg: '#DCFCE7', text: '#16A34A' },
  in_use:      { label: 'In Use',      bg: '#DBEAFE', text: '#1D4ED8' },
  maintenance: { label: 'Maintenance', bg: '#FEF3C7', text: '#D97706' },
  lost:        { label: 'Lost',        bg: '#FEE2E2', text: '#DC2626' },
};

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}
```

---

## 16. Role-Based Access Control (RBAC)

### Same Permission System as Web

```typescript
// src/constants/permissions.ts — identical to web
export const PERMISSIONS = {
  admin: [
    "asset:create",
    "asset:edit",
    "asset:delete",
    "asset:view",
    "assignment:create",
    "assignment:close",
    "maintenance:create",
    "maintenance:edit",
    "report:generate",
    "user:manage",
  ],
  supervisor: [
    "asset:create",
    "asset:edit",
    "asset:view",
    "assignment:create",
    "assignment:close",
    "maintenance:create",
    "maintenance:edit",
  ],
  worker: ["asset:view", "assignment:create"],
};

// src/hooks/usePermissions.ts
export function usePermissions() {
  const { user } = useAuthStore();
  const role = user?.role ?? "worker";
  return {
    can: (action: string) => PERMISSIONS[role]?.includes(action) ?? false,
    isAdmin: role === "admin",
    isSupervisor: role === "supervisor",
    isWorker: role === "worker",
    role,
  };
}
```

### Conditional UI Rendering

```typescript
// Hide maintenance tab for workers
<Tabs.Screen
  name="maintenance"
  options={{
    href: can('maintenance:create') ? '/maintenance' : null, // null = hidden tab
    title: 'Maintenance',
  }}
/>

// Hide action buttons based on role
const { can } = usePermissions();
{can('asset:edit') && (
  <Button title="Edit Asset" onPress={handleEdit} />
)}
```

---

## 17. Performance Strategy

### Image Optimization

```typescript
// Use expo-image (not RN Image) for all asset photos
import { Image } from 'expo-image';

<Image
  source={asset.photoUrl}
  placeholder={blurhash}           // Show placeholder while loading
  contentFit="cover"
  transition={200}
  cachePolicy="memory-disk"        // Aggressive caching
/>
```

### FlatList Optimization for Asset Lists

```typescript
<FlatList
  data={assets}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <AssetListItem asset={item} />}
  getItemLayout={(_, index) => ({
    length: ITEM_HEIGHT,            // Fixed height for fast scroll
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}     // Unmount off-screen items
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
  // Infinite scroll pagination
  onEndReached={fetchNextPage}
  onEndReachedThreshold={0.5}
/>
```

### Lazy Loading Screens

```typescript
// Expo Router handles code splitting automatically per route
// Heavy screens (scan, reports) are not loaded until navigated to
```

### MMKV vs AsyncStorage

```typescript
// MMKV is synchronous and ~10x faster — critical for auth token reads
// on every API request
import { MMKV } from "react-native-mmkv";
export const storage = new MMKV({ id: "fieldvault-storage" });

// Synchronous read (no await)
const token = storage.getString("auth-token"); // instant
```

---

## 18. Error Handling Strategy

### API Error Handler

```typescript
// src/lib/utils/handleApiError.ts
import Toast from "react-native-toast-message";

export function handleApiError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 404) {
      Toast.show({ type: "error", text1: "Not Found", text2: message });
    } else if (status === 403) {
      Toast.show({ type: "error", text1: "Permission Denied", text2: message });
    } else if (status === 409) {
      Toast.show({ type: "error", text1: "Conflict", text2: message });
    } else if (!error.response) {
      // Network error — add to offline queue
      Toast.show({
        type: "info",
        text1: "Offline",
        text2: "Action saved. Will sync when reconnected.",
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Something went wrong",
      });
    }
  }
}
```

### Error Boundaries (React Native)

```typescript
// src/components/shared/ErrorState.tsx
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'Please try again',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button title="Try Again" onPress={onRetry} variant="secondary" />
      )}
    </View>
  );
}
```

---

## 19. Testing Strategy

### Test Pyramid

```
E2E Tests (Detox)             — Full device flows: login, scan, checkout
Integration Tests (Jest)      — Hooks, API services, Zustand stores
Unit Tests (Jest)             — Utils, validators, pure components
```

### Key Test Coverage

| Module                    | Test Type   | Priority |
| ------------------------- | ----------- | -------- |
| Auth flow (login → home)  | E2E         | Critical |
| QR scan → checkout flow   | E2E         | Critical |
| `parseQRPayload()`        | Unit        | High     |
| `useCheckoutAsset()` hook | Integration | High     |
| Offline queue replay      | Integration | High     |
| RBAC permission hiding    | Unit        | Medium   |
| Form validation schemas   | Unit        | Medium   |

### Example Unit Test

```typescript
// src/lib/utils/__tests__/parseQRPayload.test.ts
describe("parseQRPayload", () => {
  it("extracts UUID from valid FieldVault QR URL", () => {
    const url = "https://app.fieldvault.io/scan/abc-123-def-456-ghi";
    expect(parseQRPayload(url)).toBe("abc-123-def-456-ghi");
  });

  it("returns null for unrelated QR codes", () => {
    expect(parseQRPayload("https://google.com")).toBeNull();
    expect(parseQRPayload("random text")).toBeNull();
  });

  it("works with localhost in development", () => {
    const url = "http://localhost:3000/scan/abc-123";
    expect(parseQRPayload(url)).toBe("abc-123");
  });
});
```

---

## 20. Environment & Configuration

### `.env` (Expo)

```bash
# All EXPO_PUBLIC_ variables are bundled into the app
EXPO_PUBLIC_API_URL=https://api.fieldvault.io/api/v1
EXPO_PUBLIC_APP_URL=https://app.fieldvault.io

# Non-public (server-side only — not available in app code)
EAS_BUILD_PROFILE=production
```

### `app.json` (Expo Config)

```json
{
  "expo": {
    "name": "FieldVault",
    "slug": "fieldvault",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/splash.png",
      "backgroundColor": "#F97316"
    },
    "ios": {
      "bundleIdentifier": "io.fieldvault.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "FieldVault needs camera access to scan QR codes on tools.",
        "NSPhotoLibraryUsageDescription": "FieldVault needs photo access to attach damage reports.",
        "NSFaceIDUsageDescription": "FieldVault uses Face ID to keep your account secure."
      }
    },
    "android": {
      "package": "io.fieldvault.app",
      "versionCode": 1,
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.VIBRATE",
        "android.permission.USE_BIOMETRIC",
        "android.permission.USE_FINGERPRINT"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-camera",
      "expo-notifications",
      "expo-secure-store",
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow FieldVault to attach photos to damage reports."
        }
      ]
    ]
  }
}
```

---

## 21. Build & Deployment (EAS)

### EAS Build Config (`eas.json`)

```json
{
  "cli": { "version": ">= 10.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "http://192.168.1.x:3001/api/v1"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api-staging.fieldvault.io/api/v1"
      }
    },
    "production": {
      "distribution": "store",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.fieldvault.io/api/v1"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "123456789"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "production"
      }
    }
  }
}
```

### Build Commands

```bash
# Development build (with dev client)
eas build --platform all --profile development

# Internal testing (TestFlight + Internal Testing)
eas build --platform all --profile preview

# Production store submission
eas build --platform all --profile production
eas submit --platform all

# OTA Update (no store review needed for JS changes)
eas update --branch production --message "Fix QR scan parsing"
```

### OTA Updates Strategy

```
Code change type          Action needed
─────────────────────────────────────────
JS/TS logic change      → eas update (instant, no store review)
UI change               → eas update (instant)
New native module       → eas build + store submission
Native config change    → eas build + store submission

This is why Expo managed workflow is ideal for a SaaS —
most business logic changes ship instantly via OTA.
```

---

## 22. Development Roadmap (6 Weeks)

### Week 1 — Foundation & Auth

- [ ] Init Expo project with TypeScript, Expo Router
- [ ] Set up full folder structure per this doc
- [ ] Configure MMKV, SecureStore, Axios instance
- [ ] Build auth screens (Login, Register)
- [ ] Implement JWT login + refresh token flow
- [ ] Auth guard (index.tsx redirect)
- [ ] Build base UI components: Button, Input, Card, Badge
- [ ] Configure TanStack Query with MMKV persistence

### Week 2 — Navigation & Home

- [ ] Tab navigator with custom TabBar (FAB scan button)
- [ ] ScreenWrapper, Header components
- [ ] HomeScreen — quick actions grid, stats row
- [ ] OfflineBanner connected to NetInfo
- [ ] RBAC hook + conditional tab hiding for workers
- [ ] Push notification setup (expo-notifications + token registration)

### Week 3 — QR Scanner & Assignments

- [ ] QR Scanner screen with camera permissions flow
- [ ] Animated scan overlay (reanimated)
- [ ] QR payload parser + validation
- [ ] Scan result screen with context-aware actions
- [ ] Checkout form (site location + condition)
- [ ] Check-in form (condition on return + photo)
- [ ] My assignments screen

### Week 4 — Assets & Maintenance

- [ ] Asset list screen (search + filter + FlatList optimized)
- [ ] Asset detail screen (full profile + history)
- [ ] AssetStatusBadge, AssetListItem components
- [ ] Maintenance list screen (overdue highlighted)
- [ ] Maintenance detail screen
- [ ] Log maintenance form
- [ ] PhotoPicker component (camera + gallery)

### Week 5 — Offline & Notifications

- [ ] Offline mutation queue (Zustand + MMKV)
- [ ] Queue replay on reconnect (NetInfo listener)
- [ ] Optimistic updates for checkout/checkin
- [ ] Push notification tap handlers (deep linking)
- [ ] Notifications screen
- [ ] Notification badge count on profile tab

### Week 6 — Polish, Testing & Deploy

- [ ] Biometric authentication (optional login)
- [ ] Haptic feedback on all primary actions
- [ ] Reanimated transitions (screen enters, list items)
- [ ] Write unit tests for utils + validators
- [ ] Write integration tests for checkout/checkin hooks
- [ ] E2E smoke test (login → scan → checkout)
- [ ] EAS build — preview profile → internal TestFlight/Play testing
- [ ] Fix any device-specific bugs
- [ ] EAS build — production profile → store submission

---

## Appendix A — Screen-to-API Mapping

| Screen                    | API Calls                                                                     |
| ------------------------- | ----------------------------------------------------------------------------- |
| `HomeScreen`              | `GET /dashboard/stats`, `GET /assignments/active`, `GET /maintenance/overdue` |
| `AssetsScreen`            | `GET /assets?page=1&limit=20`                                                 |
| `AssetDetailScreen`       | `GET /assets/:id`, `GET /assets/:id/history`                                  |
| `ScanResultScreen`        | `GET /assets/:id` (from cache first)                                          |
| `CheckoutScreen`          | `POST /assignments/checkout`                                                  |
| `AssignmentDetailScreen`  | `GET /assignments/:id`, `PATCH /assignments/:id/checkin`                      |
| `MaintenanceScreen`       | `GET /maintenance?status=overdue,scheduled`                                   |
| `MaintenanceDetailScreen` | `GET /maintenance/:id`                                                        |
| `NewMaintenanceScreen`    | `POST /maintenance`                                                           |
| `ProfileScreen`           | `GET /users/me`                                                               |
| `NotificationsScreen`     | `GET /notifications`, `PATCH /notifications/read-all`                         |

## Appendix B — Permissions Reference (Mobile)

| Feature            | Admin | Supervisor | Worker        |
| ------------------ | ----- | ---------- | ------------- |
| View assets        | ✅    | ✅         | ✅            |
| Check out tool     | ✅    | ✅         | ✅            |
| Check in tool      | ✅    | ✅         | ✅ (own only) |
| Report damage      | ✅    | ✅         | ✅            |
| View maintenance   | ✅    | ✅         | ❌            |
| Log maintenance    | ✅    | ✅         | ❌            |
| Edit asset         | ✅    | ✅         | ❌            |
| View notifications | ✅    | ✅         | ✅            |

---

_FieldVault — Built by Nadim Chowdhury_
_Document Version 1.0.0 — Mobile App (React Native / Expo) Architecture_
