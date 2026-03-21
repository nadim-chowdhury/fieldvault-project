# FieldVault

> **Audit-Ready Asset Intelligence for Construction & Engineering Teams**

FieldVault is a production-ready **Multi-Tenant B2B SaaS** platform that helps construction firms track equipment, manage maintenance schedules, and generate one-click audit compliance reports — eliminating tool loss, missed maintenance, and failed safety inspections.

**Built for the Extended License market ($200+).** A buyer hosts it once and sells "Company Accounts" to multiple construction firms — turning your purchase into a recurring revenue business.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-e0234e?logo=nestjs)](https://nestjs.com/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)

---

## Why FieldVault?

Small construction contractors own **$200,000+** worth of equipment. Every year they lose thousands because:

- 🔍 Tools go missing with no record of who last had them
- 🔧 Maintenance is forgotten, leading to breakdowns mid-job
- 📋 Safety audits are failed because there's no proof of inspection history

FieldVault fixes all three with **QR code tracking**, **automated maintenance alerts**, and **one-click PDF audit reports**.

---

## Live Demo Credentials

After running the seed script, use these accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@acme-construction.com` | `Admin123!` |
| **Supervisor** | `sarah@acme-construction.com` | `Admin123!` |
| **Worker** | `mike@acme-construction.com` | `Admin123!` |

---

## Monorepo Structure

```
fieldvault-project/
├── apps/
│   ├── web/              # Next.js 16 — Office manager dashboard + landing page
│   ├── api/              # NestJS 11 — REST API backend (15 modules)
│   └── mobile/           # React Native / Expo — Field worker app (offline-first)
│
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── validators/       # Shared Zod schemas (14 schemas)
│   └── constants/        # Shared enums, permission maps
│
├── docs/                 # Architecture documentation
├── docker-compose.yml    # PostgreSQL 16 + Redis 7 (dev)
├── docker-compose.prod.yml
├── turbo.json            # Turborepo pipeline
└── README.md
```

---

## Tech Stack

### Web Dashboard (`apps/web`)

| Layer        | Technology               |
| ------------ | ------------------------ |
| Framework    | Next.js 16 (App Router)  |
| Language     | TypeScript 5             |
| Styling      | Tailwind CSS             |
| Server State | TanStack Query v5        |
| Client State | Zustand                  |
| Charts       | Recharts                 |
| PDF          | @react-pdf/renderer      |
| QR           | qrcode.react             |
| Toasts       | Sonner                   |

### Backend API (`apps/api`)

| Layer         | Technology                    |
| ------------- | ----------------------------- |
| Framework     | NestJS 11                     |
| Language      | TypeScript 5                  |
| Database      | PostgreSQL 16                 |
| ORM           | TypeORM                       |
| Cache / Queue | Redis 7 + BullMQ             |
| Auth          | JWT (access + refresh tokens) |
| PDF Engine    | Puppeteer                     |
| File Storage  | Cloudinary                    |
| Email         | SendGrid                      |
| Docs          | Swagger UI (`/api/docs`)      |

### Mobile App (`apps/mobile`)

| Layer           | Technology                      |
| --------------- | ------------------------------- |
| Framework       | React Native 0.81 + Expo SDK 54 |
| Language        | TypeScript 5                    |
| Navigation      | Expo Router v6                  |
| Offline Storage | MMKV + expo-secure-store        |
| Offline Sync    | Custom mutation queue (MMKV)    |
| Server State    | TanStack Query v5               |
| Client State    | Zustand                         |
| QR Scanner      | expo-camera                     |
| Push Alerts     | expo-notifications              |

---

## Core Features

| Feature               | Web | Mobile | Description                                       |
| --------------------- | :-: | :----: | ------------------------------------------------- |
| Landing Page          | ✅  |   —    | Premium public page with pricing tiers             |
| Asset Registry        | ✅  |   ✅   | Create, edit, categorize, archive all equipment    |
| QR Code Tracking      | ✅  |   ✅   | Generate codes, scan to check out/in               |
| Check-In / Check-Out  | ✅  |   ✅   | Full assignment history per tool                   |
| Maintenance Scheduler | ✅  |   ✅   | Schedule tasks, get overdue alerts, complete/delete |
| Sites Management      | ✅  |   —    | Manage construction sites with coordinates         |
| Audit Trail           | ✅  |   —    | Every action logged with before/after data         |
| Audit PDF Reports     | ✅  |   —    | One-click 12-month compliance PDF                  |
| CSV Export             | ✅  |   —    | Export full asset inventory as CSV                  |
| Team Management       | ✅  |   —    | Invite members, assign roles (Admin/Supervisor/Worker) |
| Company Settings      | ✅  |   —    | Name, phone, address, timezone, plan display       |
| Forgot Password       | ✅  |   —    | Email reset link flow                              |
| Dashboard & KPIs      | ✅  |   ✅   | Asset health charts, activity feed, stats          |
| Push Notifications    |  —  |   ✅   | Maintenance due, overdue tool alerts               |
| Offline Mode          |  —  |   ✅   | MMKV queue, auto-sync on reconnect, 5x retry      |
| Change Password       |  —  |   ✅   | In-app password update                             |
| Sync Status           |  —  |   ✅   | Online/offline banner with manual sync button      |

---

## API Modules (15 Controllers)

| Module | Endpoints | Access |
|--------|-----------|--------|
| **Auth** | register, login, refresh, forgot-password, reset-password | Public |
| **Assets** | CRUD, QR code generation, bulk QR | All roles |
| **Assignments** | checkout, checkin, active, by-asset | All roles |
| **Maintenance** | CRUD, overdue list, CRON alerts | Admin/Supervisor |
| **Sites** | CRUD for construction sites | Admin/Supervisor |
| **Users** | list, invite, update, deactivate | Admin |
| **Companies** | get, update, stats | Admin |
| **Reports** | audit PDF, inventory summary | Admin/Supervisor |
| **Audit Logs** | paginated list with entity filter | Admin |
| **Notifications** | list, unread count, mark read | All roles |
| **Documents** | CRUD for asset documents | Admin/Supervisor |
| **Uploads** | file upload (images, PDFs) | All roles |
| **Payments** | checkout session, history, webhook | Admin |
| **API Keys** | CRUD for external integrations | Admin |
| **Dashboard** | aggregated stats and KPIs | All roles |

Full interactive docs available at `/api/docs` (Swagger UI).

---

## Web Dashboard Pages (10 Pages)

| Page | Route | Description |
|------|-------|-------------|
| Landing Page | `/` | Premium public page — hero, features, pricing, CTA |
| Login / Register | `/login` | Auth with forgot password flow |
| Dashboard | `/dashboard` | KPI cards, charts, activity feed |
| Assets | `/dashboard/assets` | Card grid, add/edit/QR modals, bulk select |
| Asset Detail | `/dashboard/assets/[id]` | Full asset profile, history, documents |
| Sites | `/dashboard/sites` | Construction site management with CRUD |
| Team | `/dashboard/team` | Member list, invite modal, role management |
| Maintenance | `/dashboard/maintenance` | Schedule tasks, complete/delete, overdue alerts |
| Reports | `/dashboard/reports` | Audit PDF, inventory summary, CSV export |
| Audit Trail | `/dashboard/audit-logs` | Compliance log with expandable data snapshots |
| Notifications | `/dashboard/notifications` | Read/unread, mark all read |
| Settings | `/dashboard/settings` | Company info, plan display, security panel |

---

## Mobile App Screens (5 Tabs)

| Tab | Description |
|-----|-------------|
| **Dashboard** | Stats cards, recent activity, quick actions |
| **Assets** | Scrollable asset list with search |
| **Scan** | QR code scanner → checkout/checkin flow |
| **Maintenance** | Task list with overdue alerts, pull-to-refresh |
| **Profile** | User info, change password, online/offline status, sync button |

---

## Getting Started

### Prerequisites

- **Node.js 20+**
- **Docker** (for PostgreSQL + Redis)
- **pnpm** (recommended) or npm

### 1. Clone & Install

```bash
git clone https://github.com/nadim-chowdhury/fieldvault-project.git
cd fieldvault-project
pnpm install
```

### 2. Environment Setup

```bash
cp apps/api/.env.example    apps/api/.env
cp apps/web/.env.example    apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

### 3. Start Local Services

```bash
# Start PostgreSQL 16 + Redis 7
docker compose up -d

# Verify
docker compose ps

# Optional: Start pgAdmin (localhost:5050) and Redis Commander (localhost:8081)
docker compose --profile tools up -d
```

### 4. Database Setup

```bash
cd apps/api
npm run migration:run   # Creates all tables
npm run seed            # Seeds demo company, 3 users, 10 assets, maintenance logs
```

### 5. Run All Apps

```bash
# From root — runs all three apps in parallel
npm run dev
```

Or individually:

```bash
# Web dashboard  → http://localhost:3000
cd apps/web && npm run dev

# Backend API    → http://localhost:3001
# Swagger docs   → http://localhost:3001/api/docs
cd apps/api && npm run dev

# Mobile app     → Expo Go or simulator
cd apps/mobile && npx expo start
```

---

## Database Schema

```
Company      → one-to-many → User
Company      → one-to-many → Asset
Company      → one-to-many → Site
Company      → one-to-many → AuditLog
Asset        → one-to-many → Assignment
Asset        → one-to-many → MaintenanceLog
Asset        → one-to-many → Document
Assignment   → many-to-one → User
Assignment   → many-to-one → Asset
Notification → many-to-one → User
Payment      → many-to-one → Company
```

**Multi-Tenant Isolation:** All data is scoped by `company_id`. Every API query filters by the authenticated user's company extracted from the JWT — zero cross-tenant data leakage.

---

## User Roles & Permissions

| Role           | Web Access                                          | Mobile Access                        |
| -------------- | --------------------------------------------------- | ------------------------------------ |
| **Admin**      | Full access — all modules, billing, team, audit logs | All features                         |
| **Supervisor** | Assets, assignments, maintenance, sites, reports    | All features except team             |
| **Worker**     | View assets, view own assignments                   | Scan QR, check out/in, damage report |

---

## Seed Data

The seed script (`npm run seed`) creates a realistic demo environment:

- **1 Company:** Acme Construction Ltd (Professional plan)
- **3 Users:** Admin, Supervisor, Worker (all password: `Admin123!`)
- **10 Assets:** DeWalt drills, CAT excavators, Hilti lasers, Ford trucks, generators...
- **5 Maintenance Logs:** Mix of past (completed) and future (scheduled) tasks
- **2 Active Assignments:** Equipment checked out to workers at job sites
- **1 Notification:** Maintenance due alert

---

## Deployment

| App           | Platform                           | Trigger                            |
| ------------- | ---------------------------------- | ---------------------------------- |
| `apps/web`    | Vercel                             | Push to `main` → auto-deploy      |
| `apps/api`    | Railway / Docker                   | Push to `main` → auto-deploy      |
| `apps/mobile` | EAS Build → App Store / Play Store | `eas build --profile production`   |
| Mobile OTA    | EAS Update                         | `eas update --branch production`   |

Docker images available via `apps/api/Dockerfile` and `apps/web/Dockerfile`.

---

## Architecture Docs

Detailed system design documents are in `/docs`:

| Document | Description |
| --- | --- |
| [`fieldvault-frontend-architecture.md`](./docs/fieldvault-frontend-architecture.md) | Next.js dashboard — routing, components, state, API layer, RBAC |
| [`fieldvault-backend-architecture.md`](./docs/fieldvault-backend-architecture.md) | NestJS API — modules, database schema, auth, multi-tenancy, security |
| [`fieldvault-mobile-architecture.md`](./docs/fieldvault-mobile-architecture.md) | Expo mobile — navigation, QR scanner, offline queue, push notifications |

---

## Security

- 🔐 **JWT Authentication** with access + refresh token rotation
- 🏢 **Multi-Tenant Isolation** — all queries scoped by `company_id`
- 🛡️ **Role-Based Access Control** — Admin, Supervisor, Worker
- 🔒 **Password Hashing** — bcrypt with 12 salt rounds
- 📝 **Audit Logging** — every CRUD action logged with before/after data
- 🔑 **API Key Auth** — for external integrations

---

## Project Info

**Author:** Nadim Chowdhury
**Contact:** nadim-chowdhury@outlook.com
**Portfolio:** [nadim.vercel.app](https://nadim.vercel.app)
**GitHub:** [github.com/nadim-chowdhury](https://github.com/nadim-chowdhury)
**LinkedIn:** [linkedin.com/in/nadim-chowdhury](https://linkedin.com/in/nadim-chowdhury)

---

_FieldVault v1.0.0 — Production Ready_
