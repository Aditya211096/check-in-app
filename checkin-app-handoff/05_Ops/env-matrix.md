# Env Matrix

## `checkin-fe` (`.env.local`)
| Var | Example | Where |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.checkin.app` | build |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIza…` | Firebase console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `checkin-app-dev.firebaseapp.com` | Firebase |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `checkin-app-dev` | Firebase |
| `NEXT_PUBLIC_FCM_VAPID_KEY` | `B…` | Firebase Cloud Messaging |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_…` | Razorpay |
| `NEXT_PUBLIC_STRIPE_PK` | `pk_test_…` | Stripe |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://…@…ingest.sentry.io/…` | Sentry |

## `checkin-be` (`.env`)
| Var | Example | Notes |
|---|---|---|
| `PORT` | `4000` | |
| `NODE_ENV` | `development` | |
| `DATABASE_URL` | `postgresql://app:pw@127.0.0.1:5432/checkin` | via Cloud SQL Auth Proxy in prod |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Memorystore in prod |
| `JWT_SECRET` | (32-byte random) | Secret Manager |
| `JWT_ACCESS_TTL` | `30d` | |
| `JWT_REFRESH_TTL` | `90d` | |
| `FIREBASE_ADMIN_JSON` | (service-account JSON) | Secret Manager |
| `GCS_BUCKET` | `ids-vault-dev` | |
| `KMS_KEY_URI` | `projects/…/keyRings/checkin/cryptoKeys/ids-vault` | |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | | Razorpay |
| `STRIPE_SECRET_KEY` | `sk_test_…` | Stripe |
| `MSG91_AUTH_KEY` | | MSG91 |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | | Twilio |
| `SENDGRID_API_KEY` | `SG.…` | SendGrid |
| `SESSION_COOKIE_DOMAIN` | `.checkin.app` | prod |
| `ALLOWED_ORIGINS` | `https://app.checkin.app` | CORS |
