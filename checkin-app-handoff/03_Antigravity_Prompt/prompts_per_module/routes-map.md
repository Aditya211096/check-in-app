# Route Map (wireframe → FE route → BE endpoint)

## Customer (`app/(customer)/…`)
| Wireframe | Route | Endpoint(s) |
|---|---|---|
| 01-splash | `/` | — |
| 02-phone-otp | `/auth/phone` | `POST /auth/otp/request` |
| 03-otp-verify | `/auth/verify` | `POST /auth/otp/verify` |
| 05-profile-create | `/onboarding/profile` | `POST /me/profile` |
| 06–11 KYC | `/onboarding/kyc/*` | `POST /kyc/upload-url`, `POST /kyc/submit`, `GET /kyc/status` |
| 12-dashboard | `/home` | `GET /me/home` |
| 13–14 search | `/search` | `GET /properties?…` |
| 15 property | `/property/[slug]` | `GET /properties/:slug` |
| 16–21 booking | `/book/[propertyId]/*` | `POST /bookings/draft`, `POST /bookings/:id/pay` |
| 24 confirmed | `/book/success/[bookingId]` | `GET /bookings/:id` |
| 25 upcoming | `/trips` | `GET /me/bookings?status=CONFIRMED` |
| 26 checkin-live | `/stay/[bookingId]/incoming` | SSE `/live/booking/:id` |
| 27 digital-pass | `/stay/[bookingId]/pass` | `GET /bookings/:id/pass` |
| 28 in-stay home | `/stay/[bookingId]` | `GET /bookings/:id/summary` |
| 29–30 request | `/stay/[bookingId]/request/*` | `POST /requests`, SSE `/live/request/:id` |
| 31 complaint | `/stay/[bookingId]/complaint` | `POST /complaints` |
| 33 invoice | `/trips/[bookingId]/invoice` | `GET /bookings/:id/invoice` |
| 34 checkout | `/stay/[bookingId]/checkout` | `POST /bookings/:id/checkout` |
| 35–36 feedback | `/trips/[bookingId]/feedback` | `POST /feedback` |
| 37 vault | `/account/ids` | `GET /me/kyc` |
| 38 deps | `/account/dependents` | `GET/POST /me/dependents` |
| 39 notifications | `/notifications` | `GET /me/notifications` |
| 40 consent | `/account/privacy` | `PATCH /me/consents` |

## Staff (`app/(staff)/…`)
| Wireframe | Route | Endpoint |
|---|---|---|
| 02 dashboard | `/staff` | `GET /staff/tasks?status=open` |
| 03 task-detail | `/staff/task/[id]` | `GET /staff/tasks/:id` |
| 04 set-eta | (modal) | `PATCH /staff/tasks/:id/eta` (staff proposes, manager confirms) |
| 05 in-progress | `/staff/task/[id]` | `PATCH /staff/tasks/:id/state` |
| 06 mark-done | `/staff/task/[id]/done` | `PATCH …/state=DONE` + photo |

## Manager (`app/(manager)/…`)
| Wireframe | Route | Endpoint |
|---|---|---|
| 02 dashboard | `/m` | `GET /manager/overview` |
| 03 arrivals | `/m/arrivals` | `GET /manager/arrivals?date=` |
| 04 walk-in | `/m/walkin` | `POST /manager/walk-in` |
| 10 kanban | `/m/requests` | `GET /manager/requests` |
| 11 assign-staff | (drawer) | `PATCH /requests/:id/assign` |
| 12 set-eta | (drawer) | `PATCH /requests/:id/eta` |
| 13 complaints | `/m/complaints` | `GET /manager/complaints` |
| 14 prior-feedback | (drawer on arrival) | `GET /guests/:id/prior-feedback` |
| 20 reports | `/m/reports` | `GET /reports/occupancy?…` |

## Property Admin (`app/(admin)/…`)
| Wireframe | Route |
|---|---|
| 03 profile | `/admin/property` |
| 05 room-types | `/admin/rooms` |
| 07 pricing | `/admin/pricing` |
| 13 templates | `/admin/notifications` |
| 20 billing | `/admin/billing` |

## Super Admin (`app/(super)/…`)
| Wireframe | Route |
|---|---|
| 02 tenants | `/super/tenants` |
| 03 onboard | `/super/tenants/new` |
| 10 kyc-queue | `/super/kyc-review` |
