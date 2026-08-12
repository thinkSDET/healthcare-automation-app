# API Testing Guide

Zero-to-test guide for QA engineers exercising the Healthcare Automation backend **without the frontend**.

All commands assume a shell opened in `backend/` unless noted.

---

## A. Prerequisites

### Node / npm

- Project `backend/package.json` does **not** declare an `engines` field.
- **Required Node version: Not defined in the current codebase.**
- Local toolchain observed during documentation generation: Node `v24.x` with npm `11.x` works for `tsx` + Prisma 7, but that is not a formal project requirement.
- Install dependencies:

```bash
cd backend
npm install
```

### Database

- Provider: **PostgreSQL** (`backend/prisma/schema.prisma`).
- Connection: `DATABASE_URL` (required). If missing, `backend/src/config/prisma.ts` throws `DATABASE_URL is not defined`.
- Exact connection string for your machine: **Not defined in the committed codebase** (configure locally via `backend/.env`).

### Environment variables

| Variable | Required | Source / default |
|----------|----------|------------------|
| `DATABASE_URL` | Yes | No default — must be set |
| `JWT_SECRET` | No | Falls back to `local-development-secret` in auth middleware + auth service |
| `ADMIN_EMAIL` | No | Used only by bootstrap script; default `admin@healthcare.local` |
| `ADMIN_PASSWORD` | No | Used only by bootstrap script; default `Admin@12345` |

There is **no** committed `.env.example` in the repository.

### Other dependencies

- Prisma 7 + `@prisma/adapter-pg` + `pg`
- Express 5, Zod, bcryptjs, jsonwebtoken, multer, cors, dotenv

---

## B. Start the backend

From `backend/package.json`:

| Script | Command | Purpose |
|--------|---------|---------|
| Dev | `npm run dev` | `tsx watch src/server.ts` |
| Build | `npm run build` | `tsc` |
| Prod | `npm start` | `node dist/server.js` (after build) |

Typical local QA flow:

```bash
cd backend
npm install
npm run dev
```

Server listens on **port 4000** (hardcoded in `backend/src/server.ts`):

```text
Healthcare API running on http://localhost:4000
```

---

## C. Database setup

Prisma config: `backend/prisma.config.ts` (schema path `prisma/schema.prisma`, migrations in `prisma/migrations`, datasource URL from `DATABASE_URL`).

### 1. Configure database

1. Create a PostgreSQL database.
2. Set `DATABASE_URL` in `backend/.env`, for example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DBNAME?schema=public"
JWT_SECRET="your-local-secret"
```

(Do not commit real credentials.)

### 2. Run migrations

From `backend/`:

```bash
npx prisma migrate deploy
```

For local iterative development, `npx prisma migrate dev` is also available via Prisma CLI (not wrapped in a custom npm script).

### 3. Generate Prisma client

```bash
npx prisma generate
```

Client output path: `backend/src/generated/prisma` (per schema `generator`).

### 4. Seed data

- **No Prisma seed script** is configured in `backend/package.json`.
- **No seed file** is part of the application source for sample patients/doctors.

### Optional: bootstrap an ADMIN user

Script exists at `backend/src/scripts/create-admin.ts` but is **not** wired as an npm script. Run:

```bash
npx tsx src/scripts/create-admin.ts
```

Defaults (overridable with `ADMIN_EMAIL` / `ADMIN_PASSWORD`):

| Field | Default |
|-------|---------|
| Email | `admin@healthcare.local` |
| Password | `Admin@12345` |
| Name | System Administrator |
| Role | ADMIN |

If the email already exists, the script updates role/password/status to ADMIN/ACTIVE.

Other role accounts (DOCTOR, PATIENT, PHARMACIST): **Not defined as fixed test accounts in the repository.** Create them via:

- `POST /api/auth/register` (PATIENT / DOCTOR / PHARMACIST), or
- `POST /api/users` as ADMIN (roles in validator: ADMIN, DOCTOR, PHARMACIST, SUPPORT, VIEWER — not PATIENT).

---

## D. Base URL

```text
http://localhost:4000
```

API prefixes (from `server.ts`):

- `/api/health`
- `/api/auth`
- `/api/users`
- `/api/patients`
- `/api/doctors`
- `/api/appointments`
- `/api/appointment-requests`
- `/api/prescriptions`
- `/api/refill-requests`
- `/api/orders`

---

## E. Authentication

### 1. How to login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@healthcare.local\",\"password\":\"Admin@12345\",\"rememberMe\":false}"
```

