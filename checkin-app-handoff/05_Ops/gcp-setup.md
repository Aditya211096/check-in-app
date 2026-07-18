# GCP Setup (using the $300 free-tier credit)

Everything below fits comfortably inside the credit for 4–6 months of dev + light staging.

## 1. Create project
```bash
gcloud projects create checkin-app-dev --name="Check-In App"
gcloud config set project checkin-app-dev
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  cloudkms.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  cloudscheduler.googleapis.com \
  firebase.googleapis.com \
  identitytoolkit.googleapis.com \
  fcm.googleapis.com
```

## 2. Cloud SQL Postgres (dev)
```bash
gcloud sql instances create checkin-pg \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-south1 \
  --storage-size=10GB --storage-auto-increase \
  --backup --enable-point-in-time-recovery
gcloud sql databases create checkin --instance=checkin-pg
gcloud sql users create app --instance=checkin-pg --password="<generate>"
```
Cost ~ $8–12/mo dev.

## 3. Cloud Storage — ID vault with CMEK
```bash
# KMS key
gcloud kms keyrings create checkin --location=asia-south1
gcloud kms keys create ids-vault --keyring=checkin \
  --location=asia-south1 --purpose=encryption \
  --rotation-period=90d --next-rotation-time=$(date -u -d '+90 days' +%Y-%m-%dT%H:%M:%SZ)

# Bucket
gsutil mb -l asia-south1 gs://ids-vault-dev
gsutil uniformbucketlevelaccess set on gs://ids-vault-dev
gsutil kms encryption -k projects/checkin-app-dev/locations/asia-south1/keyRings/checkin/cryptoKeys/ids-vault gs://ids-vault-dev
gsutil versioning set on gs://ids-vault-dev
# 7-year retention (Indian hotel guest register rule)
gsutil retention set 7y gs://ids-vault-dev
```

## 4. Firebase (same GCP project)
1. `firebase login` → `firebase projects:addfirebase checkin-app-dev`.
2. In Firebase console → Auth → Sign-in method → **Phone** → enable. Add test numbers for E2E.
3. Cloud Messaging → generate a Web Push VAPID key. Save the public key as `NEXT_PUBLIC_FCM_VAPID_KEY` and the server key in Secret Manager.

## 5. Secret Manager
```bash
for s in DATABASE_URL JWT_SECRET FIREBASE_ADMIN_JSON RAZORPAY_KEY_ID RAZORPAY_KEY_SECRET STRIPE_SECRET_KEY MSG91_AUTH_KEY TWILIO_AUTH_TOKEN SENDGRID_API_KEY GCS_BUCKET KMS_KEY_URI; do
  echo -n "REPLACE" | gcloud secrets create $s --data-file=-
done
```
Grant the Cloud Run service accounts `roles/secretmanager.secretAccessor`.

## 6. Artifact Registry
```bash
gcloud artifacts repositories create checkin --repository-format=docker --location=asia-south1
```

## 7. Cloud Run services
Two services: `checkin-fe`, `checkin-be`. Deployed by GitHub Actions (see repo workflows). Both use the Cloud SQL Auth Proxy sidecar via `--add-cloudsql-instances`.

Minimum instances: 0 (scale-to-zero in dev). CPU always-allocated: off. Concurrency 80.

## 8. Cloud Scheduler
```bash
gcloud scheduler jobs create http nightly-rollups \
  --schedule="0 2 * * *" --uri="https://<be-url>/internal/rollups" \
  --http-method=POST --oidc-service-account-email=scheduler@…iam
```

## 9. Domain & TLS
Map `api.checkin.app` and `app.checkin.app` in Cloud Run Domain Mappings (auto-cert via Google).

## 10. Cost guardrails
- Set a billing budget at $50/mo with 50/90/100% alerts.
- Set Cloud Run `--max-instances=5` in dev.
- Set Cloud SQL `--tier=db-f1-micro` and only bump when p95 > 300ms.
