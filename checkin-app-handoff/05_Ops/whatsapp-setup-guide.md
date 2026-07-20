# Official Meta WhatsApp Business Cloud API Credentials & Setup

Your official Meta WhatsApp Business Cloud API credentials have been saved into both backend (`checkin-be/.env`) and frontend (`checkin-fe/.env.local`).

---

## Configured Credentials

- **Phone Number ID:** `1164720626733821`
- **WhatsApp Business Account ID (WBAID):** `2131082584104714`
- **Permanent Access Token:**
  `EAAaYA9pRjRsBSNZCCD973MCbmTvZBUUXm1TXdsmYxrEZB4sSRVyNUuJtww7M9j2fq6DoGzf7JiwK3yH6RmPUIkTiOmtJJxyCdXcyXoc83cLfuHCVrFQbQB8ZCUy5ILe7zhpI21UeNtmVD5lWiiuZCbsMYHS3vyTZAxNLPmrxtXYYS0iOR9VwEZCUARWhfAQHliB6GB4qkk8pd5RhNTZC6PfVycZAJUKX3eIQfwfZBsIO0aO38zovrTRaQzLKYhNdRQuy8WsTZBpDv1ZCciQZBVR4nF0WU`

---

## Authorizing Test Recipient Mobile Number

1. Go to your Meta App Dashboard ➔ **WhatsApp** ➔ **API Setup**.
2. Scroll to **Step 2: Send and receive messages**.
3. Under **To** dropdown ➔ Select **Manage phone number list**.
4. Add Customer Ayushi's mobile number: `+91 9660397475`.
5. Meta will send a 6-digit verification code to `9660397475` via WhatsApp.
6. Enter that 6-digit code on the Meta web screen to complete authorization.

---

## Testing Meta API Dispatch from Manager Web Dashboard

1. Open `http://localhost:3000/dashboard/manager`.
2. Click **Expected Arrivals** tab.
3. Locate **Ayushi Aggarwal** (`+91 9660397475`).
4. Click **"Send WhatsApp Pre-Checkin"**.
5. The web app automatically calls NestJS backend endpoint `POST /notifications/whatsapp` (which calls Meta Graph API `https://graph.facebook.com/v18.0/1164720626733821/messages`) AND opens the direct web WhatsApp link!
