# 🏨 Traces Check-In App — Developer Setup Guide

> **For Antigravity (AI Assistant):** This is the canonical developer reference for this project.
> Read this file first before making any changes. It covers the full architecture, role system,
> deployment pipeline, environment setup, and conventions used across the codebase.

---

## 📐 Project Overview

**Traces** is a multi-tenant hotel/property check-in SaaS platform. It allows guests to complete
pre-check-in digitally via WhatsApp OTP authentication, while providing dashboards for managers,
property owners, staff, and super admins.

### Live Deployments

| Service | URL |
|---|---|
| **Frontend (GitHub Pages)** | https://aditya211096.github.io/check-in-app/ |
| **Backend API (GCP Cloud Run)** | https://checkin-backend-eo2tmdx7lq-uc.a.run.app |
| **Login Page** | https://aditya211096.github.io/check-in-app/auth/phone/ |

---

## 🗂️ Monorepo Structure

```
check-in-app/                        ← Git root
├── checkin-fe/                      ← Next.js 14 Frontend (Static Export → GitHub Pages)
│   ├── app/                         ← App Router pages
│   │   ├── auth/phone/              ← WhatsApp OTP Login
│   │   ├── super/                   ← Super Admin dashboard
│   │   ├── dashboard/manager/       ← Manager/Owner dashboard
│   │   ├── dashboard/owner/         ← Owner analytics & pricing
│   │   ├── stay/[bookingId]/        ← Guest: check-in, room, checkout
│   │   ├── staff/                   ← Staff (maintenance/kitchen) dashboard
│   │   ├── bookings/                ← Booking list + feedback
│   │   ├── explore/                 ← Property discovery
│   │   └── onboarding/              ← New user profile setup
│   ├── components/                  ← Shared UI components
│   ├── lib/                         ← Utilities (api-config, date-utils, financial-utils)
│   ├── hooks/                       ← Custom React hooks
│   ├── .env.example                 ← Environment variable template
│   └── next.config.js               ← Static export config for GitHub Pages
│
├── checkin-be/                      ← NestJS Backend (Docker → GCP Cloud Run)
│   ├── src/
│   │   ├── main.ts                  ← App entry, CORS, port binding (0.0.0.0:8080)
│   │   ├── app.module.ts            ← Root module wiring all feature modules
│   │   ├── prisma.service.ts        ← Prisma client singleton
│   │   └── modules/
│   │       ├── auth/                ← JWT auth + Firebase Admin + OTP verification
│   │       ├── tenants/             ← Multi-tenant management
│   │       ├── properties/          ← Property CRUD
│   │       ├── bookings/            ← Booking lifecycle
│   │       ├── checkin/             ← Check-in flow & digital key
│   │       ├── notifications/       ← WhatsApp (Meta Cloud API) + FCM + SMS
│   │       ├── ids-kyc/             ← DigiLocker KYC integration
│   │       ├── inventory/           ← Room inventory management
│   │       ├── requests/            ← Guest service requests
│   │       ├── feedback/            ← Rating & feedback system
│   │       └── customer-profile/    ← Guest profile management
│   ├── prisma/
│   │   ├── schema.prisma            ← Full DB schema (PostgreSQL, multi-tenant RLS)
│   │   ├── seed.ts                  ← DB seed data
│   │   └── apply-rls.ts             ← Row Level Security policy setup
│   ├── Dockerfile                   ← Docker build (node:20-slim + OpenSSL for Prisma)
│   └── .env.example                 ← Environment variable template
│
├── .github/workflows/
│   ├── deploy-backend.yml           ← CI/CD: Docker build → GCP Artifact Registry → Cloud Run
│   └── deploy-frontend.yml          ← CI/CD: Next.js build validation + deploy trigger
│
├── README.md                        ← Quick project overview
└── SETUP.md                         ← ← YOU ARE HERE
```

---

## 🛠️ Tech Stack

### Frontend (`checkin-fe`)
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Static Export) |
| Styling | Tailwind CSS 3 |
| State | Zustand + TanStack Query |
| Forms | React Hook Form + Zod |
| Icons | Lucide React |
| Auth | Firebase JS SDK (client) |
| Notifications | Sonner (toast) |
| Testing | Vitest + Playwright |

