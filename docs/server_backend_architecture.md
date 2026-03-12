# FieldVault — Backend Architecture & System Design

> **Project Name:** FieldVault
> **Tagline:** Audit-Ready Asset Intelligence for Construction Teams
> **Stack:** NestJS · TypeScript · PostgreSQL · TypeORM · Redis · BullMQ
> **Author:** Nadim Chowdhury | nadim-chowdhury@outlook.com
> **Version:** 1.0.0 | Phase 1 — REST API Backend

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Rationale](#2-tech-stack--rationale)
3. [Folder Structure](#3-folder-structure)
4. [Module Architecture](#4-module-architecture)
5. [Database Schema (PostgreSQL + TypeORM)](#5-database-schema-postgresql--typeorm)
6. [Entity Relationships Diagram](#6-entity-relationships-diagram)
7. [API Endpoints Reference](#7-api-endpoints-reference)
8. [Authentication & JWT Strategy](#8-authentication--jwt-strategy)
9. [Role-Based Access Control (RBAC)](#9-role-based-access-control-rbac)
10. [Multi-Tenancy Architecture](#10-multi-tenancy-architecture)
11. [QR Code Service](#11-qr-code-service)
12. [PDF Report Generation Engine](#12-pdf-report-generation-engine)
13. [Background Jobs & Queue System (BullMQ)](#13-background-jobs--queue-system-bullmq)
14. [Notification Service](#14-notification-service)
15. [File Upload Service](#15-file-upload-service)
16. [Validation & DTOs](#16-validation--dtos)
17. [Error Handling Strategy](#17-error-handling-strategy)
18. [Logging Strategy](#18-logging-strategy)
19. [Caching Strategy (Redis)](#19-caching-strategy-redis)
20. [Security Hardening](#20-security-hardening)
21. [Testing Strategy](#21-testing-strategy)
22. [Environment & Configuration](#22-environment--configuration)
23. [Deployment Architecture](#23-deployment-architecture)
24. [Development Roadmap (6 Weeks)](#24-development-roadmap-6-weeks)

---

## 1. Project Overview

The FieldVault backend is a **production-ready NestJS REST API** that serves both the Next.js web dashboard and the React Native mobile app. It is designed as a **multi-tenant SaaS backend** — each construction company is an isolated tenant with their own data, users, and assets.

### Core Responsibilities

- JWT authentication with refresh token rotation
- Multi-tenant data isolation (company-scoped all queries)
- Asset CRUD with full audit trail
- Check-in / Check-out assignment tracking
- Maintenance scheduling with automated alerts
- QR code generation (SVG + PNG)
- Audit-ready PDF report generation (server-side)
- Background job processing (maintenance reminders, emails)
- File upload management (tool photos via Cloudinary)
- Webhook-ready notification dispatch (email + WhatsApp)

---

## 2. Tech Stack & Rationale

| Layer         | Technology                          | Why                                              |
| ------------- | ----------------------------------- | ------------------------------------------------ |
| Framework     | NestJS 10                           | Modular, decorator-based, production-proven      |
| Language      | TypeScript 5.x                      | Full type safety, shared types with frontend     |
| Database      | PostgreSQL 16                       | ACID compliant, relational, audit-friendly       |
| ORM           | TypeORM                             | NestJS-native integration, migrations, relations |
| Cache / Queue | Redis (Upstash)                     | Fast caching + BullMQ job queue                  |
| Job Queue     | BullMQ                              | Reliable background jobs (maintenance alerts)    |
| Auth          | JWT (access + refresh)              | Stateless, mobile-friendly                       |
| Validation    | class-validator + class-transformer | DTO-level validation                             |
| PDF           | Puppeteer (headless Chrome)         | High-fidelity HTML → PDF                         |
| QR Code       | qrcode (npm)                        | SVG + PNG generation                             |
| Email         | Nodemailer + SendGrid               | Transactional email                              |
| File Storage  | Cloudinary                          | Image upload, transform, CDN                     |
| API Docs      | Swagger (OpenAPI 3.0)               | Auto-generated from decorators                   |
| Config        | @nestjs/config + Joi                | Validated environment config                     |
| Logging       | Winston + nest-winston              | Structured JSON logs                             |

---

## 3. Folder Structure

```
fieldvault-api/
├── src/
│   ├── main.ts                         # Bootstrap, Swagger, global pipes
│   ├── app.module.ts                   # Root module, global imports
│   │
│   ├── config/
│   │   ├── app.config.ts               # App-level config (port, cors, etc.)
│   │   ├── database.config.ts          # TypeORM config factory
│   │   ├── jwt.config.ts               # JWT secrets + expiry
│   │   ├── redis.config.ts             # Redis connection
│   │   ├── cloudinary.config.ts        # Cloudinary credentials
│   │   └── validation.schema.ts        # Joi env validation schema
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── current-company.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── company-member.guard.ts
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── all-exceptions.filter.ts
│   │   ├── interceptors/
│   │   │   ├── response-transform.interceptor.ts
│   │   │   ├── logging.interceptor.ts
│   │   │   └── timeout.interceptor.ts
│   │   ├── pipes/
│   │   │   └── parse-uuid.pipe.ts
│   │   ├── dto/
│   │   │   ├── pagination.dto.ts
│   │   │   └── api-response.dto.ts
│   │   └── utils/
│   │       ├── paginate.util.ts
│   │       ├── slug.util.ts
│   │       └── date.util.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── jwt-refresh.strategy.ts
│   │   │   └── dto/
│   │   │       ├── login.dto.ts
│   │   │       ├── register.dto.ts
│   │   │       └── refresh-token.dto.ts
│   │   │
│   │   ├── companies/
│   │   │   ├── companies.module.ts
│   │   │   ├── companies.controller.ts
│   │   │   ├── companies.service.ts
│   │   │   ├── entities/
│   │   │   │   └── company.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-company.dto.ts
│   │   │       └── update-company.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-user.dto.ts
│   │   │       ├── update-user.dto.ts
│   │   │       └── invite-user.dto.ts
│   │   │
│   │   ├── assets/
│   │   │   ├── assets.module.ts
│   │   │   ├── assets.controller.ts
│   │   │   ├── assets.service.ts
│   │   │   ├── entities/
│   │   │   │   └── asset.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-asset.dto.ts
│   │   │       ├── update-asset.dto.ts
│   │   │       └── filter-assets.dto.ts
│   │   │
│   │   ├── assignments/
│   │   │   ├── assignments.module.ts
│   │   │   ├── assignments.controller.ts
│   │   │   ├── assignments.service.ts
│   │   │   ├── entities/
│   │   │   │   └── assignment.entity.ts
│   │   │   └── dto/
│   │   │       ├── checkout-asset.dto.ts
│   │   │       └── checkin-asset.dto.ts
│   │   │
│   │   ├── maintenance/
│   │   │   ├── maintenance.module.ts
│   │   │   ├── maintenance.controller.ts
│   │   │   ├── maintenance.service.ts
│   │   │   ├── entities/
│   │   │   │   └── maintenance-log.entity.ts
│   │   │   └── dto/
│   │   │       ├── create-maintenance.dto.ts
│   │   │       └── update-maintenance.dto.ts
│   │   │
│   │   ├── qr-codes/
│   │   │   ├── qr-codes.module.ts
│   │   │   ├── qr-codes.controller.ts
│   │   │   └── qr-codes.service.ts
│   │   │
│   │   ├── reports/
│   │   │   ├── reports.module.ts
│   │   │   ├── reports.controller.ts
│   │   │   ├── reports.service.ts
│   │   │   └── templates/
│   │   │       └── audit-report.template.ts   # HTML template for PDF
│   │   │
│   │   ├── notifications/
│   │   │   ├── notifications.module.ts
│   │   │   ├── notifications.controller.ts
│   │   │   ├── notifications.service.ts
│   │   │   ├── entities/
│   │   │   │   └── notification.entity.ts
│   │   │   └── channels/
│   │   │       ├── email.channel.ts
│   │   │       └── whatsapp.channel.ts
│   │   │
│   │   ├── uploads/
│   │   │   ├── uploads.module.ts
│   │   │   ├── uploads.controller.ts
│   │   │   └── uploads.service.ts
│   │   │
│   │   └── dashboard/
│   │       ├── dashboard.module.ts
│   │       ├── dashboard.controller.ts
│   │       └── dashboard.service.ts
│   │
│   ├── jobs/
│   │   ├── jobs.module.ts
│   │   ├── maintenance-reminder.processor.ts
│   │   ├── overdue-alert.processor.ts
│   │   └── report-generator.processor.ts
│   │
│   └── database/
│       └── migrations/
│           ├── 001-create-companies.ts
│           ├── 002-create-users.ts
│           ├── 003-create-assets.ts
│           ├── 004-create-assignments.ts
│           ├── 005-create-maintenance-logs.ts
│           └── 006-create-notifications.ts
│
├── test/
│   ├── app.e2e-spec.ts
│   ├── auth.e2e-spec.ts
│   └── assets.e2e-spec.ts
│
├── .env
├── .env.example
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
├── ormconfig.ts                        # TypeORM CLI config
└── package.json
```

---

## 4. Module Architecture

### Application Bootstrap (`src/main.ts`)

```typescript
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { WinstonModule } from "nest-winston";
import helmet from "helmet";
import * as compression from "compression";
import { AppModule } from "./app.module";
import { winstonConfig } from "./config/winston.config";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseTransformInterceptor } from "./common/interceptors/response-transform.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Security
  app.use(helmet());
  app.use(compression());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(","),
    credentials: true,
  });

  // Versioning
  app.enableVersioning({ type: VersioningType.URI });
  app.setGlobalPrefix("api");

  // Global pipes, filters, interceptors
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true,
      transform: true, // Auto-transform types (string → number)
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle("FieldVault API")
    .setDescription("Backend API for FieldVault — Asset Management SaaS")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
```

### Root Module (`src/app.module.ts`)

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule } from "@nestjs/throttler";
import { BullModule } from "@nestjs/bullmq";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    // Config (validated)
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: JoiValidationSchema,
    }),

    // Database
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        url: config.get("DATABASE_URL"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        migrations: [__dirname + "/database/migrations/**/*{.ts,.js}"],
        synchronize: false, // Always false in production
        logging: config.get("NODE_ENV") === "development",
        ssl:
          config.get("NODE_ENV") === "production"
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    // Redis + BullMQ
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: { url: config.get("REDIS_URL") },
      }),
    }),

    // Cron scheduler
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Feature modules
    AuthModule,
    CompaniesModule,
    UsersModule,
    AssetsModule,
    AssignmentsModule,
    MaintenanceModule,
    QrCodesModule,
    ReportsModule,
    NotificationsModule,
    UploadsModule,
    DashboardModule,
    JobsModule,
  ],
})
export class AppModule {}
```

---

## 5. Database Schema (PostgreSQL + TypeORM)

### Company Entity

```typescript
// src/modules/companies/entities/company.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

@Entity("companies")
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string; // fieldvault.io/dashboard — also used for subdomain

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  country: string;

  @Column({ default: "UTC" })
  timezone: string;

  @Column({
    type: "enum",
    enum: ["starter", "pro", "enterprise"],
    default: "starter",
  })
  plan: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "timestamp", nullable: true })
  trialEndsAt: Date;

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Asset, (asset) => asset.company)
  assets: Asset[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### User Entity

```typescript
// src/modules/users/entities/user.entity.ts
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Never returned in queries by default
  passwordHash: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.WORKER,
  })
  role: UserRole;

  @ManyToOne(() => Company, (company) => company.users)
  @JoinColumn({ name: "company_id" })
  company: Company;

  @Column()
  companyId: string;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ nullable: true, select: false })
  refreshTokenHash: string; // bcrypt hash of refresh token

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  invitedBy: string; // user id of who invited them

  @Column({ nullable: true, type: "timestamp" })
  lastLoginAt: Date;

  @OneToMany(() => Assignment, (a) => a.user)
  assignments: Assignment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = "admin",
  SUPERVISOR = "supervisor",
  WORKER = "worker",
}
```

### Asset Entity

```typescript
// src/modules/assets/entities/asset.entity.ts
@Entity("assets")
export class Asset {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Company, (company) => company.assets)
  @JoinColumn({ name: "company_id" })
  company: Company;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column({ unique: true })
  serialNumber: string;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({
    type: "enum",
    enum: AssetCategory,
    default: AssetCategory.HAND_TOOL,
  })
  category: AssetCategory;

  @Column({
    type: "enum",
    enum: AssetStatus,
    default: AssetStatus.AVAILABLE,
  })
  status: AssetStatus;

  @Column({ nullable: true })
  qrCodeUrl: string; // URL of the hosted QR PNG

  @Column({ nullable: true })
  photoUrl: string; // Cloudinary URL

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  purchaseValue: number;

  @Column({ type: "date", nullable: true })
  purchaseDate: Date;

  @Column({ type: "date", nullable: true })
  warrantyExpiresAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastInspectedAt: Date;

  @Column({ type: "date", nullable: true })
  nextMaintenanceDate: Date;

  @Column({ type: "int", nullable: true })
  maintenanceIntervalDays: number; // e.g., 90 = every 90 days

  @Column({ type: "text", nullable: true })
  notes: string;

  @Column({ default: false })
  isArchived: boolean;

  @OneToMany(() => Assignment, (a) => a.asset)
  assignments: Assignment[];

  @OneToMany(() => MaintenanceLog, (m) => m.asset)
  maintenanceLogs: MaintenanceLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export enum AssetStatus {
  AVAILABLE = "available",
  IN_USE = "in_use",
  MAINTENANCE = "maintenance",
  LOST = "lost",
}

export enum AssetCategory {
  POWER_TOOL = "power_tool",
  HEAVY_EQUIPMENT = "heavy_equipment",
  HAND_TOOL = "hand_tool",
  SAFETY_GEAR = "safety_gear",
  MEASURING = "measuring",
  VEHICLE = "vehicle",
}
```

### Assignment Entity

```typescript
// src/modules/assignments/entities/assignment.entity.ts
@Entity("assignments")
export class Assignment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Asset, (asset) => asset.assignments)
  @JoinColumn({ name: "asset_id" })
  asset: Asset;

  @Column()
  assetId: string;

  @ManyToOne(() => User, (user) => user.assignments)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  userId: string;

  @Column()
  companyId: string; // Denormalized for fast tenant queries

  @Column()
  siteLocation: string;

  @Column({ type: "timestamp" })
  checkedOutAt: Date;

  @Column({ type: "timestamp", nullable: true })
  checkedInAt: Date;

  @Column({ nullable: true })
  conditionOnCheckout: string;

  @Column({ nullable: true })
  conditionOnReturn: string; // 'good' | 'damaged' | 'missing_parts'

  @Column({ nullable: true })
  photoOnReturn: string; // Cloudinary URL

  @Column({ nullable: true })
  notes: string;

  @Column({ default: false })
  isOverdue: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Maintenance Log Entity

```typescript
// src/modules/maintenance/entities/maintenance-log.entity.ts
@Entity("maintenance_logs")
export class MaintenanceLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Asset, (asset) => asset.maintenanceLogs)
  @JoinColumn({ name: "asset_id" })
  asset: Asset;

  @Column()
  assetId: string;

  @Column()
  companyId: string;

  @Column({
    type: "enum",
    enum: MaintenanceType,
  })
  type: MaintenanceType;

  @Column({
    type: "enum",
    enum: MaintenanceStatus,
    default: MaintenanceStatus.SCHEDULED,
  })
  status: MaintenanceStatus;

  @Column({ type: "date" })
  scheduledDate: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  performedBy: string; // Name or userId

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "text", nullable: true })
  technicianNotes: string;

  @Column({ nullable: true })
  invoiceUrl: string; // Cloudinary URL of receipt/invoice

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export enum MaintenanceType {
  ROUTINE_SERVICE = "routine_service",
  SAFETY_INSPECTION = "safety_inspection",
  REPAIR = "repair",
  CALIBRATION = "calibration",
  CERTIFICATION = "certification",
}

export enum MaintenanceStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
}
```

### Notification Entity

```typescript
// src/modules/notifications/entities/notification.entity.ts
@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  companyId: string;

  @Column({ nullable: true })
  userId: string; // null = broadcast to all company users

  @Column({
    type: "enum",
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: "text" })
  message: string;

  @Column({ nullable: true })
  relatedEntityId: string; // assetId, assignmentId, etc.

  @Column({ nullable: true })
  relatedEntityType: string; // 'asset' | 'assignment' | 'maintenance'

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  emailSent: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

export enum NotificationType {
  MAINTENANCE_DUE = "maintenance_due",
  MAINTENANCE_OVERDUE = "maintenance_overdue",
  TOOL_OVERDUE = "tool_overdue",
  TOOL_DAMAGED = "tool_damaged",
  USER_INVITED = "user_invited",
  REPORT_READY = "report_ready",
}
```

---

## 6. Entity Relationships Diagram

```
Company (1) ──────────────── (N) User
    │                              │
    │                              │ (assigned_by)
    │                              ▼
    └──── (N) Asset (1) ──── (N) Assignment
               │
               └──── (N) MaintenanceLog

Company (1) ──── (N) Notification
```

### Database Indexes (Performance)

```sql
-- Compound index for tenant-scoped asset queries (most common)
CREATE INDEX idx_assets_company_status ON assets(company_id, status);
CREATE INDEX idx_assets_company_category ON assets(company_id, category);

-- Assignment tracking
CREATE INDEX idx_assignments_company_checkedin ON assignments(company_id, checked_in_at);
CREATE INDEX idx_assignments_asset_active ON assignments(asset_id, checked_in_at)
  WHERE checked_in_at IS NULL;

-- Maintenance scheduling
CREATE INDEX idx_maintenance_company_scheduled ON maintenance_logs(company_id, scheduled_date);
CREATE INDEX idx_maintenance_asset_status ON maintenance_logs(asset_id, status);

-- Notification polling
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at);
```

---

## 7. API Endpoints Reference

All routes are versioned: `/api/v1/...`
All protected routes require `Authorization: Bearer <accessToken>`

### Auth

| Method | Endpoint                | Auth   | Description              |
| ------ | ----------------------- | ------ | ------------------------ |
| POST   | `/auth/register`        | Public | Register company + admin |
| POST   | `/auth/login`           | Public | Login, returns tokens    |
| POST   | `/auth/refresh`         | Public | Rotate refresh token     |
| POST   | `/auth/logout`          | Bearer | Invalidate refresh token |
| POST   | `/auth/forgot-password` | Public | Send reset email         |
| POST   | `/auth/reset-password`  | Public | Reset with token         |

### Companies

| Method | Endpoint              | Auth   | Description                 |
| ------ | --------------------- | ------ | --------------------------- |
| GET    | `/companies/me`       | Bearer | Get current company profile |
| PATCH  | `/companies/me`       | Admin  | Update company profile      |
| GET    | `/companies/me/stats` | Admin  | Aggregated company stats    |

### Assets

| Method | Endpoint                    | Auth   | Roles             | Description                           |
| ------ | --------------------------- | ------ | ----------------- | ------------------------------------- |
| GET    | `/assets`                   | Bearer | All               | List assets (paginated, filtered)     |
| POST   | `/assets`                   | Bearer | Admin, Supervisor | Create asset                          |
| GET    | `/assets/:id`               | Bearer | All               | Get asset detail                      |
| PATCH  | `/assets/:id`               | Bearer | Admin, Supervisor | Update asset                          |
| DELETE | `/assets/:id`               | Bearer | Admin             | Soft-delete (archive) asset           |
| GET    | `/assets/:id/history`       | Bearer | All               | Full assignment + maintenance history |
| GET    | `/assets/:id/qr`            | Bearer | Admin             | Get QR code (SVG + PNG)               |
| POST   | `/assets/:id/qr/regenerate` | Bearer | Admin             | Regenerate QR code                    |

### Assignments

| Method | Endpoint                   | Auth   | Roles                     | Description       |
| ------ | -------------------------- | ------ | ------------------------- | ----------------- |
| GET    | `/assignments`             | Bearer | All                       | List assignments  |
| GET    | `/assignments/active`      | Bearer | All                       | Active check-outs |
| POST   | `/assignments/checkout`    | Bearer | Admin, Supervisor, Worker | Check out a tool  |
| PATCH  | `/assignments/:id/checkin` | Bearer | Admin, Supervisor, Worker | Check in a tool   |
| GET    | `/assignments/:id`         | Bearer | All                       | Assignment detail |

### Maintenance

| Method | Endpoint                    | Auth   | Roles             | Description            |
| ------ | --------------------------- | ------ | ----------------- | ---------------------- |
| GET    | `/maintenance`              | Bearer | All               | List maintenance logs  |
| GET    | `/maintenance/overdue`      | Bearer | All               | Overdue items          |
| GET    | `/maintenance/upcoming`     | Bearer | All               | Due in next 30 days    |
| POST   | `/maintenance`              | Bearer | Admin, Supervisor | Create maintenance log |
| PATCH  | `/maintenance/:id`          | Bearer | Admin, Supervisor | Update log             |
| PATCH  | `/maintenance/:id/complete` | Bearer | Admin, Supervisor | Mark completed         |

### Reports

| Method | Endpoint               | Auth   | Roles | Description                  |
| ------ | ---------------------- | ------ | ----- | ---------------------------- |
| GET    | `/reports/audit`       | Bearer | Admin | Generate audit PDF (streams) |
| GET    | `/reports/assets`      | Bearer | Admin | Asset inventory PDF          |
| GET    | `/reports/maintenance` | Bearer | Admin | Maintenance history PDF      |

Query params: `?from=2024-01-01&to=2024-12-31&assetIds=...&format=pdf`

### QR Codes

| Method | Endpoint          | Auth           | Description                        |
| ------ | ----------------- | -------------- | ---------------------------------- |
| GET    | `/qr-codes`       | Bearer (Admin) | All QR codes for company           |
| GET    | `/qr-codes/sheet` | Bearer (Admin) | Print-ready QR sheet (HTML or PDF) |
| GET    | `/scan/:assetId`  | Public         | Scan landing page data             |

### Users / Team

| Method | Endpoint        | Auth   | Roles | Description           |
| ------ | --------------- | ------ | ----- | --------------------- |
| GET    | `/users`        | Bearer | Admin | List company users    |
| POST   | `/users/invite` | Bearer | Admin | Invite user by email  |
| PATCH  | `/users/:id`    | Bearer | Admin | Update role or status |
| DELETE | `/users/:id`    | Bearer | Admin | Deactivate user       |
| GET    | `/users/me`     | Bearer | All   | Current user profile  |
| PATCH  | `/users/me`     | Bearer | All   | Update own profile    |

### Dashboard

| Method | Endpoint              | Auth   | Description          |
| ------ | --------------------- | ------ | -------------------- |
| GET    | `/dashboard/stats`    | Bearer | KPI cards data       |
| GET    | `/dashboard/activity` | Bearer | Recent activity feed |

### Notifications

| Method | Endpoint                  | Auth   | Description             |
| ------ | ------------------------- | ------ | ----------------------- |
| GET    | `/notifications`          | Bearer | List user notifications |
| PATCH  | `/notifications/:id/read` | Bearer | Mark as read            |
| PATCH  | `/notifications/read-all` | Bearer | Mark all as read        |

### Uploads

| Method | Endpoint         | Auth   | Description                |
| ------ | ---------------- | ------ | -------------------------- |
| POST   | `/uploads/image` | Bearer | Upload image to Cloudinary |

---

## 8. Authentication & JWT Strategy

### Token Architecture

```
Access Token:  JWT, expires in 15 minutes, stored in memory (Zustand)
Refresh Token: JWT, expires in 30 days, stored in httpOnly cookie + hashed in DB
```

### Auth Service (`src/modules/auth/auth.service.ts`)

```typescript
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Create company
    const company = await this.companiesService.create({
      name: dto.companyName,
      slug: generateSlug(dto.companyName),
    });

    // 2. Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // 3. Create admin user
    const user = await this.usersService.create({
      ...dto,
      passwordHash,
      role: UserRole.ADMIN,
      companyId: company.id,
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) throw new UnauthorizedException("Invalid credentials");

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException("Invalid credentials");

    if (!user.isActive) throw new ForbiddenException("Account is deactivated");

    await this.usersService.updateLastLogin(user.id);
    return this.generateTokens(user);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findByIdWithRefreshToken(userId);
    if (!user?.refreshTokenHash) throw new ForbiddenException("Access denied");

    const tokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshTokenHash,
    );
    if (!tokenValid) throw new ForbiddenException("Access denied");

    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      companyId: user.companyId,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get("JWT_ACCESS_SECRET"),
        expiresIn: "15m",
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get("JWT_REFRESH_SECRET"),
        expiresIn: "30d",
      }),
    ]);

    // Store hashed refresh token
    await this.usersService.updateRefreshToken(
      user.id,
      await bcrypt.hash(refreshToken, 10),
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      company: { id: user.companyId },
    };
  }
}
```

### JWT Strategy

```typescript
// src/modules/auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get("JWT_ACCESS_SECRET"),
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      companyId: payload.companyId,
      role: payload.role,
    };
  }
}
```

---

## 9. Role-Based Access Control (RBAC)

### Roles Guard

```typescript
// src/common/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true; // No roles = public within auth

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### Usage in Controllers

