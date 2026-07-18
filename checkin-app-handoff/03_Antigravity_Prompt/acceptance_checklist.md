# Acceptance Checklist (per milestone)

## M1 — Foundations
- [ ] `checkin-fe` `bun dev` boots on :3000
- [ ] `checkin-be` `npm run start:dev` boots on :4000 with `/healthz` 200
- [ ] `checkin-be` `prisma migrate dev` runs clean
- [ ] Both repos deploy to Cloud Run via GitHub Actions on push to `main`
- [ ] Secret Manager holds all secrets (no `.env` in prod)
- [ ] GCS `ids-vault-<env>` created with CMEK + uniform bucket-level access

## M2 — Auth + Tenant + Property
- [ ] Firebase Phone Auth OTP works on +91 and +1 test numbers
- [ ] Session JWT contains `{ sub, role, tenantId? }`
- [ ] Tenant A cannot read Tenant B's `Property` (RLS test)
- [ ] Every tenant-scoped table has an RLS policy and a passing test

## M3 — KYC vault
- [ ] Upload → signed POST URL → GCS object encrypted with CMEK
- [ ] Aadhaar masked pipeline runs; raw digits never persisted
- [ ] Reusing at second property requires explicit `KycConsent`
- [ ] Right-to-erasure endpoint deletes object + row

## M4 — Booking
- [ ] Search returns availability across all public properties
- [ ] Dorm-bed model allocates one bed atomically (no double-book)
- [ ] Payment success writes `Payment` + `Invoice`, sends email
- [ ] Payment failure leaves `Booking.status = PAYMENT_PENDING`

## M5 — Check-in / out
- [ ] Digital pass QR verifies within 5-min window
- [ ] Walk-in supports KYC reuse via phone lookup
- [ ] Checkout marks bed `DIRTY` + auto-creates housekeeping task

## M6 — Requests + SLA
- [ ] Ack timeout at exactly 5:00 → auto-escalates
- [ ] Manager cannot progress state without `etaMinutes`
- [ ] Guest live progress bar updates within 2s of state change

## M7 — Feedback
- [ ] Anonymous share strips names, phones, emails (PII scrub test)
- [ ] Prior feedback panel visible to manager on new arrival if consent on

## M8 — Notifications
- [ ] Every event in BRD §9 fires and persists `Notification` row
- [ ] SMS fallback triggers when FCM delivery fails > 60s
- [ ] Templates editable in Property Admin surface

## M9 — Reports + Admin + Billing
- [ ] Occupancy / ADR / NPS reports match hand-computed values on seed data
- [ ] Stripe subscription webhook updates `Tenant.plan`

## M10 — Hardening
- [ ] axe reports 0 serious issues
- [ ] k6 200 rps for 5 min without error rate > 1%
- [ ] Sentry captures a forced FE error
- [ ] Cloud Trace shows end-to-end span for one booking