### Backend (`checkin-be`)
| Layer | Technology |
|---|---|
| Framework | NestJS 10 |
| ORM | Prisma 5 (PostgreSQL) |
| Auth | JWT + Firebase Admin SDK |
| Queue | BullMQ + Redis |
| Notifications | Meta WhatsApp Cloud API v20.0 |
| Payments | Razorpay + Stripe |
| Cloud | GCP: Cloud Run, GCS, KMS, Secret Manager |
| Logging | nestjs-pino |

### Infrastructure
| Service | Provider |
|---|---|
| Frontend hosting | GitHub Pages (free, static) |
| Backend hosting | GCP Cloud Run (serverless container) |
| Database | PostgreSQL (Supabase or Cloud SQL) |
| Container Registry | GCP Artifact Registry |
| CI/CD | GitHub Actions |
| Domain | `aditya211096.github.io/check-in-app` |

---

## ✅ Prerequisites

Install these before cloning:

```bash
# Check versions
node --version     # Must be v20.x
npm --version      # v10.x+
docker --version   # For local backend container (optional)
```

- **Node.js 20** → https://nodejs.org/en/download
- **Git** → https://git-scm.com/downloads
- **VS Code** (recommended) → https://code.visualstudio.com
- **Docker Desktop** (optional, for local backend) → https://www.docker.com/products/docker-desktop

---

## 🚀 Step-by-Step Local Setup

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Aditya211096/check-in-app.git
cd check-in-app
```

### Step 2 — Setup Frontend

```bash
cd checkin-fe

# Install dependencies
npm install

# Copy environment file
copy .env.example .env.local        # Windows
# cp .env.example .env.local        # Mac/Linux

# Edit .env.local — see Environment Variables section below
# At minimum, set NEXT_PUBLIC_API_URL

# Start local dev server
npm run dev
```

Frontend will be available at: **http://localhost:3000**

### Step 3 — Setup Backend

```bash
cd checkin-be

# Install dependencies
npm install

# Copy environment file
copy .env.example .env              # Windows
# cp .env.example .env             # Mac/Linux

# Edit .env — see Environment Variables section below
# At minimum, set DATABASE_URL

# Generate Prisma client
npx prisma generate

# Run DB migrations (requires a running PostgreSQL)
npx prisma migrate dev

# Start local dev server (with hot reload)
npm run start:dev
```

Backend will be available at: **http://localhost:4000**

> **Note:** If you don't have a local PostgreSQL, you can point `DATABASE_URL` to the
> shared Supabase/Cloud SQL instance. Ask Aditya Agarwal for the connection string.

### Step 4 — Verify Everything Works

1. Open http://localhost:3000/auth/phone
2. Enter any preset phone number (see Role System below)
3. The OTP will appear as a hint below the input field
4. Enter the OTP → you'll be routed to the correct dashboard

---

## 🔐 Environment Variables

### Frontend (`checkin-fe/.env.local`)

```env
# REQUIRED: Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000

# Optional: Firebase (for push notifications)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FCM_VAPID_KEY=

# Optional: Payments
NEXT_PUBLIC_RAZORPAY_KEY_ID=
NEXT_PUBLIC_STRIPE_PK=

# Optional: Error tracking
NEXT_PUBLIC_SENTRY_DSN=
```

> For local development, only `NEXT_PUBLIC_API_URL=http://localhost:4000` is required.
> The app has a hardcoded fallback to the production Cloud Run URL if this is not set.

### Backend (`checkin-be/.env`)

```env
# Server
PORT=4000
NODE_ENV=development

# REQUIRED: Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/traces_checkin

# Optional: Redis (for BullMQ job queues)
REDIS_URL=redis://127.0.0.1:6379

# REQUIRED: JWT Authentication
JWT_SECRET=your-super-secret-32-byte-key-here
JWT_ACCESS_TTL=30d
JWT_REFRESH_TTL=90d

# Optional: Firebase Admin (for server-side push notifications)
FIREBASE_ADMIN_JSON={}

# Optional: WhatsApp Business API (Meta Cloud API)
WHATSAPP_API_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_OTP_TEMPLATE_NAME=otp_verification

# Optional: Cloud Storage (for KYC documents)
GCS_BUCKET=ids-vault-dev
KMS_KEY_URI=

# Optional: Payment gateways
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
STRIPE_SECRET_KEY=

# Optional: SMS/Email
MSG91_AUTH_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SENDGRID_API_KEY=

# CORS
ALLOWED_ORIGINS=http://localhost:3000
SESSION_COOKIE_DOMAIN=localhost
```