```typescript
@Controller("assets")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: "Create a new asset" })
  create(@Body() dto: CreateAssetDto, @CurrentUser() user: JwtUser) {
    return this.assetsService.create(dto, user.companyId);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  remove(@Param("id", ParseUUIDPipe) id: string, @CurrentUser() user: JwtUser) {
    return this.assetsService.archive(id, user.companyId);
  }
}
```

### Custom Decorators

```typescript
// src/common/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// src/common/decorators/roles.decorator.ts
export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

---

## 10. Multi-Tenancy Architecture

### Strategy: **Shared Database, Row-Level Isolation**

Every table that belongs to a tenant includes a `company_id` column. Every query is automatically scoped to the authenticated user's `companyId` extracted from the JWT.

### Assets Service — Tenant Scoping Example

```typescript
// src/modules/assets/assets.service.ts
@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
  ) {}

  async findAll(companyId: string, filters: FilterAssetsDto) {
    const qb = this.assetRepo
      .createQueryBuilder("asset")
      .where("asset.company_id = :companyId", { companyId }) // ALWAYS scoped
      .andWhere("asset.is_archived = false");

    if (filters.status) {
      qb.andWhere("asset.status = :status", { status: filters.status });
    }

    if (filters.category) {
      qb.andWhere("asset.category = :category", { category: filters.category });
    }

    if (filters.search) {
      qb.andWhere(
        "(asset.name ILIKE :search OR asset.serial_number ILIKE :search)",
        { search: `%${filters.search}%` },
      );
    }

    const [data, total] = await qb
      .orderBy("asset.created_at", "DESC")
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit)
      .getManyAndCount();

    return { data, total, page: filters.page, limit: filters.limit };
  }

  async findOneOrFail(id: string, companyId: string): Promise<Asset> {
    const asset = await this.assetRepo.findOne({
      where: { id, companyId }, // companyId ALWAYS included
    });
    if (!asset) throw new NotFoundException(`Asset ${id} not found`);
    return asset;
  }
}
```

### Company Member Guard

```typescript
// Validates that a user can only access resources belonging to their company
@Injectable()
export class CompanyMemberGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userCompanyId = request.user.companyId;
    const paramCompanyId = request.params.companyId;

    if (paramCompanyId && paramCompanyId !== userCompanyId) {
      throw new ForbiddenException("Access denied to this company resource");
    }
    return true;
  }
}
```

---

## 11. QR Code Service

### Architecture

```
Asset created → generateQrCode(asset.id) →
  1. Payload URL = https://app.fieldvault.io/scan/{asset.uuid}
  2. Generate SVG string with qrcode library
  3. Convert SVG → PNG buffer (sharp)
  4. Upload PNG to Cloudinary → get CDN URL
  5. Save qrCodeUrl to asset record
  6. Return { svgString, pngUrl }
