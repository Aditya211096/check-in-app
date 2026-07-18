# Feature modules

Create one folder per module. Each contains `*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/*.ts`, `*.spec.ts`.

Build order (per MASTER_PROMPT.md):
1. `auth` — Firebase Phone Auth verify + session JWT
2. `tenants` — CRUD (Super Admin only)
3. `properties` — CRUD scoped to tenant
4. `rooms`, `beds` — inventory
5. `customer-profile` — global profile, dependents
6. `ids-kyc` — vault upload, signed URLs, consent
7. `bookings` — search, availability, draft, pay
8. `checkin` — digital pass, walk-in, KYC reuse
9. `checkout` — bill, damages, invoice
10. `requests` — state machine, SLA, ETA, SSE
11. `complaints` — sibling of requests, tighter SLA
12. `notifications` — FCM/SMS/email dispatch + templates
13. `feedback` — anonymous share pipeline
14. `staff-tasks` — assignment inbox
15. `billing` — Stripe subscription (platform billing)
16. `audit` — append-only log

Every controller MUST:
- Use `@UseGuards(JwtAuthGuard, TenantGuard)`.
- Set `SET LOCAL app.tenant_id` at start of transaction (via `PrismaService.tx()`).
- Validate DTOs with `class-validator` AND parse with Zod at boundary.
- Emit `AuditLog` for every write.
