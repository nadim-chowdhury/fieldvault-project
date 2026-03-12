// ─── Enums ─────────────────────────────────────────────────────────

export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  WORKER = 'worker',
}

export enum AssetStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  LOST = 'lost',
}

export enum AssetCategory {
  POWER_TOOL = 'power_tool',
  HEAVY_EQUIPMENT = 'heavy_equipment',
  HAND_TOOL = 'hand_tool',
  SAFETY_GEAR = 'safety_gear',
  MEASURING = 'measuring',
  VEHICLE = 'vehicle',
}

export enum MaintenanceType {
  ROUTINE_SERVICE = 'routine_service',
  SAFETY_INSPECTION = 'safety_inspection',
  REPAIR = 'repair',
  CALIBRATION = 'calibration',
  CERTIFICATION = 'certification',
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum NotificationType {
  MAINTENANCE_DUE = 'maintenance_due',
  MAINTENANCE_OVERDUE = 'maintenance_overdue',
  TOOL_OVERDUE = 'tool_overdue',
  TOOL_DAMAGED = 'tool_damaged',
  USER_INVITED = 'user_invited',
  REPORT_READY = 'report_ready',
}

export enum CompanyPlan {
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

// ─── Interfaces ────────────────────────────────────────────────────

export interface Company {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  timezone: string;
  plan: CompanyPlan;
  isActive: boolean;
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  company?: Company;
  avatarUrl: string | null;
  isActive: boolean;
  invitedBy: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  companyId: string;
  name: string;
  serialNumber: string;
  model: string | null;
  manufacturer: string | null;
  category: AssetCategory;
  status: AssetStatus;
  qrCodeUrl: string | null;
  photoUrl: string | null;
  purchaseValue: number | null;
  purchaseDate: string | null;
  warrantyExpiresAt: string | null;
  lastInspectedAt: string | null;
  nextMaintenanceDate: string | null;
  maintenanceIntervalDays: number | null;
  notes: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  id: string;
  assetId: string;
  asset?: Asset;
  userId: string;
  user?: User;
  companyId: string;
  siteLocation: string;
  checkedOutAt: string;
  checkedInAt: string | null;
  conditionOnCheckout: string | null;
  conditionOnReturn: string | null;
  photoOnReturn: string | null;
  notes: string | null;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceLog {
  id: string;
  assetId: string;
  asset?: Asset;
  companyId: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  scheduledDate: string;
  completedAt: string | null;
  performedBy: string | null;
  cost: number | null;
  description: string | null;
  technicianNotes: string | null;
  invoiceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  companyId: string;
  userId: string | null;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  isRead: boolean;
  emailSent: boolean;
  createdAt: string;
}

// ─── API Types ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AssetFilters extends PaginationParams {
  search?: string;
  status?: AssetStatus;
  category?: AssetCategory;
  isArchived?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  tokens: AuthTokens;
  user: User;
  company: Company;
}
