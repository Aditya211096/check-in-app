# Check-In App — Antigravity Handoff Bundle

Everything you need to vibe-code the entire product inside Antigravity IDE.

## What's in the box
```
01_BRD/                Business Requirements Document (MD + PDF) + diagrams
02_Wireframes/         128 PNG screens + index.pdf + theme-tokens.md
03_Antigravity_Prompt/ MASTER_PROMPT.md (feed this first) + per-module prompts
04_Repo_Scaffolds/     checkin-fe (Next.js) and checkin-be (NestJS) skeletons
05_Ops/                GCP setup, DB migrations, security/legal, env matrix
```

## How to use with Antigravity

1. **Read the BRD first** (`01_BRD/BRD.md`). It's the source of truth.
2. **Open `03_Antigravity_Prompt/MASTER_PROMPT.md`.** Copy the whole file into a fresh Antigravity task. It instructs the agent never to assume — it must ask before deviating.
3. **Point Antigravity at the two scaffolds** in `04_Repo_Scaffolds/`. They're ready to `git init` into two separate repos (`checkin-fe`, `checkin-be`).
4. **Feed wireframes page-by-page** using files in `02_Wireframes/by-role/<role>/`. The file naming maps 1:1 to the pages listed in the BRD §7.
5. **Follow the milestones** in the master prompt. Do NOT let Antigravity skip ahead.
6. **Provision GCP** using `05_Ops/gcp-setup.md`. All infra fits within the $300 free-tier credit for the first ~4–6 months of dev.

## Split repos
- `checkin-fe` → Next.js 14 (App Router) + Tailwind + shadcn/ui, deployed to Cloud Run (or Firebase Hosting).
- `checkin-be` → NestJS + Prisma + Postgres (Cloud SQL), deployed to Cloud Run.
- Both have `.github/workflows/deploy-*.yml` for automated deploys.

## First-time developer checklist
- [ ] Create Google Cloud project, enable billing with $300 credit
- [ ] Create Firebase project (same GCP project) for Phone Auth + FCM
- [ ] Create Cloud SQL Postgres (db-f1-micro to start)
- [ ] Create GCS bucket with CMEK for `ids-vault`
- [ ] Copy `.env.example` → `.env` in both repos and fill values
- [ ] `bun install` (FE) and `npm install` (BE) — or your preferred package manager
- [ ] `npx prisma migrate dev` in BE
- [ ] `npm run dev` in both, hit `http://localhost:3000`

See `05_Ops/gcp-setup.md` for the detailed walkthrough.
