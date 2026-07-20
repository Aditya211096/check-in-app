# Google Cloud Platform (GCP) Infrastructure & CI/CD Setup Guide

This guide details all GCP services used by the **Check-In App** hospitality SaaS platform, how to verify them, and how automated CI/CD deployment pipelines work upon Pull Request merge to `main`.

---

## 1. Required GCP Services Architecture

| GCP Service | Role & Responsibility | How to Verify in GCP Console |
|---|---|---|
| **Cloud Run** | Serverless microservice execution for NestJS Backend and Next.js Frontend containers. | Open [Cloud Run Console](https://console.cloud.google.com/run). You should see `checkin-backend` and `checkin-frontend`. |
| **Cloud SQL (PostgreSQL 15)** | Managed PostgreSQL database storing Multi-tenant scope (`tenant_id`), rooms, bookings, and pricing history. | Open [Cloud SQL Console](https://console.cloud.google.com/sql). Instance IP: `35.238.178.193`. |
| **Memorystore (Redis)** | High-speed cache for session management and real-time SSE hot-reload streams. | Open [Memorystore Console](https://console.cloud.google.com/memorystore). |
| **Cloud Storage (GCS)** | Encrypted bucket (`ids-vault-dev` / `ids-vault-prod`) storing guest Aadhaar/Passport ID uploads. | Open [Cloud Storage Console](https://console.cloud.google.com/storage). |
| **Cloud KMS** | Key Management Service providing Envelope Encryption for legal compliance. | Open [KMS Console](https://console.cloud.google.com/security/kms). |
| **Artifact Registry** | Container image registry storing built Docker images. | Open [Artifact Registry Console](https://console.cloud.google.com/artifacts). |
| **Secret Manager** | Encrypted store for `DATABASE_URL`, `WHATSAPP_API_TOKEN`, and `JWT_SECRET`. | Open [Secret Manager Console](https://console.cloud.google.com/security/secret-manager). |

---

## 2. GitHub Automated CI/CD Pipeline Configuration

### Automated Workflows Created
1. **Backend Pipeline:** [.github/workflows/deploy-backend.yml](file:///d:/Check-In%20App/.github/workflows/deploy-backend.yml)
2. **Frontend Pipeline:** [.github/workflows/deploy-frontend.yml](file:///d:/Check-In%20App/.github/workflows/deploy-frontend.yml)

### How the Pipeline Works:
- **Pull Request Trigger:** Whenever a team member opens a Pull Request to `main`, GitHub Actions automatically installs dependencies, runs linter checks, and builds the TypeScript projects to ensure no breaking changes exist.
- **Merge to `main` Trigger:** Once the PR is merged into `main`, GitHub Actions automatically:
  1. Authenticates with GCP using Service Account key (`GCP_SA_KEY`).
  2. Submits Docker container builds to GCP Artifact Registry.
  3. Deploys updated containers to GCP Cloud Run with zero downtime.

---

## 3. GitHub Secrets Required for Automated Deployment

In your GitHub Repository ➔ **Settings** ➔ **Secrets and variables** ➔ **Actions**, add these repository secrets:

- `GCP_PROJECT_ID`: Your GCP Project ID (e.g. `traces-checkin-app`)
- `GCP_SA_KEY`: Service Account JSON key with Cloud Run Admin & Artifact Registry permissions
- `DATABASE_URL`: `postgresql://app:Welcome%40123456@35.238.178.193:5432/traces?schema=public`
- `WHATSAPP_API_TOKEN`: `EAAaYA9pRjRs...`
- `WHATSAPP_PHONE_NUMBER_ID`: `1164720626733821`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`: `2131082584104714`
