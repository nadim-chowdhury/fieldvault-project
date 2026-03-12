# FieldVault — Frontend Web Architecture & System Design

> **Project Name:** FieldVault
> **Tagline:** Audit-Ready Asset Intelligence for Construction Teams
> **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · shadcn/ui
> **Author:** Nadim Chowdhury | nadim-chowdhury@outlook.com
> **Version:** 1.0.0 | Phase 1 — Web Dashboard

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Rationale](#2-tech-stack--rationale)
3. [Folder Structure](#3-folder-structure)
4. [Routing Architecture (App Router)](#4-routing-architecture-app-router)
5. [Page Inventory](#5-page-inventory)
6. [Component Architecture](#6-component-architecture)
7. [State Management Strategy](#7-state-management-strategy)
8. [API Integration Layer](#8-api-integration-layer)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Role-Based Access Control (RBAC)](#10-role-based-access-control-rbac)
11. [QR Code Module](#11-qr-code-module)
12. [PDF Report Generation](#12-pdf-report-generation)
13. [Notification & Alert System](#13-notification--alert-system)
14. [Form Architecture](#14-form-architecture)
15. [Design System & UI Standards](#15-design-system--ui-standards)
16. [Performance Strategy](#16-performance-strategy)
17. [Error Handling Strategy](#17-error-handling-strategy)
18. [Testing Strategy](#18-testing-strategy)
19. [Environment & Configuration](#19-environment--configuration)
20. [Deployment Architecture](#20-deployment-architecture)
21. [Development Roadmap (6 Weeks)](#21-development-roadmap-6-weeks)

---

## 1. Project Overview

**FieldVault** is a Micro-SaaS web dashboard for small construction firms (5–20 employees) to manage equipment assets, track tool check-in/check-out, schedule maintenance, and generate audit-ready PDF compliance reports.

### Core User Personas

| Persona             | Role                   | Primary Actions                           |
| ------------------- | ---------------------- | ----------------------------------------- |
| **Company Admin**   | Owner / Office Manager | Manage assets, view reports, manage users |
| **Site Supervisor** | Senior Worker          | Assign tools, view maintenance logs       |
| **Field Worker**    | On-site Employee       | Check-out/in tools, report damage         |

### Core Modules

- **Asset Registry** — Create, edit, categorize, and tag equipment
- **Check-In / Check-Out** — Track who has what, when, and where
- **Maintenance Tracker** — Scheduled logs, automated alerts
- **QR Code Generator** — Print-ready codes for physical tagging
- **Audit Report Generator** — One-click PDF for compliance inspections
- **User & Team Management** — Role-based access per company

---

## 2. Tech Stack & Rationale

| Layer          | Technology                      | Why                                           |
| -------------- | ------------------------------- | --------------------------------------------- |
| Framework      | Next.js 16 (App Router)         | SSR, RSC, file-based routing, API routes      |
| Language       | TypeScript 5.x                  | Type safety across the whole codebase         |
| Styling        | Tailwind CSS v4                 | Utility-first, fast, consistent               |
| UI Components  | shadcn/ui                       | Accessible, unstyled-base, fully customizable |
| Icons          | Lucide React                    | Clean, consistent icon set                    |
| State (Server) | TanStack Query v5               | Server state, caching, background sync        |
| State (Client) | Zustand                         | Lightweight global UI state                   |
| Forms          | React Hook Form + Zod           | Performant forms with schema validation       |
| HTTP Client    | Axios (with interceptors)       | Token refresh, error handling                 |
| PDF Generation | React-PDF / @react-pdf/renderer | Server-side PDF rendering                     |
| QR Codes       | qrcode.react + qrcode (node)    | Client preview + server generation            |
| Charts         | Recharts                        | Dashboard analytics                           |
| Date Handling  | date-fns                        | Lightweight, tree-shakeable                   |
| Notifications  | Sonner                          | Toast notifications                           |
| Tables         | TanStack Table v8               | Sortable, filterable, paginated tables        |

---

## 3. Folder Structure

```
fieldvault-web/
├── public/
│   ├── logo.svg
│   ├── qr-placeholder.png
│   └── fonts/
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group (no dashboard layout)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/              # Protected route group
│   │   │   ├── layout.tsx            # Dashboard shell (sidebar + topbar)
│   │   │   ├── page.tsx              # / → redirect to /dashboard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # Overview & KPIs
│   │   │   ├── assets/
│   │   │   │   ├── page.tsx          # Asset list
│   │   │   │   ├── new/page.tsx      # Create asset
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Asset detail
│   │   │   │       └── edit/page.tsx
│   │   │   ├── assignments/
│   │   │   │   ├── page.tsx          # All assignments
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── maintenance/
│   │   │   │   ├── page.tsx          # Maintenance schedule
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── qr-codes/
│   │   │   │   └── page.tsx          # QR generator & print view
│   │   │   ├── reports/
│   │   │   │   └── page.tsx          # Audit report builder
│   │   │   ├── team/
│   │   │   │   ├── page.tsx          # User management
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx          # Company settings
│   │   │   │   └── billing/page.tsx
│   │   │   └── notifications/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/                      # Next.js API Routes (thin proxies)
│   │   │   └── auth/
│   │   │       └── [...nextauth]/route.ts
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css
│   │   └── not-found.tsx
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                   # Layout-level components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── PageHeader.tsx
│   │   │
│   │   ├── dashboard/                # Dashboard-specific components
│   │   │   ├── KpiCard.tsx
│   │   │   ├── AssetStatusChart.tsx
│   │   │   ├── RecentActivityFeed.tsx
│   │   │   └── MaintenanceDueWidget.tsx
│   │   │
│   │   ├── assets/
│   │   │   ├── AssetTable.tsx
│   │   │   ├── AssetCard.tsx
│   │   │   ├── AssetStatusBadge.tsx
│   │   │   ├── AssetForm.tsx
│   │   │   └── AssetDetailPanel.tsx
│   │   │
│   │   ├── assignments/
│   │   │   ├── AssignmentTable.tsx
│   │   │   ├── CheckoutModal.tsx
│   │   │   └── CheckinModal.tsx
│   │   │
│   │   ├── maintenance/
│   │   │   ├── MaintenanceTable.tsx
│   │   │   ├── MaintenanceForm.tsx
│   │   │   └── MaintenanceTimeline.tsx
│   │   │
│   │   ├── qr/
│   │   │   ├── QRCodeCard.tsx
│   │   │   ├── QRPrintSheet.tsx
│   │   │   └── QRDownloadButton.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── ReportBuilder.tsx
│   │   │   ├── AuditReportPDF.tsx
│   │   │   └── ReportPreview.tsx
│   │   │
│   │   ├── team/
│   │   │   ├── UserTable.tsx
│   │   │   ├── InviteUserModal.tsx
│   │   │   └── RoleBadge.tsx
│   │   │
│   │   └── shared/
│   │       ├── DataTable.tsx         # Generic TanStack Table wrapper
│   │       ├── ConfirmDialog.tsx
│   │       ├── EmptyState.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       ├── SearchInput.tsx
│   │       ├── FilterBar.tsx
│   │       ├── Pagination.tsx
│   │       └── StatusDot.tsx
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAssets.ts
│   │   ├── useAssignments.ts
│   │   ├── useMaintenance.ts
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts
│   │   ├── useNotifications.ts
│   │   └── useDebounce.ts
│   │
│   ├── lib/
│   │   ├── api/                      # Axios instance + service modules
│   │   │   ├── axios.ts              # Base Axios config + interceptors
│   │   │   ├── assets.api.ts
│   │   │   ├── assignments.api.ts
│   │   │   ├── maintenance.api.ts
│   │   │   ├── auth.api.ts
│   │   │   ├── reports.api.ts
│   │   │   └── users.api.ts
│   │   │
│   │   ├── query/                    # TanStack Query keys + factories
│   │   │   ├── queryClient.ts
│   │   │   └── keys.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── formatDate.ts
│   │   │   ├── formatCurrency.ts
│   │   │   ├── generateQR.ts
│   │   │   └── cn.ts                 # clsx + tailwind-merge utility
│   │   │
│   │   └── validators/               # Zod schemas
│   │       ├── asset.schema.ts
│   │       ├── maintenance.schema.ts
│   │       ├── auth.schema.ts
│   │       └── user.schema.ts
│   │
│   ├── store/                        # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── ui.store.ts
│   │   └── notification.store.ts
│   │
│   ├── types/                        # Global TypeScript types
│   │   ├── asset.types.ts
│   │   ├── assignment.types.ts
│   │   ├── maintenance.types.ts
│   │   ├── user.types.ts
│   │   ├── report.types.ts
│   │   └── api.types.ts
│   │
│   ├── constants/
│   │   ├── routes.ts
│   │   ├── permissions.ts
│   │   ├── assetStatus.ts
│   │   └── queryKeys.ts
│   │
│   └── middleware.ts                 # Auth guard middleware
│
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Routing Architecture (App Router)

### Route Groups

```
(auth)      → Public routes. No sidebar layout. Redirects to /dashboard if logged in.
(dashboard) → Protected routes. Wrapped in DashboardLayout with sidebar + topbar.
```

### Middleware Guard (`src/middleware.ts`)

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("fieldvault_token")?.value;
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 5. Page Inventory

### Auth Pages

| Route              | Component            | Description                   |
| ------------------ | -------------------- | ----------------------------- |
| `/login`           | `LoginPage`          | Email + password, remember me |
| `/register`        | `RegisterPage`       | Company + admin account setup |
| `/forgot-password` | `ForgotPasswordPage` | Email reset flow              |

### Dashboard Pages

| Route               | Component            | Access            | Key Features                            |
| ------------------- | -------------------- | ----------------- | --------------------------------------- |
| `/dashboard`        | `DashboardPage`      | All               | KPI cards, charts, alerts widget        |
| `/assets`           | `AssetsPage`         | All               | Filterable table, search, status badges |
| `/assets/new`       | `NewAssetPage`       | Admin, Supervisor | Multi-step form                         |
| `/assets/[id]`      | `AssetDetailPage`    | All               | Full asset profile, assignment history  |
| `/assets/[id]/edit` | `EditAssetPage`      | Admin, Supervisor | Pre-filled edit form                    |
| `/assignments`      | `AssignmentsPage`    | All               | Check-in/out log, active assignments    |
| `/maintenance`      | `MaintenancePage`    | All               | Schedule view, overdue alerts           |
| `/maintenance/new`  | `NewMaintenancePage` | Admin, Supervisor | Log a maintenance event                 |
| `/qr-codes`         | `QRCodesPage`        | Admin             | Generate, preview, print QR sheets      |
| `/reports`          | `ReportsPage`        | Admin             | Date range picker, one-click PDF        |
| `/team`             | `TeamPage`           | Admin             | Invite/manage users, assign roles       |
| `/settings`         | `SettingsPage`       | Admin             | Company profile, logo, preferences      |
| `/settings/billing` | `BillingPage`        | Admin             | Plan info, payment method               |
| `/notifications`    | `NotificationsPage`  | All               | All alerts history                      |

---

## 6. Component Architecture

### Design Principles

1. **Server Components by default** — fetch data in RSC, pass down as props
2. **Client Components only for interactivity** — use `'use client'` only when needed
3. **Compound Components** — complex UI like `<AssetTable>` broken into sub-parts
4. **Container / Presentational split** — hooks for data, components for UI

### Dashboard Layout (`src/app/(dashboard)/layout.tsx`)

```typescript
// Server Component — no 'use client' needed
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

### Sidebar Navigation Structure

```typescript
// src/constants/routes.ts
export const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    roles: ["admin", "supervisor", "worker"],
  },
  {
    label: "Assets",
    href: "/assets",
    icon: "Wrench",
    roles: ["admin", "supervisor", "worker"],
  },
  {
    label: "Assignments",
    href: "/assignments",
    icon: "ArrowLeftRight",
    roles: ["admin", "supervisor", "worker"],
  },
  {
    label: "Maintenance",
    href: "/maintenance",
    icon: "CalendarClock",
    roles: ["admin", "supervisor"],
  },
  { label: "QR Codes", href: "/qr-codes", icon: "QrCode", roles: ["admin"] },
  { label: "Reports", href: "/reports", icon: "FileText", roles: ["admin"] },
  { label: "Team", href: "/team", icon: "Users", roles: ["admin"] },
  { label: "Settings", href: "/settings", icon: "Settings", roles: ["admin"] },
];
```

### Generic DataTable Component

```typescript
// src/components/shared/DataTable.tsx
"use client";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchKey?: string;
  isLoading?: boolean;
}

export function DataTable<TData>({
  data,
  columns,
  searchKey,
  isLoading,
}: DataTableProps<TData>) {
  // Full TanStack Table implementation
  // ...
}
```

---

## 7. State Management Strategy

### Two-Layer State Model

```
Server State  →  TanStack Query (remote data, caching, sync)
Client State  →  Zustand (UI state, auth session, modals)
```

### TanStack Query Setup (`src/lib/query/queryClient.ts`)

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Query Keys (`src/constants/queryKeys.ts`)

```typescript
export const QUERY_KEYS = {
  assets: {
    all: ["assets"] as const,
    list: (filters: AssetFilters) => ["assets", "list", filters] as const,
    detail: (id: string) => ["assets", "detail", id] as const,
  },
  assignments: {
    all: ["assignments"] as const,
    active: ["assignments", "active"] as const,
  },
  maintenance: {
    all: ["maintenance"] as const,
    overdue: ["maintenance", "overdue"] as const,
  },
};
```

### Zustand Auth Store (`src/store/auth.store.ts`)

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  token: string | null;
  company: Company | null;
  setAuth: (user: User, token: string, company: Company) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      company: null,
      setAuth: (user, token, company) => set({ user, token, company }),
      clearAuth: () => set({ user: null, token: null, company: null }),
    }),
    { name: "fieldvault-auth" },
  ),
);
```

---

## 8. API Integration Layer

### Axios Instance (`src/lib/api/axios.ts`)

```typescript
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor — attach token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response Interceptor — handle 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
```

### Asset API Service (`src/lib/api/assets.api.ts`)

```typescript
import { apiClient } from "./axios";
import type { Asset, AssetFilters, PaginatedResponse } from "@/types";

export const assetsApi = {
  getAll: (filters: AssetFilters) =>
    apiClient.get<PaginatedResponse<Asset>>("/assets", { params: filters }),

  getById: (id: string) => apiClient.get<Asset>(`/assets/${id}`),

  create: (data: CreateAssetDto) => apiClient.post<Asset>("/assets", data),

  update: (id: string, data: UpdateAssetDto) =>
    apiClient.patch<Asset>(`/assets/${id}`, data),

  delete: (id: string) => apiClient.delete(`/assets/${id}`),

  generateQR: (id: string) =>
    apiClient.get<{ qrCodeUrl: string }>(`/assets/${id}/qr`),
};
```

### Custom Hook (`src/hooks/useAssets.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assetsApi } from "@/lib/api/assets.api";
import { QUERY_KEYS } from "@/constants/queryKeys";
import { toast } from "sonner";

export function useAssets(filters: AssetFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.assets.list(filters),
    queryFn: () => assetsApi.getAll(filters).then((r) => r.data),
  });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: assetsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.assets.all });
      toast.success("Asset created successfully");
    },
    onError: () => toast.error("Failed to create asset"),
  });
}
```

---

## 9. Authentication & Authorization

### Flow

```
1. User submits login form
2. POST /auth/login → NestJS returns { accessToken, refreshToken, user, company }
3. Store tokens: accessToken in Zustand (memory) + refreshToken in httpOnly cookie
4. Axios interceptor attaches Bearer token to all requests
5. On 401 → call /auth/refresh → if fails, logout and redirect to /login
6. Next.js middleware checks cookie on every route change (SSR-level guard)
```

### Token Storage Strategy

| Token          | Storage          | Why                                 |
| -------------- | ---------------- | ----------------------------------- |
| `accessToken`  | Zustand (memory) | Fast, cleared on tab close          |
| `refreshToken` | httpOnly Cookie  | XSS-proof, persists across sessions |

---

## 10. Role-Based Access Control (RBAC)

### Roles

```typescript
export enum Role {
  ADMIN = "admin", // Full access
  SUPERVISOR = "supervisor", // All except billing/settings
  WORKER = "worker", // View assets, check-in/out only
}
```

### Permission Hook (`src/hooks/usePermissions.ts`)

```typescript
import { useAuthStore } from "@/store/auth.store";
import { PERMISSIONS } from "@/constants/permissions";

export function usePermissions() {
  const { user } = useAuthStore();
  const role = user?.role ?? "worker";

  return {
    can: (action: string) => PERMISSIONS[role]?.includes(action) ?? false,
    role,
  };
}

// Usage in component:
// const { can } = usePermissions();
// {can('asset:create') && <Button>Add Asset</Button>}
```

### Permission Constants

```typescript
// src/constants/permissions.ts
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
    "qr:generate",
    "report:generate",
    "user:invite",
    "user:manage",
    "settings:edit",
    "billing:view",
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
```

---

## 11. QR Code Module

### Architecture

```
1. Each Asset has a unique UUID → becomes the QR payload URL
   QR Payload: https://app.fieldvault.io/scan/{asset_uuid}
2. /scan/[id] → public route → shows asset info or prompts check-in/out
3. Admin can generate a print sheet: 6 or 12 QR codes per A4 page
4. QR codes are SVG-based for infinite-resolution printing
```

### QR Code Card Component

```typescript
// src/components/qr/QRCodeCard.tsx
'use client';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeCardProps {
  assetId: string;
  assetName: string;
  assetTag: string;
}

export function QRCodeCard({ assetId, assetName, assetTag }: QRCodeCardProps) {
  const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/scan/${assetId}`;

  const handleDownload = () => {
    const svg = document.getElementById(`qr-${assetId}`);
    // SVG to PNG conversion + download
  };

  return (
    <div className="border rounded-lg p-4 flex flex-col items-center gap-2 print:break-inside-avoid">
      <QRCodeSVG id={`qr-${assetId}`} value={qrUrl} size={120} level="H" />
      <p className="font-semibold text-sm text-center">{assetName}</p>
      <p className="text-xs text-gray-500">{assetTag}</p>
      <button onClick={handleDownload} className="text-xs text-blue-600 underline">
        Download SVG
      </button>
    </div>
  );
}
```

### Print Sheet Layout

```typescript
// Tailwind print utilities for QR print sheet
// @media print — hides sidebar, prints only QR grid
// Uses CSS Grid: 3 cols on A4, 2 cols on Letter
```

---

## 12. PDF Report Generation

### Strategy: Server-Side with `@react-pdf/renderer`

```
Client selects date range → POST /reports/generate →
NestJS renders PDF server-side → streams back as application/pdf →
Browser opens in new tab / triggers download
```

### Report Builder UI Flow

```
1. ReportBuilder.tsx → date range picker + filter options
2. On submit → call reports API → show loading spinner
3. On success → open blob URL in new tab (inline preview) OR trigger download
```

### Client-Side PDF Download

```typescript
// src/lib/api/reports.api.ts
export const reportsApi = {
  generate: async (params: ReportParams) => {
    const response = await apiClient.get("/reports/audit", {
      params,
      responseType: "blob",
    });

    const url = URL.createObjectURL(
      new Blob([response.data], { type: "application/pdf" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `FieldVault-Audit-${params.from}-${params.to}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  },
};
```

---

## 13. Notification & Alert System

### Sources of Notifications

| Trigger                     | Type    | Delivery                    |
| --------------------------- | ------- | --------------------------- |
| Tool overdue (not returned) | Warning | Dashboard widget + email    |
| Maintenance due in 7 days   | Info    | Dashboard widget + WhatsApp |
| Tool reported damaged       | Urgent  | Toast + email to admin      |
| New user invited            | Info    | Toast                       |
| Audit report generated      | Success | Toast                       |

### In-App Notification Store

```typescript
// src/store/notification.store.ts
interface Notification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const useNotificationStore = create<{
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
}>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
```

### Dashboard Alert Widget

```
MaintenanceDueWidget.tsx
  → useQuery: fetch assets where nextMaintenanceDate <= today + 7 days
  → renders list of overdue/upcoming items
  → badge count on sidebar icon
```

---

## 14. Form Architecture

### Stack: React Hook Form + Zod

```typescript
// src/lib/validators/asset.schema.ts
import { z } from "zod";

export const assetSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  serialNumber: z.string().min(1, "Serial number is required"),
  category: z.enum([
    "power_tool",
    "heavy_equipment",
    "hand_tool",
    "safety_gear",
  ]),
  purchaseDate: z.string().datetime().optional(),
  purchaseValue: z.number().positive().optional(),
  status: z
    .enum(["available", "in_use", "maintenance", "lost"])
    .default("available"),
  notes: z.string().max(500).optional(),
});

export type AssetFormValues = z.infer<typeof assetSchema>;
```

### Form Component Pattern

```typescript
// src/components/assets/AssetForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assetSchema, AssetFormValues } from '@/lib/validators/asset.schema';

interface AssetFormProps {
  defaultValues?: Partial<AssetFormValues>;
  onSubmit: (values: AssetFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function AssetForm({ defaultValues, onSubmit, isLoading }: AssetFormProps) {
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields */}
    </form>
  );
}
```

---

## 15. Design System & UI Standards

### Color Palette

```css
/* Primary — Construction Orange */
--color-primary: #f97316; /* orange-500 */
--color-primary-dark: #ea580c; /* orange-600 */

/* Neutral */
--color-bg: #f9fafb; /* gray-50 */
--color-surface: #ffffff;
--color-border: #e5e7eb; /* gray-200 */
--color-text: #111827; /* gray-900 */
--color-muted: #6b7280; /* gray-500 */

/* Status Colors */
--color-available: #22c55e; /* green-500 */
--color-in-use: #3b82f6; /* blue-500 */
--color-maintenance: #f59e0b; /* amber-500 */
--color-lost: #ef4444; /* red-500 */
```

### Typography Scale

| Level         | Class                               | Usage                    |
| ------------- | ----------------------------------- | ------------------------ |
| Page Title    | `text-2xl font-bold`                | Page headings            |
| Section Title | `text-lg font-semibold`             | Card headers             |
| Body          | `text-sm`                           | Table data, descriptions |
| Label         | `text-xs font-medium text-gray-500` | Form labels, metadata    |

### Component Standards

- All buttons use `shadcn/ui <Button>` with consistent variant usage
- All modals use `shadcn/ui <Dialog>` for accessibility
- All status indicators use `<AssetStatusBadge>` — never raw text
- Loading states always use `<LoadingSkeleton>` — never blank screens
- Empty states always use `<EmptyState>` with action CTA

---

## 16. Performance Strategy

### Next.js Optimizations

```typescript
// 1. Parallel data fetching in RSC
const [assets, stats] = await Promise.all([
  assetsApi.getAll({}),
  dashboardApi.getStats(),
]);

// 2. Streaming with Suspense boundaries
<Suspense fallback={<LoadingSkeleton />}>
  <AssetTable />
</Suspense>

// 3. Image optimization
import Image from 'next/image';
// Always use next/image for tool photos

// 4. Dynamic imports for heavy components
const QRPrintSheet = dynamic(() => import('@/components/qr/QRPrintSheet'), {
  loading: () => <LoadingSkeleton />,
  ssr: false,
});
```

### Bundle Optimization

```typescript
// next.config.ts
const config = {
  experimental: { optimizePackageImports: ["lucide-react", "recharts"] },
  images: { remotePatterns: [{ hostname: "storage.fieldvault.io" }] },
};
```

### TanStack Query Caching

- Asset list: **5-minute stale time** (changes infrequently)
- Dashboard stats: **1-minute stale time** (near real-time)
- Maintenance schedule: **10-minute stale time**

---

## 17. Error Handling Strategy

### Levels of Error Handling

| Level     | Mechanism                  | Example           |
| --------- | -------------------------- | ----------------- |
| Global    | Axios response interceptor | 401, 500          |
| Query     | TanStack Query `onError`   | API failures      |
| Form      | Zod + RHF field errors     | Validation        |
| Page      | Next.js `error.tsx`        | Unexpected errors |
| Component | Try/catch + toast          | Isolated failures |

### Error Boundary (`src/app/(dashboard)/error.tsx`)

```typescript
'use client';
export default function DashboardError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-gray-500">{error.message}</p>
      <button onClick={reset} className="btn-primary">Try Again</button>
    </div>
  );
}
```

---

## 18. Testing Strategy

### Testing Pyramid

```
E2E Tests (Playwright)        — Critical flows: login, check-out, PDF download
Integration Tests (Vitest)    — Hooks, API services, Zustand stores
Unit Tests (Vitest)           — Utils, validators, pure components
```

### Key Test Coverage Targets

| Module           | Test Type   | Priority |
| ---------------- | ----------- | -------- |
| Auth flow        | E2E         | Critical |
| Asset CRUD       | Integration | High     |
| QR generation    | Unit        | High     |
| PDF download     | E2E         | High     |
| RBAC permissions | Unit        | Medium   |
| Form validation  | Unit        | Medium   |

### Example Hook Test

```typescript
// src/hooks/__tests__/useAssets.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useAssets } from "../useAssets";
import { createWrapper } from "@/test/utils";
import { server } from "@/mocks/server";
import { http, HttpResponse } from "msw";

test("fetches assets successfully", async () => {
  server.use(
    http.get("/assets", () =>
      HttpResponse.json({ data: mockAssets, total: 2 }),
    ),
  );

  const { result } = renderHook(() => useAssets({}), {
    wrapper: createWrapper(),
  });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data?.data).toHaveLength(2);
});
```

---

## 19. Environment & Configuration

### `.env.example`

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Storage (Cloudinary)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Sentry (error tracking)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

### Configuration Constants

```typescript
// src/config/app.ts
export const APP_CONFIG = {
  name: "FieldVault",
  version: "1.0.0",
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
  maxFileUploadSizeMB: 5,
  qrCodeBaseUrl: process.env.NEXT_PUBLIC_APP_URL + "/scan",
  pagination: { defaultPageSize: 20, pageSizeOptions: [10, 20, 50] },
  plans: {
    starter: { maxAssets: 50, maxUsers: 5, price: 99 },
    pro: { maxAssets: 500, maxUsers: 20, price: 149 },
  },
};
```

---

## 20. Deployment Architecture

### Infrastructure (Zero-Ops / Passive)

```
┌─────────────────────────────────────────────────────────────┐
│                        PRODUCTION                           │
│                                                             │
│  ┌──────────────┐     ┌──────────────┐    ┌──────────────┐  │
│  │   Vercel     │     │  Railway /   │    │  Neon /      │  │
│  │  (Next.js)   │ ◄──►│  Render      │◄──►│  Supabase    │  │
│  │              │     │  (NestJS)    │    │  (Postgres)  │  │
│  └──────────────┘     └──────────────┘    └──────────────┘  │
│          │                   │                              │
│  ┌───────┴───────┐   ┌───────┴───────┐                      │
│  │  Cloudinary   │   │   Upstash     │                      │
│  │  (Images)     │   │   (Redis)     │                      │
│  └───────────────┘   └───────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### Vercel Configuration (`vercel.json`)

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "regions": ["sin1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
```

### CI/CD Pipeline (GitHub Actions)

```
Push to main
  → Run tests (Vitest)
  → Run type check (tsc --noEmit)
  → Run lint (ESLint)
  → Deploy to Vercel (automatic)
  → Run Playwright smoke tests on preview URL
```

---

## 21. Development Roadmap (6 Weeks)

### Week 1 — Foundation

- [ ] Init Next.js 16 with TypeScript, Tailwind, shadcn/ui
- [ ] Set up folder structure per this architecture doc
- [ ] Build `DashboardLayout` (Sidebar, Topbar, PageHeader)
- [ ] Implement auth pages (Login, Register)
- [ ] Set up Axios + TanStack Query + Zustand
- [ ] Implement middleware auth guard
- [ ] Build reusable `DataTable`, `EmptyState`, `LoadingSkeleton`

### Week 2 — Asset Module

- [ ] Assets list page with filters, search, status badges
- [ ] Asset detail page with full profile
- [ ] Create / Edit asset forms with Zod validation
- [ ] Asset status management (Available → In Use → Maintenance)
- [ ] Photo upload integration (Cloudinary)

### Week 3 — Assignment & Maintenance Modules

- [ ] Assignments list (active + history)
- [ ] Check-out modal (select worker + site)
- [ ] Check-in modal (condition report)
- [ ] Maintenance schedule page
- [ ] Create/log maintenance event form
- [ ] Overdue maintenance dashboard widget

### Week 4 — QR & Reports

- [ ] QR Code generator page
- [ ] Print sheet layout (6/12 per page, CSS print styles)
- [ ] SVG QR download per asset
- [ ] Audit Report builder UI (date range, filters)
- [ ] PDF download integration with backend
- [ ] `/scan/[id]` public page

### Week 5 — Team, Settings & Notifications

- [ ] Team management page (invite, roles, deactivate)
- [ ] Company settings (logo, name, timezone)
- [ ] Billing page (plan info, subscription status)
- [ ] In-app notifications page
- [ ] Notification bell with unread count in topbar

### Week 6 — Polish & Production

- [ ] Full RBAC enforcement on all pages and components
- [ ] Dashboard KPI cards with Recharts charts
- [ ] Error boundaries on all major routes
- [ ] Write unit tests for core hooks/utils
- [ ] Write E2E tests for login, check-out, PDF download
- [ ] Performance audit (Lighthouse score > 90)
- [ ] Deploy to Vercel production

---

## Appendix A — TypeScript Types Reference

```typescript
// src/types/asset.types.ts
export type AssetStatus = "available" | "in_use" | "maintenance" | "lost";
export type AssetCategory =
  | "power_tool"
  | "heavy_equipment"
  | "hand_tool"
  | "safety_gear";

export interface Asset {
  id: string;
  companyId: string;
  name: string;
  serialNumber: string;
  category: AssetCategory;
  status: AssetStatus;
  qrCodeUrl: string;
  purchaseDate?: string;
  purchaseValue?: number;
  lastInspectedAt?: string;
  nextMaintenanceDate?: string;
  photoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// src/types/assignment.types.ts
export interface Assignment {
  id: string;
  assetId: string;
  asset: Pick<Asset, "id" | "name" | "serialNumber">;
  userId: string;
  user: Pick<User, "id" | "name">;
  checkedOutAt: string;
  checkedInAt?: string;
  siteLocation: string;
  conditionOnReturn?: string;
  photoOnReturn?: string;
}

// src/types/user.types.ts
export type UserRole = "admin" | "supervisor" | "worker";

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}
```

---

_FieldVault — Built by Nadim Chowdhury_
_Document Version 1.0.0 — Web Frontend Architecture_