```

### QR Code Service

```typescript
// src/modules/qr-codes/qr-codes.service.ts
import * as QRCode from "qrcode";
import * as sharp from "sharp";

@Injectable()
export class QrCodesService {
  constructor(
    private readonly uploadsService: UploadsService,
    private readonly configService: ConfigService,
  ) {}

  async generateForAsset(
    asset: Asset,
  ): Promise<{ svgString: string; pngUrl: string }> {
    const appUrl = this.configService.get("APP_URL");
    const payload = `${appUrl}/scan/${asset.id}`;

    // Generate high-resolution SVG
    const svgString = await QRCode.toString(payload, {
      type: "svg",
      errorCorrectionLevel: "H", // Highest error correction (30% damage tolerance)
      margin: 2,
      color: { dark: "#000000", light: "#FFFFFF" },
    });

    // Convert to PNG buffer via sharp for reliable Cloudinary upload
    const svgBuffer = Buffer.from(svgString);
    const pngBuffer = await sharp(svgBuffer).resize(512, 512).png().toBuffer();

    // Upload to Cloudinary
    const pngUrl = await this.uploadsService.uploadBuffer(
      pngBuffer,
      `qr-codes/${asset.companyId}/${asset.id}`,
      "image/png",
    );

    return { svgString, pngUrl };
  }