### 2. Credentials / test accounts

| Account | How obtained |
|---------|----------------|
| Admin defaults above | Only if you ran `create-admin.ts` (or set env overrides) |
| Other roles | **Not defined in the current codebase** as seeded fixtures |

Login also enforces:

- Max **5** failed attempts → lock **15** minutes
- Rejects `INACTIVE` / `LOCKED` users

### 3. Obtain the JWT

Success response shape:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "<JWT>",
    "user": {
      "id": 1,
      "email": "...",
      "firstName": "...",
      "lastName": "...",
      "role": "ADMIN",
      "patientId": null
    },
    "expiresIn": "1h"
  }
}
```

For PATIENT users, `data.user.patientId` is the linked Patient id (or `null` if none).

### 4. Send the JWT

```http
Authorization: Bearer <TOKEN>
```

Missing/invalid prefix → **401** `"Authentication token is required"`  
Bad/expired token → **401** `"Invalid or expired token"`

### 5. Token expiration

| Mode | `expiresIn` |
|------|-------------|
| Default (`rememberMe` false/omitted) | `1h` |
| `rememberMe: true` | `30d` |

JWT payload claims: `userId`, `role`, `email`.

---

## F. Postman setup

1. Create environment **Healthcare Local**.
2. Variables:

| Variable | Example | Notes |
|----------|---------|--------|
| `baseUrl` | `http://localhost:4000` | From server.ts |
| `token` | *(empty)* | Set from login `data.token` |
| `patientId` | *(empty)* | From create patient / login `patientId` |
| `doctorId` | *(empty)* | From create doctor |
| `appointmentId` | *(empty)* | From create appointment |
| `prescriptionId` | *(empty)* | From create prescription |
| `orderId` | *(empty)* | From create order |
| `documentId` | *(empty)* | From document upload |
| `dependentId` | *(empty)* | From create dependent |

3. Collection auth: Type **Bearer Token**, value `{{token}}`.
4. Login request Tests script example:

```javascript
const json = pm.response.json();
if (json.data && json.data.token) {
  pm.environment.set("token", json.data.token);
  if (json.data.user && json.data.user.patientId != null) {
    pm.environment.set("patientId", String(json.data.user.patientId));
  }
}
```

Import OpenAPI: File → Import → `docs/openapi.yaml`.

---

## G. Insomnia setup

1. Create environment with the same variables as Postman.
2. Base URL: `{{ _.baseUrl }}` (or Insomnia equivalent).
3. After login, set `token` from response.
4. For authenticated requests, header:

```http
Authorization: Bearer {% response '...' %}
```

or static `Bearer {{ token }}`.

5. Optionally import `docs/openapi.yaml` as a request collection.

---

## H. Standalone API workflow

Adjust IDs to your database. Sequence uses APIs that **exist today**.

```text
Health check
    ↓
Login (ADMIN) → save token
    ↓
Create doctor (ADMIN) → doctorId
    ↓
Create patient (ADMIN)  OR  Register PATIENT → patientId
    ↓
Create appointment (ADMIN) → appointmentId
    ↓
PATCH status CONFIRMED
    ↓
PATCH status CHECKED_IN
    ↓
PATCH status IN_CONSULTATION
    ↓
PATCH status COMPLETED
    ↓
Create prescription (ADMIN/DOCTOR) → prescriptionId
    ↓
Create order (ADMIN or owning PATIENT) → orderId
    ↓
PATCH order status / payment status (ADMIN/PHARMACIST)
    ↓
(Optional) Upload/list documents (ADMIN/DOCTOR upload)
```

### Copy/paste curl examples

**Health**

```bash
curl http://localhost:4000/api/health
```

**Login**

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@healthcare.local\",\"password\":\"Admin@12345\"}"
```

**Create doctor** (ADMIN)

```bash
curl -X POST http://localhost:4000/api/doctors \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"doctorCode\":\"DOC-100\",\"firstName\":\"Priya\",\"lastName\":\"Nair\",\"specialization\":\"Cardiology\",\"licenseNumber\":\"LIC-7788\",\"email\":\"priya.nair@example.com\",\"phone\":\"9123456780\",\"experience\":12}"
```

**Create patient** (ADMIN/DOCTOR)

```bash
curl -X POST http://localhost:4000/api/patients \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"medicalId\":\"PAT-90001\",\"firstName\":\"John\",\"lastName\":\"Smith\",\"dateOfBirth\":\"1985-03-20\",\"gender\":\"MALE\",\"phone\":\"9876543210\",\"email\":\"john.smith@example.com\"}"
```

**Get patient**

```bash
curl http://localhost:4000/api/patients/1 \
  -H "Authorization: Bearer <TOKEN>"
