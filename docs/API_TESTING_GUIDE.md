# API Testing Guide

## What this guide is for

This guide helps someone who has **never seen this project** start the backend and call APIs locally (Postman, curl, Insomnia, etc.).

You do **not** need the frontend for API testing.

If you only need endpoint lists and roles, see [API_INVENTORY.md](./API_INVENTORY.md).  
If you need formal test scenarios, see [API_TEST_CASES.md](./API_TEST_CASES.md).

---

## Prerequisites

| Requirement | Notes |
|-------------|--------|
| **Node.js + npm** | Used by `backend/`. No `engines` field is declared in `package.json`; local Node 24.x + npm 11.x has been used successfully with Prisma 7 / `tsx`. |
| **PostgreSQL** | Required. Schema provider is PostgreSQL. |
| **Git clone of this repo** | Work from the repo root, then `backend/`. |

### Environment variables (from code)

| Variable | Required | Default / notes |
|----------|----------|-----------------|
| `DATABASE_URL` | **Yes** | No default — `backend/src/config/prisma.ts` throws if missing |
| `JWT_SECRET` | No | Falls back to `local-development-secret` |
| `ADMIN_EMAIL` | No | Used by admin bootstrap script; default `admin@healthcare.local` |
| `ADMIN_PASSWORD` | No | Used by admin bootstrap script; default `Admin@12345` |

There is **no** committed `.env.example`. Create `backend/.env` locally.

### Scripts that actually exist (`backend/package.json`)

| Script | Command | Purpose |
|--------|---------|---------|
| Dev server | `npm run dev` | `tsx watch src/server.ts` |
| Build | `npm run build` | `tsc` |
| Start (compiled) | `npm start` | `node dist/server.js` |

Prisma is invoked via `npx prisma ...` (Prisma is a dependency). Config: `backend/prisma.config.ts`.

---

## Local setup (exact sequence)

### Step 1 — Open a terminal

Use PowerShell, cmd, or bash.

### Step 2 — Go to the backend folder

```bash
cd backend
```

### Step 3 — Install dependencies

```bash
npm install
```

### Step 4 — Configure environment

Create `backend/.env` with at least:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/healthops
```

Optional:

```env
JWT_SECRET=local-development-secret
ADMIN_EMAIL=admin@healthcare.local
ADMIN_PASSWORD=Admin@12345
```

### Step 5 — Prepare the database

1. Ensure PostgreSQL is running.
2. Create an empty database (name must match `DATABASE_URL`).

### Step 6 — Run migrations

From `backend/`:

```bash
npx prisma migrate deploy
```

(For local iterative development some teams use `npx prisma migrate dev`; `deploy` applies existing migrations.)

### Step 7 — Generate Prisma client (if needed)

```bash
npx prisma generate
```

Usually also runs as part of install/migrate workflows; run explicitly if imports fail.

### Step 8 — Start the backend

```bash
npm run dev
```

Expected console line:

```text
Healthcare API running on http://localhost:4000
```

Port **4000** is hardcoded in `backend/src/server.ts`.

### Step 9 — Verify health

```bash
curl http://localhost:4000/api/health
```

Expected when DB is up:

```json
{
  "status": "UP",
  "database": "CONNECTED",
  "message": "Healthcare API is running"
}
```

If `status` is `DOWN`, fix PostgreSQL / `DATABASE_URL` before continuing.

### Optional — Create / reset an ADMIN user

From `backend/` (with DB configured):

```bash
npx tsx src/scripts/create-admin.ts
```

Defaults: `admin@healthcare.local` / `Admin@12345` (overridable via env).

Other roles are **not** seeded by the repo. Create them via:

- `POST /api/auth/register` (PATIENT, DOCTOR, PHARMACIST only), or  
- `POST /api/users` as ADMIN (can assign ADMIN, DOCTOR, PHARMACIST, SUPPORT, VIEWER).

---

## First API call (JWT walkthrough)

Authentication and authorization are different:

| Term | Meaning |
|------|---------|
| **Authentication** | Proving who you are (valid JWT) |
| **Authorization** | Your **role** is allowed on that route |
| **Ownership** | Extra checks that a PATIENT only touches their own patient/order/etc. |

### 1. Start the backend

See Step 8 above.

### 2. Open Postman (or any HTTP client)

### 3. Set base URL

```text
http://localhost:4000
```

### 4. Call login

`POST /api/auth/login`  
Header: `Content-Type: application/json`  
Body:

```json
{
  "email": "admin@healthcare.local",
  "password": "Admin@12345",
  "rememberMe": false
}
```

### 5. Copy the token

Success response includes:

```json
{
  "success": true,
  "data": {
    "token": "<JWT>",
    "user": { "id": 1, "role": "ADMIN", "patientId": null },
    "expiresIn": "1h"
  }
}
```

### 6. Add the Bearer token

On later requests:

```http
Authorization: Bearer <JWT>
```

Missing `Bearer ` prefix → **401** `"Authentication token is required"`.  
Bad/expired token → **401** `"Invalid or expired token"`.

### 7. Call a simple authenticated GET

Example:

```http
GET /api/patients
Authorization: Bearer <ADMIN_TOKEN>
```

### 8. Inspect the response

Look for `success: true` and `data` (array or object).

### 9. Extract an ID

Example: copy `data[0].id` as `patientId`.

### 10. Use that ID in the next API

Example:

```http
GET /api/patients/{{patientId}}
Authorization: Bearer <TOKEN>
```

---

## Authentication details

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/auth/register` | Public | Create PATIENT / DOCTOR / PHARMACIST user |
| `POST /api/auth/login` | Public | Obtain JWT |
| `POST /api/auth/forgot-password` | Public | Start reset |
| `POST /api/auth/reset-password` | Public | Finish reset |
| `POST /api/auth/change-password` | JWT | Change own password |
| `POST /api/auth/logout` | JWT | Contract only (stateless JWT) |