  async getQrSheet(companyId: string, assetIds: string[]): Promise<string> {
    // Returns HTML string for print-ready QR sheet
    // Used by /qr-codes/sheet endpoint
    const assets = await this.assetsService.findByIds(assetIds, companyId);
    return this.renderPrintSheet(assets);
  }

  private renderPrintSheet(assets: Asset[]): string {
    const cards = assets
      .map(
        (a) => `
      <div class="qr-card">
        <img src="${a.qrCodeUrl}" alt="QR ${a.name}" />
        <strong>${a.name}</strong>
        <span>${a.serialNumber}</span>
      </div>
    `,
      )
      .join("");

    return `<!DOCTYPE html>
      <html>
        <head>
          <style>
            @media print { body { margin: 0; } }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 24px; }
            .qr-card { border: 1px solid #ccc; padding: 12px; text-align: center; page-break-inside: avoid; }
            .qr-card img { width: 120px; height: 120px; }
            strong { display: block; font-size: 12px; margin-top: 4px; }
            span { font-size: 10px; color: #666; }
          </style>
        </head>
        <body><div class="grid">${cards}</div></body>
      </html>`;
  }
}
```

---

## 12. PDF Report Generation Engine

### Strategy: Puppeteer (Server-Side HTML → PDF)

```
Client: GET /reports/audit?from=2024-01-01&to=2024-12-31
  → ReportsController → ReportsService
  → Fetch all relevant data from DB
  → Render HTML template with data
  → Puppeteer: launch headless Chrome → print HTML to PDF
  → Stream PDF back as application/pdf