> If `WHATSAPP_API_TOKEN` or `WHATSAPP_PHONE_NUMBER_ID` are missing, the backend
> automatically falls back to **demo mode** — OTP is always `123456`.

---

## 👤 Role System & Test Accounts

The app uses **phone number-based routing** to simulate different user roles.
No real authentication backend is required for UI testing.

| Phone Number | Name | Role | Lands on |
|---|---|---|---|
| `7073818855` | Aditya Agarwal | Super Admin | `/super` |
| `9807289769` | Aditya Shubham | Super Admin | `/super` |
| `8586816812` | Yash Sharma | Property Owner + Manager | `/dashboard/manager` |
| `9660397475` | Ayushi Aggarwal | Guest | `/stay/bk-001` |
| `9810495179` | Sudhir Agarwal | Guest | `/stay/bk-001` |
| `9553765525` | Aditya (eSIM) | Staff (Maintenance) | `/staff` |

**Login flow:**
1. Go to `/auth/phone`
2. Enter one of the phone numbers above
3. A random OTP is generated and returned from the backend
4. The OTP is shown as a hint below the input field (test mode)
5. Type the OTP → routed to the role-specific dashboard

**Any unrecognized number** → routes to `/onboarding/profile` (new user flow)

---

## 📡 API Endpoints (Backend)

Base URL (production): `https://checkin-backend-eo2tmdx7lq-uc.a.run.app`
Base URL (local): `http://localhost:4000`

| Module | Route | Description |
|---|---|---|
| Auth | `POST /auth/login` | Phone + OTP login |
| Auth | `POST /auth/refresh` | Refresh JWT token |
| Notifications | `POST /notifications/whatsapp` | Send WhatsApp OTP |
| Notifications | `GET /notifications/history` | Get notification history |
| Properties | `GET /properties` | List properties |
| Properties | `POST /properties` | Create property |
| Bookings | `GET /bookings` | List bookings |
| Bookings | `POST /bookings` | Create booking |
| Check-in | `POST /checkin` | Process check-in |
| Requests | `GET /requests` | Guest service requests |
| Inventory | `GET /inventory` | Room inventory |
| Feedback | `POST /feedback` | Submit feedback |
| Tenants | `GET /tenants` | Tenant management |

---

## 🔄 CI/CD Pipeline

### How Deployments Work

```
Push to main branch
       │
       ├─ Changes in checkin-be/** ──→ Backend CI/CD Pipeline
       │                                 1. Docker build (node:20-slim)
       │                                 2. Push to GCP Artifact Registry
       │                                 3. gcloud run deploy → Cloud Run
       │
       └─ Changes in checkin-fe/** ──→ Frontend CI/CD Pipeline
                                         1. npm ci + npm run build
                                         2. Static export → out/ directory
                                         3. Deploy to GitHub Pages (gh-pages branch)
```

### GitHub Secrets Required (for CI/CD)

These are already configured in the repo. **DO NOT** commit real values to code.

| Secret | Used by | Description |
|---|---|---|
| `GCP_SA_KEY` | Backend CI | GCP Service Account JSON key |
| `DATABASE_URL` | Backend CI | PostgreSQL connection string |
| `WHATSAPP_API_TOKEN` | Backend CI | Meta permanent access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Backend CI | Meta phone number ID |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Backend CI | Meta WABA ID |
| `NEXT_PUBLIC_API_URL` | Frontend CI | Backend Cloud Run URL |

---

## 🗄️ Database Schema

The database uses **PostgreSQL with Row Level Security (RLS)** for multi-tenancy.
Every tenant-scoped table has a `tenantId` column.