**Remember-me:** `rememberMe: true` → token lifetime `30d`; otherwise `1h`.

**Account lockout:** repeated failed logins can lock the account (service rule).

---

## Postman variables (recommended)

| Variable | Example source |
|----------|----------------|
| `baseUrl` | `http://localhost:4000` |
| `token` | `data.token` from login |
| `patientId` | From `GET /api/patients` or register/login `patientId` |
| `doctorId` | From `GET /api/doctors` |
| `appointmentId` | From create appointment / list |
| `prescriptionId` | From create prescription / list |
| `orderId` | From create order / list |
| `medicationId` | From create medication / list |
| `labOrderId` | From create lab order / list |
| `refillRequestId` | From refill list |
| `appointmentRequestId` | From appointment-request list |
| `replenishmentRequestId` | From replenishment list |
| `userId` | From `GET /api/users` (ADMIN) |
| `documentId` | From documents list |

Prefer **workflow-generated IDs** over hard-coded numbers.

---

## Role-by-role testing

Roles in schema: `ADMIN`, `DOCTOR`, `PHARMACIST`, `PATIENT`, `SUPPORT`, `VIEWER`.

### ADMIN

- **Obtain:** bootstrap script, or create via another admin’s `POST /api/users`.
- **Can test:** nearly all business APIs; audit; inventory approve; lab ops; appointment create.
- **403 examples:** none for most staff routes (still need valid token).

### DOCTOR

- **Obtain:** `POST /api/auth/register` with `role: "DOCTOR"`, or admin create.
- **Can test:** patients, prescriptions, appointment status, refill review, lab create/ack, doctors list.
- **403 examples:** `POST /api/appointments`, medication APIs, audit, user CRUD, lab result upload.

### PATIENT

- **Obtain:** register with `role: "PATIENT"` (+ DOB, gender, phone).
- **Can test:** own profile extensions, own Rx/orders/refills/appointment-requests/lab orders, ACTIVE doctors.
- **403 examples:** other patients’ IDs, admin APIs, inventory, audit, create appointments, upload patient documents (staff only).

### PHARMACIST

- **Obtain:** register `role: "PHARMACIST"` or admin create.
- **Can test:** prescriptions read/status, orders status/payment, refill (REFILL type), medications, replenishment.
- **403 examples:** patients list, appointments, audit, lab APIs, user CRUD.