```

### Reports Service

```typescript
// src/modules/reports/reports.service.ts
import * as puppeteer from "puppeteer";

@Injectable()
export class ReportsService {
  async generateAuditReport(
    companyId: string,
    dto: AuditReportDto,
  ): Promise<Buffer> {
    // 1. Fetch all data
    const [company, assets, assignments, maintenanceLogs] = await Promise.all([
      this.companiesService.findById(companyId),
      this.assetsService.findAll(companyId, { limit: 1000 }),
      this.assignmentsService.findForReport(companyId, dto.from, dto.to),
      this.maintenanceService.findForReport(companyId, dto.from, dto.to),
    ]);

    // 2. Render HTML template
    const html = renderAuditReportTemplate({
      company,
      assets: assets.data,
      assignments,
      maintenanceLogs,
      generatedAt: new Date(),
      dateRange: { from: dto.from, to: dto.to },
    });

    // 3. Launch Puppeteer and generate PDF
    return this.htmlToPdf(html);
  }

  private async htmlToPdf(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }
}
```

### Reports Controller (Streaming)

```typescript
// src/modules/reports/reports.controller.ts
@Get('audit')
@Roles(UserRole.ADMIN)
async generateAuditReport(
  @Query() dto: AuditReportDto,
  @CurrentUser() user: JwtUser,
  @Res() res: Response,
) {
  const pdfBuffer = await this.reportsService.generateAuditReport(user.companyId, dto);

  const filename = `FieldVault-Audit-${dto.from}-${dto.to}.pdf`;
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Content-Length': pdfBuffer.length,
  });
  res.end(pdfBuffer);
}
```

---

## 13. Background Jobs & Queue System (BullMQ)

### Job Types

| Queue           | Job                    | Trigger           | Action                           |
| --------------- | ---------------------- | ----------------- | -------------------------------- |
| `maintenance`   | `maintenance-reminder` | Daily cron (8 AM) | Alert assets due in 7 days       |
| `maintenance`   | `overdue-alert`        | Daily cron (8 AM) | Alert overdue maintenance        |
| `assignments`   | `overdue-checkout`     | Daily cron (9 AM) | Alert unreturned tools after 48h |
| `notifications` | `send-email`           | On event          | Send email via SendGrid          |
| `notifications` | `send-whatsapp`        | On event          | Send WhatsApp via Twilio         |

### Jobs Module Setup

```typescript
// src/jobs/jobs.module.ts
@Module({
  imports: [
    BullModule.registerQueue(
      { name: "maintenance" },
      { name: "assignments" },
      { name: "notifications" },
    ),
    ScheduleModule,
    MaintenanceModule,
    AssignmentsModule,
    NotificationsModule,
  ],
  providers: [
    MaintenanceReminderProcessor,
    OverdueAlertProcessor,
    NotificationProcessor,
    DailyJobsScheduler,
  ],
})
export class JobsModule {}
```

### Daily Cron Scheduler

```typescript
// src/jobs/daily-scheduler.service.ts
@Injectable()
export class DailyJobsScheduler {
  constructor(
    @InjectQueue("maintenance") private maintenanceQueue: Queue,
    @InjectQueue("assignments") private assignmentsQueue: Queue,
  ) {}

