# Security & Legal Checklist

## Regulatory
- **DPDP Act 2023 (India):** publish privacy notice, appoint DPO + Grievance Officer, log consent artefacts (`user_id`, `purpose`, `timestamp`, `ip`), enable right-to-access & erasure APIs, breach-notification runbook.
- **GDPR:** lawful basis per processing purpose declared in `privacy.md`; DPAs with Razorpay/Stripe/SendGrid/MSG91/Twilio; SCCs for any EEA→US data flow (MSG91/Twilio may transit outside EEA).
- **Indian hotel guest register:** auto-generate PDF register per property per day; retain 7y.
- **C-Form (Foreigner):** for non-Indian guests, auto-populate `Form-C` fields and email to state's Foreigner Registration Office (manual submission in v1; automated integration v2).
- **PCI-DSS SAQ-A:** never touch card data; use iframes only.

## Application
- HTTPS-only, HSTS max-age 63072000.
- CSP: `default-src 'self'; script-src 'self' https://apis.google.com https://www.gstatic.com https://checkout.razorpay.com https://js.stripe.com; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'`.
- httpOnly SameSite=Lax cookies for session; SameSite=Strict for admin surfaces.
- CSRF tokens on all state-changing forms (double-submit).
- Rate limit: 60 req/min/IP default, 5/min for auth endpoints.
- All input validated with Zod on FE and BE.
- Prisma only — no raw SQL.
- File uploads: MIME sniffed, max 8 MB, virus-scanned via Cloud Functions ClamAV (v1.1).

## Auth
- Firebase Phone Auth OTP; verify Firebase ID token server-side before minting our JWT.
- JWT HS256 with a Secret Manager–backed rotating key.
- Sessions: 30d access, 90d refresh; revocation list in Redis.
- 2FA (TOTP) required for Property Admin and Super Admin.

## Data
- Postgres RLS enforced on every tenant-scoped table.
- Column-level encryption via pgcrypto for `Booking.phone`, `Booking.email`.
- Backups: Cloud SQL PITR 7 days; GCS versioning on vault.
- Right-to-erasure job: nullifies PII, deletes vault objects, keeps hash + `deleted_at` for audit.

## KYC vault specifics
- Uniform bucket-level access.
- CMEK via KMS with 90-day rotation.
- Files named `sha256(userId + salt + originalName)` — no PII in path.
- Retrieval only via 5-minute signed URLs, generated after CASL + tenant consent check.
- Aadhaar: masked-image-only pipeline (last 4 digits visible). Manual review can request unmasked view — this creates an audit log row with a reason.

## Pen-test items (before GA)
- [ ] IDOR on every `:id` route (must return 404 or 403 for cross-tenant/cross-user)
- [ ] Signed URL abuse (must expire, must not be reusable across users)
- [ ] Rate-limit bypass via header spoof
- [ ] JWT algorithm confusion (`alg=none` rejected)
- [ ] File upload MIME confusion
- [ ] SSRF via booking image import
- [ ] Long-poll / SSE resource exhaustion
