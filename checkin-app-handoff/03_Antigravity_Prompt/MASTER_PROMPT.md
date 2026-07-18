# Master Prompt — Antigravity IDE

Paste this ENTIRE file as the first message to a fresh Antigravity task.

---

You are building a production-grade, multi-tenant hostel Check-In / Check-Out web app. You have full access to two sibling folders inside the current workspace `Check-In App`:

- `checkin-fe/` — Frontend (Next.js 14 App Router + TypeScript strict + Tailwind + shadcn/ui + next-pwa)
- `checkin-be/` — Backend (NestJS 10 + TypeScript strict + Prisma + Postgres)

The full Business Requirements Document is at `01_BRD/BRD.md`. Wireframes are PNGs under `02_Wireframes/by-role/<role>/*.png` with `index.pdf` covering all 128 screens in order. Ops docs at `05_Ops/`.

## Non-negotiable operating rules

1. **Do not assume.** If any requirement is unclear, STOP and ask a single specific question. Never guess a schema field, endpoint shape, or copy string.
2. **Follow the BRD as the source of truth.** If a wireframe and the BRD disagree, the BRD wins — ask if unsure.
3. **Follow the milestones in section "Execution order" below strictly.** Do not start a milestone until the previous one passes its acceptance checklist (in `acceptance_checklist.md`).
4. **Two repos, two deploys.** Never mix FE and BE code. Never import BE Prisma models into FE.
5. **Multi-tenancy is not optional.** Every tenant-scoped table has `tenantId`. Postgres RLS is enforced on every request. Show me the RLS policy for every new tenant-scoped table.
6. **Security-first.** KYC files never leave GCS; only short-lived signed URLs are ever returned. Aadhaar raw numbers are NEVER stored — only masked images.
7. **Type-safe end to end.** Zod schemas are the single source; derive TypeScript types and Prisma input types from them. No `any`.
8. **Tests are part of "done."** Every new endpoint gets a Supertest integration test; every new page gets a Playwright happy-path.
9. **Commit small.** One page or one endpoint per commit. Conventional Commits.
10. **Ask before installing anything not listed in `package.json` targets below.**

## Locked stack (do not deviate)

### `checkin-fe`
```
next@14  react@18  typescript@5
tailwindcss@3  @tailwindcss/typography
shadcn/ui  radix-ui  lucide-react
@tanstack/react-query@5  zod  react-hook-form
next-intl  next-pwa
firebase (client sdk for phone auth only)
zustand (for local UI state)
sonner (toasts)
@casl/ability
playwright  vitest  @testing-library/react
```

### `checkin-be`
```
@nestjs/*@10  prisma@5  @prisma/client
firebase-admin  jsonwebtoken
bullmq  ioredis
@casl/ability
zod  class-validator  class-transformer
pino  nestjs-pino
@google-cloud/storage  @google-cloud/kms  @google-cloud/secret-manager
razorpay  stripe
@sendgrid/mail
msg91-nodejs-sdk (or plain axios to MSG91)
twilio (intl SMS fallback)
jest  supertest
```

## Env contract

Both repos have `.env.example`. Read them. Do not invent env vars — if you need a new one, ASK.

## Execution order (milestones — do them in order)

### M1 — Foundations
- Set up both repos (they exist as scaffolds; complete them).
- Confirm both compile, both dev servers start, both `test` scripts run.
- Wire GitHub Actions from `.github/workflows/*.yml`.
- Provision GCP per `05_Ops/gcp-setup.md`.
- Deploy an empty version of each repo to Cloud Run.

**Acceptance:** hitting the Cloud Run URL of FE shows a splash; BE `/healthz` returns `{ ok: true, tenant: null }`.

### M2 — Auth + Tenant + Property
- Implement Firebase Phone Auth flow (screens `customer/02-03`, `manager/01`, `staff/01`, `admin-property/01`, `admin-super/01`).
- BE: `POST /auth/verify` accepts Firebase ID token, mints session JWT with `{ sub, role, tenantId? }`.
- CRUD for `Tenant`, `Property`, `RoomType`, `Room`, `Bed`.
- Postgres RLS enabled with policies from `05_Ops/db-migrations.md`.

**Acceptance:** two tenants cannot read each other's rooms even with a modified JWT.

### M3 — Customer profile + KYC vault
- Screens `customer/05–11`, `customer/37` (ID vault), `customer/40` (consent).
- Upload flow → BE signs POST URL → GCS with CMEK → BE saves `KycDocument` row → dispatches to KYC provider (start with `ManualReviewProvider`).
- Consent grant per property on new booking (Manager screen `manager/05`).

**Acceptance:** the same phone number booking at two properties uploads ID only once.

### M4 — Inventory + Booking
- Screens `customer/13–24`.
- Search across properties (public), calendar availability, dorm bed vs private room.
- Razorpay integration on `PaymentProvider` interface; Stripe stubbed but interface-complete.

**Acceptance:** end-to-end booking on staging with a test Razorpay key, invoice PDF emailed.

### M5 — Check-in / Check-out
- Screens `customer/26–27`, `customer/33–34`, `manager/03–09`.
- Digital pass = signed QR carrying `{ bookingId, exp }` verified server-side.
- Walk-in flow with KYC reuse (`manager/04–05`).

### M6 — Requests + Complaints + SLA
- Screens `customer/29–32`, `staff/03–07`, `manager/10–15`.
- BullMQ job schedules an ack-timeout at 5 min per assignment.
- Server-sent events / WebSocket channel `/live/booking/:id` powers the customer's live progress bar.
- ETA is mandatory before state can leave `ACKNOWLEDGED`.

**Acceptance:** file a request as customer → staff sees push in ≤2s → misses ack → manager sees URGENT push at 5:00 → manager sets ETA → customer's progress bar animates.

### M7 — Feedback + profile sharing
- Screens `customer/35–36`, `manager/14`.
- Anonymous share pipeline strips PII (spaCy worker) before persisting to target property's queue.

### M8 — Notifications
- Templates managed at Super Admin (`admin-super/08`) and Property Admin (`admin-property/13`).
- Delivery layer: FCM primary, MSG91/Twilio SMS fallback, SendGrid email.
- Every event in BRD §9 emits `Notification` rows.

### M9 — Reports, Admin surfaces, Billing
- Screens `admin-property/01–20`, `admin-super/01–12`, `manager/20–24`.
- Stripe subscription for platform billing (Super → Property Admin).

### M10 — Hardening
- WCAG 2.1 AA audit (axe).
- Load test with k6 to 200 rps.
- Sentry + Cloud Trace wired.
- Pen-test checklist from `05_Ops/security-legal.md`.

## Wireframe-to-route map

Files under `02_Wireframes/by-role/<role>/NN-<slug>.png` map to routes:

- `customer/12-dashboard.png` → `app/(customer)/home/page.tsx`
- `customer/13-search.png` → `app/(customer)/search/page.tsx`
- `customer/15-property-detail.png` → `app/(customer)/property/[slug]/page.tsx`
- `customer/29-raise-request.png` → `app/(customer)/stay/[bookingId]/request/new/page.tsx`
- ... (full mapping table in `prompts_per_module/routes-map.md`)

## When you finish a milestone

1. Run the acceptance checks in `acceptance_checklist.md` for that milestone.
2. Post a summary listing every file created/changed, every migration run, and every env var required.
3. Wait for approval before starting the next milestone.

## When something is missing

Ask: "The BRD does not specify X. Options are (a) …, (b) …, (c) …. Which do you want?" — then wait.

---

Start with M1. Read `01_BRD/BRD.md` first, then `05_Ops/gcp-setup.md`, then confirm you're ready.