```

**Create appointment** (ADMIN) — `appointmentAt` must be in the future (ISO datetime)

```bash
curl -X POST http://localhost:4000/api/appointments \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"appointmentNo\":\"APT-20260811-001\",\"patientId\":1,\"doctorId\":1,\"appointmentAt\":\"2026-09-01T10:00:00.000Z\",\"duration\":30,\"type\":\"IN_PERSON\",\"reason\":\"Annual checkup\"}"
```

**Confirm → check-in → consult → complete**

```bash
curl -X PATCH http://localhost:4000/api/appointments/1/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"CONFIRMED\"}"

curl -X PATCH http://localhost:4000/api/appointments/1/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"CHECKED_IN\"}"

curl -X PATCH http://localhost:4000/api/appointments/1/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"IN_CONSULTATION\"}"

curl -X PATCH http://localhost:4000/api/appointments/1/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"COMPLETED\"}"
```

**Create prescription** (ADMIN/DOCTOR)

```bash
curl -X POST http://localhost:4000/api/prescriptions \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"patientId\":1,\"doctorId\":1,\"diagnosis\":\"Seasonal allergy\",\"items\":[{\"medicineName\":\"Cetirizine\",\"dosage\":\"10mg\",\"frequency\":\"Once daily\",\"duration\":\"7 days\",\"route\":\"Oral\"}]}"
```

**Create order** (ADMIN or owning PATIENT)

```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d "{\"patientId\":1,\"deliveryAddress\":\"12 Oak Street\",\"items\":[{\"productName\":\"Cetirizine 10mg\",\"quantity\":2,\"unitPrice\":45.5}]}"
```

**List orders for patient**

```bash
curl http://localhost:4000/api/orders/patient/1 \
  -H "Authorization: Bearer <TOKEN>"
```

**Upload document** (ADMIN/DOCTOR) — field name must be `document`

```bash
curl -X POST http://localhost:4000/api/patients/1/documents \
  -H "Authorization: Bearer <TOKEN>" \
  -F "document=@./sample.pdf" \
  -F "documentType=Lab Report"
```

**List / download documents**

```bash
curl http://localhost:4000/api/patients/1/documents \
  -H "Authorization: Bearer <TOKEN>"

curl -L http://localhost:4000/api/patients/1/documents/1/download \
  -H "Authorization: Bearer <TOKEN>" \
  -o downloaded.bin