  @Cron("0 8 * * *", { timeZone: "UTC" }) // 8 AM UTC daily
  async scheduleMaintenance() {
    await this.maintenanceQueue.add(
      "maintenance-reminder",
      {},
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
      },
    );
    await this.maintenanceQueue.add(
      "overdue-alert",
      {},
      {
        attempts: 3,
      },
    );
  }

  @Cron("0 9 * * *", { timeZone: "UTC" })
  async scheduleOverdueCheckouts() {
    await this.assignmentsQueue.add("overdue-checkout", {});
  }
}
```

### Maintenance Reminder Processor

```typescript
// src/jobs/maintenance-reminder.processor.ts
@Processor("maintenance")
export class MaintenanceReminderProcessor extends WorkerHost {
  async process(job: Job) {
    if (job.name === "maintenance-reminder") {
      // Find all assets due for maintenance in next 7 days (across ALL companies)
      const dueAssets = await this.maintenanceService.findDueInDays(7);

      for (const asset of dueAssets) {
        await this.notificationsService.create({
          companyId: asset.companyId,
          type: NotificationType.MAINTENANCE_DUE,
          title: "Maintenance Due Soon",
          message: `${asset.name} (${asset.serialNumber}) is due for maintenance in 7 days.`,
          relatedEntityId: asset.id,
          relatedEntityType: "asset",
        });
      }
    }
  }
}
```

---

## 14. Notification Service

### Notifications Service

```typescript
// src/modules/notifications/notifications.service.ts
@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectQueue("notifications")
    private readonly notificationsQueue: Queue,
    private readonly emailChannel: EmailChannel,
  ) {}

  async create(dto: CreateNotificationDto): Promise<Notification> {
    // 1. Save to DB (in-app notification)
    const notification = await this.notificationRepo.save(
      this.notificationRepo.create(dto),
    );

    // 2. Dispatch to external channels via queue
    await this.notificationsQueue.add("send-email", {
      notificationId: notification.id,
      companyId: dto.companyId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
    });

    return notification;
  }

  async findForUser(userId: string, companyId: string) {
    return this.notificationRepo.find({
      where: [
        { userId, companyId },
        { userId: IsNull(), companyId }, // Company-wide broadcasts
      ],
      order: { createdAt: "DESC" },
      take: 50,
    });
  }
}
```

### Email Channel

```typescript
// src/modules/notifications/channels/email.channel.ts
@Injectable()
export class EmailChannel {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      auth: {
        user: "apikey",
        pass: configService.get("SENDGRID_API_KEY"),
      },
    });
  }

  async send(to: string, subject: string, htmlBody: string) {
    await this.transporter.sendMail({
      from: '"FieldVault" <alerts@fieldvault.io>',
      to,
      subject,
      html: htmlBody,
    });
  }
}
```

---

## 15. File Upload Service

### Cloudinary Integration

```typescript
// src/modules/uploads/uploads.service.ts
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class UploadsService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.get("CLOUDINARY_CLOUD_NAME"),
      api_key: configService.get("CLOUDINARY_API_KEY"),
      api_secret: configService.get("CLOUDINARY_API_SECRET"),
    });
  }

  async uploadBuffer(
    buffer: Buffer,
    publicId: string,
    mimeType: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: "fieldvault",
          resource_type: "image",
          transformation: [
            { width: 1024, height: 1024, crop: "limit" }, // Cap size
            { quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        },
      );
      upload.end(buffer);
    });
  }
}
```

### Upload Controller

```typescript
// src/modules/uploads/uploads.controller.ts
@Post('image')
@UseInterceptors(FileInterceptor('file'))
async uploadImage(
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),  // 5MB
        new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
      ],
    })
  )
  file: Express.Multer.File,
  @CurrentUser() user: JwtUser,
) {
  const url = await this.uploadsService.uploadBuffer(
    file.buffer,
    `uploads/${user.companyId}/${Date.now()}`,
    file.mimetype,
  );
  return { url };
}
```

---

## 16. Validation & DTOs

### Pagination DTO

```typescript
// src/common/dto/pagination.dto.ts
export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
```

### Create Asset DTO

```typescript
// src/modules/assets/dto/create-asset.dto.ts
export class CreateAssetDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  serialNumber: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ enum: AssetCategory })
  @IsEnum(AssetCategory)
  category: AssetCategory;

  @ApiPropertyOptional()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  purchaseValue?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  purchaseDate?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  maintenanceIntervalDays?: number;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string;
}
```

### Global Response Transform Interceptor

```typescript
// src/common/interceptors/response-transform.interceptor.ts
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

