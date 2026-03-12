# FieldVault

> **Audit-Ready Asset Intelligence for Construction Teams**

FieldVault is a production-ready Micro-SaaS platform that helps small construction firms (5–20 employees) track equipment, manage maintenance schedules, and generate one-click audit compliance reports — eliminating tool loss, missed maintenance, and failed safety inspections.

---

## The Problem It Solves

Small construction contractors own $200,000+ worth of equipment. Every year they lose thousands because:

- Tools go missing with no record of who last had them
- Maintenance is forgotten, leading to breakdowns mid-job
- Safety audits are failed because there's no proof of inspection history

FieldVault fixes all three with QR code tracking, automated maintenance alerts, and one-click PDF audit reports.

---

## Monorepo Structure

```
fieldvault-project/
├── apps/
│   ├── web/              # Next.js 16 — Office manager dashboard
│   ├── api/              # NestJS — REST API backend
│   └── mobile/           # React Native / Expo — Field worker app
│
├── packages/
│   ├── types/            # Shared TypeScript types (web + api + mobile)
│   ├── validators/       # Shared Zod schemas
│   └── constants/        # Shared enums, permission maps
│
├── docs/
│   ├── fieldvault-frontend-architecture.md
│   ├── fieldvault-backend-architecture.md
│   └── fieldvault-mobile-architecture.md
│
├── .github/
│   └── workflows/
│       ├── web.yml       # Vercel deploy
│       ├── api.yml       # Railway deploy
│       └── mobile.yml    # EAS build trigger
│
├── package.json          # Workspace root
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
| Styling      | Tailwind CSS + shadcn/ui |
| Server State | TanStack Query v5        |
| Client State | Zustand                  |
| Forms        | React Hook Form + Zod    |
| Charts       | Recharts                 |
| PDF          | @react-pdf/renderer      |
| QR           | qrcode.react             |
| Deploy       | Vercel                   |

### Backend API (`apps/api`)

| Layer         | Technology                    |
| ------------- | ----------------------------- |
| Framework     | NestJS 11                     |
| Language      | TypeScript 5                  |
| Database      | PostgreSQL 17 (Neon)          |
| ORM           | TypeORM                       |
| Cache / Queue | Redis (Upstash) + BullMQ      |
| Auth          | JWT (access + refresh tokens) |
| PDF Engine    | Puppeteer                     |
| File Storage  | Cloudinary                    |
| Email         | SendGrid                      |
| Deploy        | Railway                       |

### Mobile App (`apps/mobile`)

| Layer        | Technology                      |
| ------------ | ------------------------------- |
| Framework    | React Native 0.81 + Expo SDK 54 |
| Language     | TypeScript 5                    |
| Navigation   | Expo Router v6                  |
| Storage      | MMKV + expo-secure-store        |
| Server State | TanStack Query v5               |
| Client State | Zustand                         |
| QR Scanner   | expo-camera                     |
| Push Alerts  | expo-notifications              |
| Build        | EAS Build                       |
| Updates      | EAS Update (OTA)                |

---

## Core Features

| Feature               | Web | Mobile | Description                            |
| --------------------- | :-: | :----: | -------------------------------------- |
| Asset Registry        | ✅  |   ✅   | Create, edit, categorize all equipment |
| QR Code Tracking      | ✅  |   ✅   | Generate codes, scan to check out/in   |
| Check-In / Check-Out  | ✅  |   ✅   | Full assignment history per tool       |
| Maintenance Scheduler | ✅  |   ✅   | Log events, get automated reminders    |
| Damage Reports        | ✅  |   ✅   | Photo-attached condition reports       |
| Audit PDF Reports     | ✅  |   —    | One-click 12-month compliance PDF      |
| Push Notifications    |  —  |   ✅   | Maintenance due, overdue tool alerts   |
| Offline Mode          |  —  |   ✅   | Works on-site without internet         |
| Team Management       | ✅  |   —    | Invite users, assign roles             |
| Dashboard & KPIs      | ✅  |   —    | Asset health charts, activity feed     |

---

## Architecture Docs

Full system design documents are in `/docs`:

| Document                                                                            | Description                                                                                  |
| ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [`fieldvault-frontend-architecture.md`](./docs/fieldvault-frontend-architecture.md) | Next.js web dashboard — routing, components, state, API layer, RBAC, QR, PDF, 6-week roadmap |
| [`fieldvault-backend-architecture.md`](./docs/fieldvault-backend-architecture.md)   | NestJS API — modules, database schema, auth, multi-tenancy, jobs, notifications, security    |
| [`fieldvault-mobile-architecture.md`](./docs/fieldvault-mobile-architecture.md)     | Expo mobile app — navigation, QR scanner, offline queue, push notifications, EAS deploy      |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL + Redis)
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone & Install

```bash
git clone https://github.com/nadim-chowdhury/fieldvault-project.git
cd fieldvault
npm install
```

### 2. Environment Setup

```bash
# Copy env files for each app
cp apps/api/.env.example    apps/api/.env
cp apps/web/.env.example    apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
```

Fill in your credentials in each `.env` file. See the architecture docs for full variable references.

### 3. Start Local Services (Docker)

```bash
# Start PostgreSQL + Redis
docker compose up -d