```

### Appointment lifecycle (allowed transitions)

| From | Allowed next |
|------|----------------|
| SCHEDULED | CONFIRMED, CANCELLED, NO_SHOW |
| CONFIRMED | CHECKED_IN |
| CHECKED_IN | IN_CONSULTATION |
| IN_CONSULTATION | COMPLETED |
| COMPLETED / CANCELLED / NO_SHOW | *(terminal)* |

Role targets on `PATCH .../status`:

- **ADMIN:** CONFIRMED, CHECKED_IN, IN_CONSULTATION, COMPLETED, CANCELLED, NO_SHOW  
- **DOCTOR:** CONFIRMED, CHECKED_IN, IN_CONSULTATION, COMPLETED, NO_SHOW (not CANCELLED via this endpoint)  
- **DELETE /api/appointments/:id** (ADMIN): only SCHEDULED → CANCELLED

---

## Common error response shape

Most JSON errors:

```json
{
  "success": false,
  "message": "..."
}
```

Zod validation (`validate` middleware):

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

| Status | Typical meaning in this API |
|--------|-----------------------------|
| 400 | Validation / business rule / invalid ID |
| 401 | Missing/invalid token or bad login |
| 403 | Role not allowed or patient ownership failed |
| 404 | Resource not found |
| 409 | Email exists; overlapping appointment |
| 500 | Unhandled / infrastructure failure |

Document upload multer rejections (unsupported MIME / >10MB): **structured status codes are not defined in a dedicated Express error handler in the current codebase** (controllers only handle post-multer success/failure paths).

---

## I. QA API test scenarios checklist

### Authentication

- [ ] Valid login returns 200 + token
- [ ] Invalid password returns 401
- [ ] Missing email/password returns 400
- [ ] Remember-me returns `expiresIn: "30d"`
- [ ] Five failed logins lock account (15 minutes)
- [ ] INACTIVE user cannot login
- [ ] Forgot-password without revealing whether email exists
- [ ] Reset-password with valid token
- [ ] Reset-password with used/expired token → 400
- [ ] Change-password with Bearer token
- [ ] Logout with Bearer returns 200

### Authorization / RBAC

- [ ] Missing `Authorization` → 401
- [ ] Invalid token → 401
- [ ] PATIENT calling `GET /api/patients` → 403
- [ ] DOCTOR calling `POST /api/appointments` → 403
- [ ] DOCTOR calling `DELETE /api/appointments/:id` → 403
- [ ] PATIENT calling `POST /api/patients/:id/documents` → 403
- [ ] PHARMACIST calling patient routes with `requirePatientAccess` → 403
- [ ] SUPPORT/VIEWER on ADMIN-only routes → 403 (if such users exist)
- [ ] Public register with `role: "ADMIN"` → 403

### Ownership

- [ ] PATIENT can GET own `/api/patients/:id`
- [ ] PATIENT cannot GET another patientId → 403
- [ ] PATIENT can list/create orders only for own patientId
- [ ] PATIENT accessing another patient’s orders → 403

### CRUD / Validation

- [ ] Create patient missing required Zod fields → 400 with `errors[]`
- [ ] Create doctor with invalid email → 400
- [ ] Create appointment with past `appointmentAt` → 400
- [ ] Create appointment with inactive doctor → 400
- [ ] Invalid path id (`abc`) → 400 where implemented
- [ ] Unknown resource id → 404 where implemented

### Appointment lifecycle

- [ ] Valid transition SCHEDULED → CONFIRMED
- [ ] Invalid skip (SCHEDULED → COMPLETED) → 400
- [ ] DOCTOR attempting CANCELLED via status → 403
- [ ] Overlapping appointment → 409
- [ ] Edit appointment when CHECKED_IN → 400
- [ ] Cancel non-SCHEDULED via DELETE → 400
- [ ] Modify terminal appointment → 400

### Patient APIs

- [ ] List / create / update / deactivate
- [ ] Dependents create requires firstName, lastName, relationship
- [ ] Emergency contact requires names, relationship, phone
- [ ] Medical profile upsert

### Prescription APIs

- [ ] Create with empty items → 400
- [ ] Item missing dosage/frequency/duration → 400
- [ ] Status update with invalid enum → 400
- [ ] PHARMACIST can GET and PATCH status; cannot POST/DELETE

### Order APIs

- [ ] Create with empty items → 400
- [ ] Invalid quantity/price → 400
- [ ] Status / payment-status invalid enum → 400
- [ ] PHARMACIST cannot POST create order (not in authorize list)
- [ ] ADMIN can DELETE order

### Document APIs

- [ ] Upload without file → 400
- [ ] Upload without `documentType` → 400
- [ ] Allowed MIME types succeed (pdf, jpeg, png, webp, txt, doc, docx)
- [ ] Unsupported MIME rejected by multer filter
- [ ] File larger than 10MB rejected by multer limit
- [ ] Download / delete happy paths

### Negative / boundary

- [ ] Duplicate email on register → 409
- [ ] Register PATIENT without DOB/gender/phone → 400
- [ ] Health check when DB down → 500 DOWN payload
- [ ] Concurrent overlapping bookings for same doctor/patient
- [ ] PATIENT can list own prescriptions; cannot list another patient's
- [ ] PHARMACIST cannot create RENEWAL request → 403
- [ ] PHARMACIST cannot approve RENEWAL → 403
- [ ] Duplicate SUBMITTED refill request → 409
- [ ] Reject without rejectionReason → 400
- [ ] create-order on non-APPROVED request → 400
- [ ] Second create-order on same request → 409
- [ ] Renewal approve does not change Prescription.status
- [ ] PATIENT can request appointment; ADMIN/DOCTOR can approve → SCHEDULED appointment created
- [ ] PATIENT appointment request reject requires reason
- [ ] PATIENT can cancel SUBMITTED appointment request only
- [ ] Approve fails when doctor/patient slot already booked (request stays SUBMITTED)
- [ ] PATIENT can list ACTIVE doctors only; cannot create doctors
- [ ] PATIENT cannot POST /api/appointments directly

---

## Related docs

- [API_INVENTORY.md](./API_INVENTORY.md) — endpoint table
- [openapi.yaml](./openapi.yaml) — full OpenAPI 3.0.3 specification
