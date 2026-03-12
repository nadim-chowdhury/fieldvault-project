import { z } from 'zod';

// ─── Auth Schemas ──────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ─── Asset Schemas ─────────────────────────────────────────────────

export const createAssetSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  serialNumber: z.string().min(1, 'Serial number is required').max(100),
  model: z.string().max(100).optional(),
  manufacturer: z.string().max(100).optional(),
  category: z.enum([
    'power_tool',
    'heavy_equipment',
    'hand_tool',
    'safety_gear',
    'measuring',
    'vehicle',
  ]),
  purchaseValue: z.number().positive().optional(),
  purchaseDate: z.string().optional(),
  warrantyExpiresAt: z.string().optional(),
  maintenanceIntervalDays: z.number().int().positive().optional(),
  notes: z.string().max(2000).optional(),
});

export const updateAssetSchema = createAssetSchema.partial();

// ─── Assignment Schemas ────────────────────────────────────────────

export const checkoutSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  siteLocation: z.string().min(1, 'Site location is required').max(200),
  conditionOnCheckout: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const checkinSchema = z.object({
  conditionOnReturn: z.enum(['good', 'damaged', 'missing_parts']).optional(),
  notes: z.string().max(1000).optional(),
});

// ─── Maintenance Schemas ───────────────────────────────────────────

export const createMaintenanceSchema = z.object({
  assetId: z.string().uuid('Invalid asset ID'),
  type: z.enum([
    'routine_service',
    'safety_inspection',
    'repair',
    'calibration',
    'certification',
  ]),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  description: z.string().max(2000).optional(),
  cost: z.number().positive().optional(),
});

export const updateMaintenanceSchema = z.object({
  status: z.enum(['scheduled', 'in_progress', 'completed', 'overdue', 'cancelled']).optional(),
  completedAt: z.string().optional(),
  performedBy: z.string().max(100).optional(),
  cost: z.number().positive().optional(),
  technicianNotes: z.string().max(2000).optional(),
});

// ─── User Schemas ──────────────────────────────────────────────────

export const inviteUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'supervisor', 'worker']),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['admin', 'supervisor', 'worker']).optional(),
  isActive: z.boolean().optional(),
});

// ─── Company Schemas ───────────────────────────────────────────────

export const updateCompanySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
});

// ─── Report Schemas ────────────────────────────────────────────────

export const auditReportSchema = z.object({
  from: z.string().min(1, 'Start date is required'),
  to: z.string().min(1, 'End date is required'),
  assetIds: z.array(z.string().uuid()).optional(),
});

// ─── Inferred Types ────────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CheckinInput = z.infer<typeof checkinSchema>;
export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type AuditReportInput = z.infer<typeof auditReportSchema>;