// All responses become:
// { success: true, data: {...}, timestamp: "2024-..." }
```

---

## 17. Error Handling Strategy

### HTTP Exception Filter

```typescript
// src/common/filters/http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatusCode();
    const exceptionResponse = exception.getResponse();

    const errorBody = {
      success: false,
      statusCode: status,
      message:
        typeof exceptionResponse === "string"
          ? exceptionResponse
          : (exceptionResponse as any).message,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      `${request.method} ${request.url} → ${status}`,
      errorBody,
    );
    response.status(status).json(errorBody);
  }
}
```

### Standard Error Responses

| Status | Scenario           | Example                                             |
| ------ | ------------------ | --------------------------------------------------- |
| 400    | Validation failed  | `{ message: ['name must be longer than 2 chars'] }` |
| 401    | No/invalid token   | `{ message: 'Unauthorized' }`                       |
| 403    | Insufficient role  | `{ message: 'Access denied' }`                      |
| 404    | Resource not found | `{ message: 'Asset abc123 not found' }`             |
| 409    | Conflict           | `{ message: 'Serial number already exists' }`       |
| 429    | Rate limited       | `{ message: 'Too many requests' }`                  |
| 500    | Server error       | `{ message: 'Internal server error' }`              |

---

## 18. Logging Strategy

### Winston Configuration

```typescript
// src/config/winston.config.ts
import * as winston from "winston";

export const winstonConfig = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp, context }) =>
            `[${timestamp}] [${context ?? "APP"}] ${level}: ${message}`,
        ),
      ),
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
};
```

### What Gets Logged

| Level   | When                                               |
| ------- | -------------------------------------------------- |
| `info`  | Request in / response out, job started/completed   |
| `warn`  | Rate limit hit, token refresh, suspicious activity |
| `error` | Unhandled exceptions, DB errors, job failures      |
| `debug` | SQL queries (dev only)                             |

---

## 19. Caching Strategy (Redis)

### What to Cache

| Key Pattern                | TTL    | Data                     |
| -------------------------- | ------ | ------------------------ |
| `company:{id}:stats`       | 5 min  | Dashboard KPI aggregates |
| `company:{id}:assets:list` | 2 min  | Paginated asset list     |
| `asset:{id}`               | 10 min | Single asset detail      |
| `user:{id}`                | 15 min | User profile             |

### Cache Service Pattern

```typescript
// src/common/cache.service.ts
@Injectable()
export class CacheService {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    return raw ? JSON.parse(raw) : null;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) await this.redis.del(...keys);
  }
}

// Usage in AssetsService:
async findAll(companyId: string, filters: FilterAssetsDto) {
  const cacheKey = `company:${companyId}:assets:${JSON.stringify(filters)}`;
  const cached = await this.cacheService.get(cacheKey);
  if (cached) return cached;

  const result = await this.fetchFromDb(companyId, filters);
  await this.cacheService.set(cacheKey, result, 120); // 2 min TTL
  return result;
}
```

---

## 20. Security Hardening

### Applied Security Measures

```typescript
// 1. Helmet — sets secure HTTP headers
app.use(helmet());

// 2. CORS — only allow frontend origins
app.enableCors({ origin: process.env.ALLOWED_ORIGINS?.split(',') });

// 3. Rate limiting — 100 req/min per IP globally
ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }])

// 4. Auth endpoints — stricter rate limit
ThrottlerModule.forRoot([
  { name: 'auth', ttl: 60000, limit: 10 },  // 10 login attempts per minute
  { name: 'global', ttl: 60000, limit: 100 },
])

// 5. Passwords — bcrypt with cost factor 12
await bcrypt.hash(password, 12);

// 6. DTO whitelisting — strip any unknown fields
new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })

// 7. SQL injection — TypeORM parameterized queries (never raw string concat)
.where('asset.company_id = :companyId', { companyId })

// 8. Tenant isolation — every service method receives companyId from JWT
// Never trust companyId from request body

// 9. UUID validation on all :id params
@Param('id', ParseUUIDPipe) id: string

