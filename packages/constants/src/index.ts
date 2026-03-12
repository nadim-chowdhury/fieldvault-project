// ─── RBAC Permissions ──────────────────────────────────────────────

export const PERMISSIONS: Record<string, string[]> = {
  admin: [
    'asset:create',
    'asset:edit',
    'asset:delete',
    'asset:view',
    'assignment:create',
    'assignment:close',
    'maintenance:create',
    'maintenance:edit',
    'qr:generate',
    'report:generate',
    'user:invite',
    'user:manage',
    'settings:edit',
    'billing:view',
  ],
  supervisor: [
    'asset:create',
    'asset:edit',
    'asset:view',
    'assignment:create',
    'assignment:close',
    'maintenance:create',
    'maintenance:edit',
  ],
  worker: [
    'asset:view',
    'assignment:create',
  ],
};

// ─── Navigation Routes ─────────────────────────────────────────────

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard', roles: ['admin', 'supervisor', 'worker'] },
  { label: 'Assets', href: '/assets', icon: 'Wrench', roles: ['admin', 'supervisor', 'worker'] },
  { label: 'Assignments', href: '/assignments', icon: 'ArrowLeftRight', roles: ['admin', 'supervisor', 'worker'] },
  { label: 'Maintenance', href: '/maintenance', icon: 'CalendarClock', roles: ['admin', 'supervisor'] },
  { label: 'QR Codes', href: '/qr-codes', icon: 'QrCode', roles: ['admin'] },
  { label: 'Reports', href: '/reports', icon: 'FileText', roles: ['admin'] },
  { label: 'Team', href: '/team', icon: 'Users', roles: ['admin'] },
  { label: 'Settings', href: '/settings', icon: 'Settings', roles: ['admin'] },
] as const;

// ─── Query Keys ────────────────────────────────────────────────────

export const QUERY_KEYS = {
  assets: {
    all: ['assets'] as const,
    list: (filters?: Record<string, unknown>) => ['assets', 'list', filters] as const,
    detail: (id: string) => ['assets', 'detail', id] as const,
  },
  assignments: {
    all: ['assignments'] as const,
    active: ['assignments', 'active'] as const,
    detail: (id: string) => ['assignments', 'detail', id] as const,
  },
  maintenance: {
    all: ['maintenance'] as const,
    overdue: ['maintenance', 'overdue'] as const,
    detail: (id: string) => ['maintenance', 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
  },
} as const;

// ─── Status Labels & Colors ────────────────────────────────────────

export const ASSET_STATUS_CONFIG = {
  available: { label: 'Available', color: '#22c55e', bgColor: '#f0fdf4' },
  in_use: { label: 'In Use', color: '#3b82f6', bgColor: '#eff6ff' },
  maintenance: { label: 'Maintenance', color: '#f59e0b', bgColor: '#fffbeb' },
  lost: { label: 'Lost', color: '#ef4444', bgColor: '#fef2f2' },
} as const;

export const ASSET_CATEGORY_CONFIG = {
  power_tool: { label: 'Power Tool', icon: 'Zap' },
  heavy_equipment: { label: 'Heavy Equipment', icon: 'Truck' },
  hand_tool: { label: 'Hand Tool', icon: 'Hammer' },
  safety_gear: { label: 'Safety Gear', icon: 'HardHat' },
  measuring: { label: 'Measuring', icon: 'Ruler' },
  vehicle: { label: 'Vehicle', icon: 'Car' },
} as const;

export const MAINTENANCE_TYPE_CONFIG = {
  routine_service: { label: 'Routine Service', color: '#3b82f6' },
  safety_inspection: { label: 'Safety Inspection', color: '#8b5cf6' },
  repair: { label: 'Repair', color: '#ef4444' },
  calibration: { label: 'Calibration', color: '#f59e0b' },
  certification: { label: 'Certification', color: '#22c55e' },
} as const;

export const MAINTENANCE_STATUS_CONFIG = {
  scheduled: { label: 'Scheduled', color: '#3b82f6', bgColor: '#eff6ff' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bgColor: '#fffbeb' },
  completed: { label: 'Completed', color: '#22c55e', bgColor: '#f0fdf4' },
  overdue: { label: 'Overdue', color: '#ef4444', bgColor: '#fef2f2' },
  cancelled: { label: 'Cancelled', color: '#6b7280', bgColor: '#f9fafb' },
} as const;

// ─── App Constants ─────────────────────────────────────────────────

export const APP = {
  NAME: 'FieldVault',
  TAGLINE: 'Audit-Ready Asset Intelligence for Construction Teams',
  VERSION: '1.0.0',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MAX_FILE_SIZE_MB: 10,
  QR_CODE_BASE_URL: '/scan',
  SUPPORTED_IMAGE_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
} as const;
