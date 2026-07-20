# Step-by-Step DigiLocker (API Setu) Integration Guide

This guide explains how to initialize and configure DigiLocker OAuth 2.0 API Setu integration for verified government ID uploads.

---

## Step 1: Register on API Setu / DigiLocker Portal

1. Visit the official [API Setu Portal](https://apisetu.gov.in/) (or [DigiLocker Developer Portal](https://partners.digilocker.gov.in/)).
2. Click **Register as Requester Organization**.
3. Fill in organization details, entity type (Private Limited / Registered Hospitality Enterprise), and contact person details.

---

## Step 2: Request DigiLocker Client Credentials

1. Log into API Setu Dashboard.
2. Navigate to **API Catalog** ➔ **DigiLocker Service**.
3. Create a new Client Application.
4. Specify Callback / Redirect URI:
   `https://your-app-domain.com/api/kyc/digilocker/callback`
5. API Setu will issue your `DIGILOCKER_CLIENT_ID` and `DIGILOCKER_CLIENT_SECRET`.

---

## Step 3: Configure Environment Variables in `checkin-be`

Add the credentials into `checkin-be/.env`:

```env
DIGILOCKER_CLIENT_ID="your_client_id_here"
DIGILOCKER_CLIENT_SECRET="your_client_secret_here"
DIGILOCKER_REDIRECT_URI="http://localhost:3000/checkin?digilocker=callback"
DIGILOCKER_AUTH_URL="https://digilocker.mer पहचान.gov.in/public/oauth2/1/authorize"
DIGILOCKER_TOKEN_URL="https://digilocker.mer पहचान.gov.in/public/oauth2/1/token"
```

---

## Step 4: OAuth 2.0 Verification Flow Sequence

1. **Authorization Request**: Guest clicks "Verify via DigiLocker". The frontend redirects to DigiLocker OAuth URL with `response_type=code`, `client_id`, `scope=openid`, and `redirect_uri`.
2. **User Consent**: Guest logs into DigiLocker using Aadhaar/Mobile OTP and consents to share ID proof (Aadhaar / Driving License).
3. **Authorization Code Exchange**: DigiLocker redirects back to `DIGILOCKER_REDIRECT_URI` with `?code=...`.
4. **Token & Document Fetch**: `checkin-be` exchanges code for Access Token, fetches encrypted XML/PDF ID proof, compresses it, and saves it with standardized file naming:
   `[ROOM_OR_BED]_[GUEST_NAME]_[ID_TYPE]_[TIMESTAMP].pdf`.

---

## Step 5: Sandbox Testing vs Production Activation

- In Sandbox mode, DigiLocker provides mock Aadhaar & Driving License test profiles.
- Once sandbox testing passes, submit your privacy policy & security audit certificate on API Setu to activate Production credentials.