### SUPPORT / VIEWER

- **Obtain:** ADMIN `POST /api/users` with role `SUPPORT` or `VIEWER` (not via public register).
- **Can test:** `GET /api/audit-events` (and authenticated auth endpoints like change-password/logout).
- **403 examples:** almost all clinical/ops routes.

---

## Common workflow examples

Use real paths. Create prerequisite IDs as you go.

### A. Patient creation (staff)

1. Login as ADMIN or DOCTOR  
2. `POST /api/patients`  
3. `GET /api/patients/:id`

### B. Appointment lifecycle (staff)

1. Need `patientId` + `doctorId`  
2. ADMIN `POST /api/appointments`  
3. ADMIN/DOCTOR `PATCH /api/appointments/:id/status` through lifecycle  
4. Optional ADMIN `DELETE /api/appointments/:id` (SCHEDULED → CANCELLED)

### C. Patient appointment request

1. Login as PATIENT  
2. `POST /api/appointment-requests`  
3. Staff `PATCH /api/appointment-requests/:id/status` (approve/reject)

### D. Prescription

1. ADMIN/DOCTOR `POST /api/prescriptions` (patientId, doctorId, items)  
2. `GET /api/prescriptions/patient/:patientId`  
3. Optional `PATCH /api/prescriptions/:id/status`

### E. Refill → order

1. `POST /api/prescriptions/:id/refill-requests`  
2. Staff `PATCH /api/refill-requests/:id/status` → APPROVED  
3. ADMIN/PATIENT `POST /api/refill-requests/:id/create-order`

### F. Order / payment

1. ADMIN/PATIENT `POST /api/orders`  
2. ADMIN/PHARMACIST `PATCH /api/orders/:id/status`  
3. ADMIN/PHARMACIST/PATIENT `PATCH /api/orders/:id/payment-status`

### G. Inventory / replenishment

1. ADMIN/PHARMACIST `POST /api/medications`  
2. `POST /api/medications/:id/adjust`  
3. `POST /api/replenishment-requests`  
4. ADMIN approve → staff receive (`PATCH .../status`)

### H. Audit

1. Perform any audited mutation (e.g. create appointment)  
2. Login as ADMIN / VIEWER / SUPPORT  
3. `GET /api/audit-events?entityType=APPOINTMENT`

### I. Lab order

1. ADMIN/DOCTOR `POST /api/lab-orders`  
2. ADMIN status → SAMPLE_COLLECTED → PROCESSING  
3. ADMIN `POST /api/lab-orders/:id/result` (multipart)  
4. ADMIN/DOCTOR `POST /api/lab-orders/:id/acknowledge`  
5. PATIENT `GET /api/lab-orders/:id` (result visible only after ack)

---

## Troubleshooting

| Symptom | What to check |
|---------|----------------|
| **401** | Header present? Starts with `Bearer `? Token expired? Login again. |
| **403** | Wrong role for route? PATIENT using another patient’s id? |
| **404** | Wrong id? Resource deleted? Typo in path? |
| **409** | Conflict (e.g. open replenishment already exists). |
| **400 Validation failed** | Body/schema mismatch; read `errors[]`. |
| **Invalid or expired token** | Clock skew / expiry / wrong `JWT_SECRET` between restarts if you minted tokens with a different secret. |
| **`DATABASE_URL is not defined`** | Create `backend/.env`. |
| **Health DOWN** | PostgreSQL running? URL correct? Migrations applied? |
| **Connection refused :4000** | Backend not started; another process crashed; check terminal. |
| **Cannot register ADMIN** | Expected — public register blocks ADMIN; use create-admin script or admin user API. |
| **Multer / upload errors** | Field name must be `document`; check MIME type and 10MB limit. |

---

## Related docs

- [README.md](./README.md) — documentation map  
- [API_INVENTORY.md](./API_INVENTORY.md) — full endpoint inventory  
- [API_TEST_CASES.md](./API_TEST_CASES.md) — functional test catalog  
- [openapi.yaml](./openapi.yaml) — OpenAPI contract  