Key models:
- `User` — with roles: `SUPER_ADMIN`, `PROPERTY_ADMIN`, `MANAGER`, `STAFF`, `CUSTOMER`, `DEPENDENT`
- `Tenant` — represents a hotel/property group
- `Property` — individual hotels/properties
- `Room` — rooms within a property
- `Booking` — guest booking with status lifecycle
- `CheckIn` — check-in record with KYC linkage
- `Request` — in-stay service requests
- `Notification` — delivery log for push/WhatsApp/SMS
- `Feedback` — guest ratings

Booking status flow:
```
DRAFT → PAYMENT_PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT → CLOSED
                                    ↘ CANCELLED_BY_GUEST / CANCELLED_BY_PROPERTY / NO_SHOW
```

---

## 🤖 Tips for Using Antigravity (AI Assistant)

When starting a session with Antigravity, tell it:

> *"Please read SETUP.md first to understand the full project architecture before making any changes."*

### Key conventions Antigravity follows in this project:

1. **Backend URL** — always use the env var `NEXT_PUBLIC_API_URL` with fallback to
   `https://checkin-backend-eo2tmdx7lq-uc.a.run.app` — never hardcode `localhost`
2. **Port** — backend runs on port `4000` locally, `8080` in Cloud Run (set by `PORT` env var)
3. **Backend triggers** — to trigger a backend redeployment, change a file inside `checkin-be/`
   (the CI workflow has a `paths:` filter — empty commits don't trigger it)
4. **OTP flow** — backend generates a random 6-digit OTP, sends via WhatsApp (Meta Cloud API),
   returns OTP in response for test mode display
5. **Demo mode** — if `WHATSAPP_API_TOKEN` is missing, OTP fallback is `123456`
6. **Static export** — the frontend is `output: 'export'` in next.config.js, so no SSR/API routes
7. **CORS** — configured in `main.ts`, controlled by `ALLOWED_ORIGINS` env var

### Deployment commands (for Antigravity to use):

```bash
# Trigger backend redeploy (must change a file in checkin-be/)
git add checkin-be/src/app.module.ts
git commit -m "ci: trigger backend redeploy"
git push origin main

# Test live backend WhatsApp endpoint
curl -X POST https://checkin-backend-eo2tmdx7lq-uc.a.run.app/notifications/whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone":"919xxxxxxxxx"}'

# Generate Prisma client after schema changes
cd checkin-be && npx prisma generate

# Run DB migrations locally
cd checkin-be && npx prisma migrate dev
```

---

## 🐛 Common Issues & Fixes

| Problem | Cause | Fix |
|---|---|---|
| Backend CI not triggered | `paths:` filter — no files in `checkin-be/` changed | Touch any file in `checkin-be/src/` and push |
| WhatsApp OTP not received | Meta WABA not business-verified / token expired | Use demo mode OTP shown on screen |
| `prisma generate` fails | OpenSSL not installed | Install OpenSSL or use `node:20-slim` with `libssl-dev` |
| CORS error on frontend | `ALLOWED_ORIGINS` env var missing in Cloud Run | Set `ALLOWED_ORIGINS=https://aditya211096.github.io` in GCP |
| 404 on GitHub Pages | Next.js dynamic routes not supported in static export | Check `next.config.js` for `trailingSlash: true` |
| `Cannot create message template` on Meta | WABA not business-verified | Complete Meta Business Verification first |

---

## 📋 WhatsApp Production Setup Status

| Step | Status |
|---|---|
| WhatsApp Business Account created | ✅ Done |
| Phone number registered (`+91 9553765525`) | ✅ Done |
| Permanent access token generated | ✅ Done |
| GitHub secrets updated | ✅ Done |
| Meta Business Verification | ⏳ Pending (required for templates) |
| `otp_verification` template created | ⏳ Blocked by business verification |

Until business verification is complete, the app runs in **demo mode** — the real random OTP
is generated by the backend and displayed on-screen as a test hint.

---

## 👥 Team

| Name | Role | Phone |
|---|---|---|
| Aditya Agarwal | App Owner / Super Admin / Dev | `7073818855` |
| Aditya Shubham | App Owner / Super Admin / Dev | `9807289769` |
| Yash Sharma | Property Owner / Manager / Dev | `8586816812` |

---

*Last updated: July 2026 · Maintained by the Traces Engineering Team*
