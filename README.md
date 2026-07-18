# Varanasi Check-In & Check-Out Web App (Varanasi Sunrise Edition)

A premium, state-of-the-art multi-tenant guest registration and hotel management system designed for seamless dorm and room allocations, automated ID OCR verification, and real-time operations dashboards.

---

## 🎨 Theme & Design Aesthetics
Inspired by the spiritual mornings of Varanasi, the app incorporates:
- **Sunset Color Bands**: Flat geometric background segments (sky blue, sunrise gold, aarti saffron, Ganges teal, clay beige).
- **Spiritual Geometry**: Minimalist vectors representing temple spires and traditional wooden boats floating on soft water waves.
- **Premium Cards**: Translucent glassmorphism containers with soft clay-shaded shadows.
- **Custom Select Components**: Custom React floating dropdown interfaces designed to replace browser-native fields.

---

## ⚙️ Core Technical Stack
- **Frontend**: React + Vite + TypeScript, Framer Motion (animations), Tailwind CSS / Vanilla CSS tokens.
- **Backend**: Node.js + Express + TypeScript, Server-Sent Events (SSE) for real-time notifications.
- **Database ORM**: Prisma ORM v6 with SQLite for local dev (`dev.db`) and PostgreSQL support for cloud production.

---

## 🔒 User Roles & Operations
1. **Property Owner (Admin)**: Full control. Configures room units, designates private or **Dormitory** status, defines bunk beds count, deletes rooms, and monitors RevPAR/SLA analytics.
2. **Manager**: Front desk operations. Books guests, changes ticket resolution ETAs, and processes check-ins/check-outs.
3. **Staff**: Housekeeping, kitchen, and security. Receives alerts, resolves tickets, and clears dirty rooms.
4. **Customer**: Guest portal. Uploads ID proof, registers dependents, submits food orders, and opens service tickets.

---

## 🛠️ Step-by-Step Integrations Guide

### 1. Firebase Phone Authentication Setup
Used to handle OTP authentication for staff and guests.
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and create a new project.
3. Navigate to **Authentication** from the left-side menu and click **Get Started**.
4. In the **Sign-in method** tab, select **Phone** and toggle **Enable**. Add any test phone numbers and verification codes (e.g. `+919999999999` with code `123456`) for local testing.
5. Register a **Web App** in the project settings, and copy the `firebaseConfig` keys.
6. Insert the keys in the frontend configuration (`checkin-frontend/src/config/firebase.ts`) to enable the phone input widget.

### 2. Google Cloud Storage (GCS) Secure ID Buckets
Used to hold guests' uploaded ID document proofs securely.
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select your project.
3. Navigate to **Cloud Storage** > **Buckets** and click **Create**.
4. Select a unique bucket name (e.g., `checkin-app-guest-ids`) and keep default storage classes.
5. Set **Access Control** to **Fine-grained** (necessary for generating signed access tokens).
6. Create a Service Account: Go to **IAM & Admin** > **Service Accounts**, click **Create Service Account**, name it, and assign the role **Storage Object Admin**.
7. In the Service Account details, select **Keys** > **Add Key** > **Create New Key (JSON)**. Download the key file and save its contents or load them locally.

### 3. Google Cloud Document AI (OCR Parser)
Extracts names, dates of birth, and document numbers from guest ID uploads.
1. In the GCP Console, search for **Document AI**.
2. Click **Enable Document AI API**.
3. Select **Processor Gallery** and create a processor instance of type **ID Proof OCR / Custom Document OCR**.
4. Note down the **Processor ID** and your project location (e.g. `us` or `eu`).
5. Assign **Document AI Viewer/User** permissions to the service account created in the GCS section.
6. In your backend `.env`, set:
   ```env
   GCP_PROJECT_ID="your-project-id"
   DOCUMENT_AI_PROCESSOR_ID="your-processor-id"
   ```

---

## 🚀 Running the Web App Locally

### 1. Start the Backend Server
```bash
cd checkin-backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
The backend service boots on **`http://localhost:5000`**.

### 2. Start the Frontend client
```bash
cd checkin-frontend
npm install
npm run dev
```
The React hot-reloader boots on **`http://localhost:5173`**.

---

## 📂 Project Directory Structure

```
├── checkin-backend
│   ├── prisma/
│   │   ├── schema.prisma      # SQLite & Postgres configurations with composite indexes
│   │   └── dev.db             # Local zero-configuration database file
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts          # Prisma Client setup
│   │   ├── middleware/
│   │   │   ├── auth.ts        # Role verification filters (Owner, Manager, Staff)
│   │   │   └── tenant.ts      # Multi-tenant isolation header injector
│   │   ├── routes/
│   │   │   ├── auth.ts        # OTP validation & JWT token generation
│   │   │   ├── stay.ts        # Room allocations and dormitory bed sizing limits
│   │   │   ├── task.ts        # Real-time service ticket triggers
│   │   │   └── tenant.ts      # CSAT logs, RevPAR calculations, and occupancy ratios
│   │   └── app.ts             # Express startup routing and periodic SLA breach daemon
└── checkin-frontend
    ├── src/
    │   ├── components/
    │   │   ├── CustomSelect.tsx   # Premium custom floating options dropdown
    │   │   └── WaveProgress.tsx   # Animated boat floating over Ganges river graphics
    │   ├── pages/
    │   │   ├── Login.tsx          # Sunrise geometric color bands & login triggers
    │   │   ├── ManagerDashboard.tsx # Room capacity controller, dormitory bunk bed selectors
    │   │   ├── StaffDashboard.tsx  # Task manager grids and kitchen alerts
    │   │   └── OwnerDashboard.tsx  # Investment metrics and CSAT feed toggles
```