// 10. Sensitive fields excluded from SELECT by default
@Column({ select: false }) passwordHash: string;
```

---

## 21. Testing Strategy

### Test Pyramid

```
E2E Tests (Supertest)       — Full HTTP request → response on real DB
Integration Tests (Jest)    — Service + Repository with test DB
Unit Tests (Jest)           — Pure logic, DTOs, utils
```

### Key Test Coverage

| Module                                  | Test Type   | Priority |
| --------------------------------------- | ----------- | -------- |
| `AuthService.login()`                   | Unit        | Critical |
| `AuthService.refreshTokens()`           | Unit        | Critical |
| `AssetsService.findAll()`               | Unit        | High     |
| `AssetsService` — tenant isolation      | Integration | Critical |
| `POST /auth/login`                      | E2E         | Critical |
| `POST /assignments/checkout` — then GET | E2E         | High     |
| `GET /reports/audit` — streams PDF      | E2E         | High     |
| `MaintenanceReminderProcessor`          | Unit        | Medium   |

### Example Unit Test

```typescript
// src/modules/assets/assets.service.spec.ts
describe("AssetsService", () => {
  describe("findOneOrFail", () => {
    it("should return asset when it belongs to company", async () => {
      mockRepo.findOne.mockResolvedValue(mockAsset);
      const result = await service.findOneOrFail("asset-id", "company-id");
      expect(result).toEqual(mockAsset);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: "asset-id", companyId: "company-id" },
      });
    });

    it("should throw NotFoundException when asset not found", async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(
        service.findOneOrFail("bad-id", "company-id"),
      ).rejects.toThrow(NotFoundException);
    });

    it("should not return asset from different company", async () => {
      mockRepo.findOne.mockResolvedValue(null); // companyId mismatch → null
      await expect(
        service.findOneOrFail("asset-id", "other-company"),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
```

---

## 22. Environment & Configuration

### `.env.example`

```bash
# App
NODE_ENV=production
PORT=3001
APP_URL=https://app.fieldvault.io
ALLOWED_ORIGINS=https://app.fieldvault.io,https://fieldvault.io

# Database
DATABASE_URL=postgresql://user:password@host:5432/fieldvault

# Redis
REDIS_URL=redis://default:password@host:6379

# JWT
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx
EMAIL_FROM=alerts@fieldvault.io

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### Joi Validation Schema

```typescript
// src/config/validation.schema.ts
export const JoiValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "production", "test").required(),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  APP_URL: Joi.string().uri().required(),
});
// App will refuse to start if any required env vars are missing
```

---

## 23. Deployment Architecture

### Production Stack

```
┌──────────────────────────────────────────────────────────────┐
│                       PRODUCTION                             │
│                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌──────────────┐  │
│  │  Vercel      │     │  Railway     │     │  Neon        │  │
│  │ (Next.js)    │────►│ (NestJS API) │────►│ (Postgres)   │  │
│  └─────────────┘     └─────────────┘     └──────────────┘  │
│                              │                              │
│                    ┌─────────┴─────────┐                   │
│                    │                   │                   │
│             ┌──────┴──┐         ┌──────┴──┐               │
│             │ Upstash  │         │Cloudinary│               │
│             │ (Redis)  │         │(Images)  │               │
│             └──────────┘         └──────────┘               │
└──────────────────────────────────────────────────────────────┘
```

### Railway Deployment Config (`railway.toml`)

```toml
[build]
  builder = "NIXPACKS"
  buildCommand = "npm run build"

[deploy]
  startCommand = "node dist/main.js"
  healthcheckPath = "/api/health"
  healthcheckTimeout = 30
  restartPolicyType = "ON_FAILURE"
  restartPolicyMaxRetries = 3
```

### Health Check Endpoint

```typescript
// src/modules/health/health.controller.ts
@Get('health')
@SkipThrottle()
async check() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  };
}
```

### Database Migrations (CI/CD)

```bash
# Run before deploy — never use synchronize: true in production
npm run typeorm migration:run

# Rollback if needed
npm run typeorm migration:revert
```

---

## 24. Development Roadmap (6 Weeks)

### Week 1 — Foundation & Auth

- [ ] Init NestJS project with full folder structure
- [ ] Configure TypeORM + PostgreSQL + Neon
- [ ] Write all database migrations (001–006)
- [ ] Implement `AuthModule` — register, login, refresh, logout
- [ ] JWT strategy + refresh token rotation
- [ ] Global validation pipe, exception filter, response interceptor
- [ ] Swagger documentation setup
- [ ] `/api/health` endpoint

### Week 2 — Company, User & Asset Modules

- [ ] `CompaniesModule` — CRUD + stats endpoint
- [ ] `UsersModule` — invite, role management, profile
- [ ] `AssetsModule` — full CRUD with tenant scoping
- [ ] Multi-tenancy isolation (every query scoped to companyId)
- [ ] Asset filtering + pagination
- [ ] RBAC guards applied across all routes

### Week 3 — Assignment & Maintenance Modules

- [ ] `AssignmentsModule` — checkout, checkin, active list
- [ ] Auto-update asset status on checkout/checkin
- [ ] `MaintenanceModule` — CRUD, complete action
- [ ] Filter: overdue, upcoming (next 30 days)
- [ ] `DashboardModule` — KPI stats aggregation

### Week 4 — QR Codes, Reports & File Upload

- [ ] `QrCodesModule` — generate, upload to Cloudinary, print sheet
- [ ] `UploadsModule` — Cloudinary integration, validation
- [ ] `ReportsModule` — Puppeteer PDF generation
- [ ] Audit report template (HTML) with company branding
- [ ] PDF streaming to client

### Week 5 — Jobs, Notifications & Alerts

- [ ] BullMQ queues setup (maintenance, assignments, notifications)
- [ ] Daily cron scheduler (maintenance reminders, overdue alerts)
- [ ] `NotificationsModule` — in-app + email dispatch
- [ ] SendGrid email channel
- [ ] WhatsApp channel (Twilio)
- [ ] Redis caching for hot endpoints

### Week 6 — Security, Testing & Production Deploy

- [ ] Rate limiting per endpoint (stricter on auth routes)
- [ ] Helmet, CORS, UUID pipe hardening
- [ ] Unit tests for all services
- [ ] E2E tests for auth, assets, checkout, PDF
- [ ] Database indexes added and verified
- [ ] Deploy to Railway + configure env vars
- [ ] Connect to Neon (prod DB) + run migrations
- [ ] Smoke test all endpoints via Swagger

---

## Appendix A — API Response Envelope

```typescript
// All successful responses
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-15T08:30:00.000Z"
}

// Paginated list responses
{
  "success": true,
  "data": {
    "items": [...],
    "total": 47,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  },
  "timestamp": "2024-01-15T08:30:00.000Z"
}

// Error responses
{
  "success": false,
  "statusCode": 404,
  "message": "Asset abc123 not found",
  "path": "/api/v1/assets/abc123",
  "timestamp": "2024-01-15T08:30:00.000Z"
}
```

## Appendix B — TypeScript Shared Types (API Contract)

```typescript
// Shared between backend and frontend — can be published as npm package
export interface JwtUser {
  userId: string;
  companyId: string;
  role: UserRole;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}
```

---

_FieldVault — Built by Nadim Chowdhury_
_Document Version 1.0.0 — Backend (NestJS) Architecture_