# Verify they're running
docker compose ps
```

### 4. Database Setup

```bash
cd apps/api
npm run migration:run   # Creates all tables
npm run seed            # (Optional) Seeds demo data
```

### 5. Run All Apps

```bash
# From the root — runs all three apps in parallel
npm dev
```

Or run individually:

```bash
# Web dashboard  → http://localhost:3000
cd apps/web && npm dev

# Backend API    → http://localhost:3001
# Swagger docs   → http://localhost:3001/api/docs
cd apps/api && npm dev

# Mobile app     → Expo Go or simulator
cd apps/mobile && npm start
```

---

## Database Schema (Quick Reference)

```
Company      → one-to-many → User
Company      → one-to-many → Asset
Asset        → one-to-many → Assignment
Asset        → one-to-many → MaintenanceLog
Assignment   → many-to-one → User
Assignment   → many-to-one → Asset
Notification → many-to-one → Company
```

All tenant data is isolated by `company_id` on every row. Every API query is scoped to the authenticated user's company extracted from the JWT — there is no way to access another company's data.

---

## User Roles

| Role           | Web Access                                          | Mobile Access                        |
| -------------- | --------------------------------------------------- | ------------------------------------ |
| **Admin**      | Full access — all modules, billing, team management | All features                         |
| **Supervisor** | Assets, assignments, maintenance (no billing/users) | All features except team             |
| **Worker**     | View assets, view own assignments                   | Scan QR, check out/in, damage report |

---

## API Overview

Base URL: `https://api.fieldvault.io/api/v1`
Full interactive docs: `/api/docs` (Swagger UI)

```
POST   /auth/login
POST   /auth/register
POST   /auth/refresh

GET    /assets
POST   /assets
GET    /assets/:id
PATCH  /assets/:id
DELETE /assets/:id
GET    /assets/:id/qr

POST   /assignments/checkout
PATCH  /assignments/:id/checkin
GET    /assignments/active

GET    /maintenance
POST   /maintenance
PATCH  /maintenance/:id/complete

GET    /reports/audit?from=&to=     → streams PDF

GET    /dashboard/stats
GET    /notifications
```

---

## Deployment

| App           | Platform                           | Trigger                                                  |
| ------------- | ---------------------------------- | -------------------------------------------------------- |
| `apps/web`    | Vercel                             | Push to `main` → auto-deploy                             |
| `apps/api`    | Railway                            | Push to `main` → auto-deploy                             |
| `apps/mobile` | EAS Build → App Store / Play Store | `eas build --profile production`                         |
| Mobile OTA    | EAS Update                         | `eas update --branch production` (JS changes, no review) |

---

## Project Info

**Author:** Nadim Chowdhury
**Contact:** nadim-chowdhury@outlook.com
**Portfolio:** [nadim.vercel.app](https://nadim.vercel.app)
**GitHub:** [github.com/nadim-chowdhury](https://github.com/nadim-chowdhury)
**LinkedIn:** [linkedin.com/in/nadim-chowdhury](https://linkedin.com/in/nadim-chowdhury)

---

_FieldVault v1.0.0_
