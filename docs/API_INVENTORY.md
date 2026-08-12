# API Inventory

Complete inventory of backend HTTP endpoints discovered from the current codebase  
(`backend/src/server.ts` + `backend/src/routes/*.ts` + controllers / services / middleware).

**Base URL:** `http://localhost:4000`  
**Auth:** Bearer JWT (`Authorization: Bearer <token>`) unless noted  
**Source of truth:** backend code (not older documentation)

**Total endpoints: 80**  
GET 32 · POST 23 · PUT 6 · PATCH 10 · DELETE 9

---

# A. Quick index by HTTP method

## GET APIs (32)

| Endpoint |
|----------|
| `GET /api/health` |
| `GET /api/users` |
| `GET /api/users/:id` |
| `GET /api/patients` |
| `GET /api/patients/:id` |
| `GET /api/patients/:id/dependents` |
| `GET /api/patients/:id/emergency-contact` |
| `GET /api/patients/:id/documents` |
| `GET /api/patients/:id/documents/:documentId/download` |
| `GET /api/patients/:id/medical-profile` |
| `GET /api/patients/:id/appointments` |
| `GET /api/doctors` |
| `GET /api/doctors/:id` |
| `GET /api/appointments` |
| `GET /api/appointments/:id` |
| `GET /api/appointment-requests` |
| `GET /api/appointment-requests/:id` |
| `GET /api/prescriptions/patient/:patientId` |
| `GET /api/prescriptions/:id` |
| `GET /api/refill-requests` |
| `GET /api/refill-requests/:id` |
| `GET /api/orders/patient/:patientId` |
| `GET /api/orders/:id` |
| `GET /api/audit-events` |
| `GET /api/medications` |
| `GET /api/medications/:id` |
| `GET /api/medications/:id/movements` |
| `GET /api/replenishment-requests` |
| `GET /api/replenishment-requests/:id` |
| `GET /api/lab-orders` |
| `GET /api/lab-orders/:id` |
| `GET /api/lab-orders/:id/result-document/download` |

## POST APIs (23)

| Endpoint |
|----------|
| `POST /api/auth/register` |
| `POST /api/auth/login` |
| `POST /api/auth/forgot-password` |
| `POST /api/auth/reset-password` |
| `POST /api/auth/change-password` |
| `POST /api/auth/logout` |
| `POST /api/users` |
| `POST /api/patients` |
| `POST /api/patients/:id/dependents` |
| `POST /api/patients/:id/documents` |
| `POST /api/doctors` |
| `POST /api/appointments` |
| `POST /api/appointment-requests` |
| `POST /api/prescriptions` |
| `POST /api/prescriptions/:id/refill-requests` |
| `POST /api/refill-requests/:id/create-order` |
| `POST /api/orders` |
| `POST /api/medications` |
| `POST /api/medications/:id/adjust` |
| `POST /api/replenishment-requests` |
| `POST /api/lab-orders` |
| `POST /api/lab-orders/:id/result` |
| `POST /api/lab-orders/:id/acknowledge` |

## PUT APIs (6)

| Endpoint |
|----------|
| `PUT /api/users/:id` |
| `PUT /api/patients/:id` |
| `PUT /api/patients/:id/emergency-contact` |
| `PUT /api/patients/:id/medical-profile` |
| `PUT /api/doctors/:id` |
| `PUT /api/appointments/:id` |

## PATCH APIs (10)

| Endpoint |
|----------|
| `PATCH /api/patients/:id/deactivate` |
| `PATCH /api/appointments/:id/status` |
| `PATCH /api/appointment-requests/:id/status` |
| `PATCH /api/prescriptions/:id/status` |
| `PATCH /api/refill-requests/:id/status` |
| `PATCH /api/orders/:id/status` |
| `PATCH /api/orders/:id/payment-status` |
| `PATCH /api/medications/:id` |
| `PATCH /api/replenishment-requests/:id/status` |
| `PATCH /api/lab-orders/:id/status` |

## DELETE APIs (9)

| Endpoint |
|----------|
| `DELETE /api/users/:id` |
| `DELETE /api/patients/:id` |
| `DELETE /api/patients/:id/dependents/:dependentId` |
| `DELETE /api/patients/:id/emergency-contact` |
| `DELETE /api/patients/:id/documents/:documentId` |
| `DELETE /api/doctors/:id` |
| `DELETE /api/appointments/:id` |
| `DELETE /api/prescriptions/:id` |
| `DELETE /api/orders/:id` |

---

# B. Resource-wise API catalog

Legend for **Ownership**:

| Label | Meaning |
|-------|---------|
| — | No patient-resource ownership check beyond role |
| Own patient | PATIENT may only access the Patient row linked to their JWT `userId` |
| Own Rx | PATIENT may only access prescriptions for their own patientId |
| Own order | PATIENT may only access their own orders |
| Own refill | PATIENT may only access their own refill/renewal requests |
| Own appt request | PATIENT may only access their own appointment requests |
| Own lab | PATIENT may only access their own lab orders; result content only when `ACKNOWLEDGED` |
| ACTIVE doctors | PATIENT list/get doctors filtered to `status === ACTIVE` |

Typical success envelope: `{ "success": true, "data": ... }` (sometimes with `message`).  
Typical error envelope: `{ "success": false, "message": "..." }` (validation may include `errors[]`).

---

## 1. Health

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/health` | No | Public | — | Process + DB connectivity (`SELECT 1`) |

**Success 200:** `{ status: "UP", database: "CONNECTED", message: "..." }`  
**Failure 500:** `{ status: "DOWN", database: "DISCONNECTED", message: "..." }`

---

## 2. Authentication (`/api/auth`)

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| POST | `/api/auth/register` | No | Public | — | Register user; PATIENT also creates Patient row |
| POST | `/api/auth/login` | No | Public | — | Login; returns JWT |
| POST | `/api/auth/forgot-password` | No | Public | — | Start password reset (dev may return token) |
| POST | `/api/auth/reset-password` | No | Public | — | Reset password with token |
| POST | `/api/auth/change-password` | Yes | Any authenticated | — | Change own password |
| POST | `/api/auth/logout` | Yes | Any authenticated | — | Logout contract (JWT remains client-side) |

### Register notes (from `auth.service`)

- Public roles allowed: `PATIENT`, `DOCTOR`, `PHARMACIST` only (not ADMIN / SUPPORT / VIEWER).
- Default role if omitted: `PATIENT`.
- PATIENT registration requires profile fields (`dateOfBirth`, `gender`, `phone`; address optional).

### Login notes

- Body: `{ email, password, rememberMe? }`
- Token expiry: `1h` default; `30d` when `rememberMe: true`
- Claims: `userId`, `role`, `email`
- Response includes `data.user.patientId` when a Patient is linked
- Lockout after failed attempts (service-enforced)

---

## 3. Users (`/api/users`) — ADMIN only

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/users` | Yes | ADMIN | — | List users |
| GET | `/api/users/:id` | Yes | ADMIN | — | Get user |
| POST | `/api/users` | Yes | ADMIN | — | Create user |
| PUT | `/api/users/:id` | Yes | ADMIN | — | Update user |
| DELETE | `/api/users/:id` | Yes | ADMIN | — | Delete user |

**Create body (validator):** `firstName`, `lastName`, `email`, `passwordHash` (field name as implemented), optional `role` (`ADMIN` \| `DOCTOR` \| `PHARMACIST` \| `SUPPORT` \| `VIEWER`).  
**Note:** Public register cannot create ADMIN/SUPPORT/VIEWER; admin user APIs can assign those roles.

---

## 4. Patients (`/api/patients`)

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/patients` | Yes | ADMIN, DOCTOR | — | List patients |
| POST | `/api/patients` | Yes | ADMIN, DOCTOR | — | Create patient |
| GET | `/api/patients/:id` | Yes | ADMIN, DOCTOR, or owning PATIENT | Own patient | Get patient |
| PUT | `/api/patients/:id` | Yes | ADMIN, DOCTOR, or owning PATIENT | Own patient | Update patient |
| DELETE | `/api/patients/:id` | Yes | ADMIN | — | Permanently delete |
| PATCH | `/api/patients/:id/deactivate` | Yes | ADMIN, DOCTOR | — | Set status INACTIVE |

Ownership for GET/PUT uses `requirePatientAccess` middleware.

---

## 5. Dependents

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/patients/:id/dependents` | Yes | ADMIN, DOCTOR, or owning PATIENT | Own patient | List dependents |
| POST | `/api/patients/:id/dependents` | Yes | ADMIN, DOCTOR, or owning PATIENT | Own patient | Add dependent |
| DELETE | `/api/patients/:id/dependents/:dependentId` | Yes | ADMIN, DOCTOR, or owning PATIENT | Own patient | Remove dependent |

---

## 6. Emergency contact

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/patients/:id/emergency-contact` | Yes | ADMIN, DOCTOR, or owning PATIENT | Own patient | Get emergency contact |
| PUT | `/api/patients/:id/emergency-contact` | Yes | ADMIN, DOCTOR, or owning PATIENT | Own patient | Upsert emergency contact |
| DELETE | `/api/patients/:id/emergency-contact` | Yes | ADMIN, DOCTOR, or owning PATIENT | Own patient | Delete emergency contact |

---

## 7. Documents

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/patients/:id/documents` | Yes | ADMIN, DOCTOR, or owning PATIENT | Own patient | List documents |
| POST | `/api/patients/:id/documents` | Yes | ADMIN, DOCTOR | — | Upload (`multipart`, field `document` + `documentType`) |
| GET | `/api/patients/:id/documents/:documentId/download` | Yes | ADMIN, DOCTOR, or owning PATIENT | Own patient | Download file |
| DELETE | `/api/patients/:id/documents/:documentId` | Yes | ADMIN, DOCTOR | — | Delete document |

Upload uses multer; max size 10MB; allowed MIME types include PDF, JPEG, PNG, WEBP, plain text, DOC/DOCX.

---

## 8. Medical profile

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/patients/:id/medical-profile` | Yes | ADMIN, DOCTOR, or owning PATIENT | Own patient | Get medical profile |
| PUT | `/api/patients/:id/medical-profile` | Yes | ADMIN, DOCTOR, or owning PATIENT | Own patient | Upsert medical profile |

---

## 9. Patient appointment history

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/patients/:id/appointments` | Yes | ADMIN, DOCTOR, or owning PATIENT | Own patient | Patient appointment history (view) |

Patients do **not** create appointments via `/api/appointments` (ADMIN only). Patients use appointment-requests instead.

---

## 10. Doctors (`/api/doctors`)

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/doctors` | Yes | ADMIN, DOCTOR, PATIENT | ACTIVE doctors | List doctors |
| GET | `/api/doctors/:id` | Yes | ADMIN, DOCTOR, PATIENT | ACTIVE doctors | Get doctor |
| POST | `/api/doctors` | Yes | ADMIN | — | Create doctor |
| PUT | `/api/doctors/:id` | Yes | ADMIN | — | Update doctor |
| DELETE | `/api/doctors/:id` | Yes | ADMIN | — | Delete doctor |

PATIENT list/get restricted to ACTIVE doctors in the controller/service.

---

## 11. Appointments (`/api/appointments`)

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/appointments` | Yes | ADMIN, DOCTOR | — | List appointments |
| POST | `/api/appointments` | Yes | ADMIN | — | Create appointment |
| GET | `/api/appointments/:id` | Yes | ADMIN, DOCTOR | — | Get appointment |
| PUT | `/api/appointments/:id` | Yes | ADMIN | — | Update schedule/details (not status) |
| PATCH | `/api/appointments/:id/status` | Yes | ADMIN, DOCTOR | — | Lifecycle status transition |
| DELETE | `/api/appointments/:id` | Yes | ADMIN | — | Cancel if SCHEDULED → CANCELLED |

Statuses (schema): `SCHEDULED`, `CONFIRMED`, `CHECKED_IN`, `IN_CONSULTATION`, `COMPLETED`, `CANCELLED`, `NO_SHOW`. Transitions enforced in service.

---

## 12. Appointment requests (`/api/appointment-requests`)

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| POST | `/api/appointment-requests` | Yes | PATIENT | Own (creator) | Create request |
| GET | `/api/appointment-requests` | Yes | ADMIN, DOCTOR, PATIENT | Own appt request | List (PATIENT own only) |
| GET | `/api/appointment-requests/:id` | Yes | ADMIN, DOCTOR, PATIENT | Own appt request | Get one |
| PATCH | `/api/appointment-requests/:id/status` | Yes | ADMIN, DOCTOR, PATIENT | Own + role rules | Approve / reject / cancel |

Service enforces role-specific transition rules (e.g. patient cancel vs staff approve/reject).

---

## 13. Prescriptions (`/api/prescriptions`)

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/prescriptions/patient/:patientId` | Yes | ADMIN, DOCTOR, PHARMACIST, PATIENT | Own Rx | List for patient |
| GET | `/api/prescriptions/:id` | Yes | ADMIN, DOCTOR, PHARMACIST, PATIENT | Own Rx | Get prescription |
| POST | `/api/prescriptions` | Yes | ADMIN, DOCTOR | — | Create with items |
| PATCH | `/api/prescriptions/:id/status` | Yes | ADMIN, DOCTOR, PHARMACIST | — | Update status |
| DELETE | `/api/prescriptions/:id` | Yes | ADMIN, DOCTOR | — | Delete prescription |
| POST | `/api/prescriptions/:id/refill-requests` | Yes | ADMIN, PHARMACIST, PATIENT | Own Rx | Create refill/renewal |

Statuses: `ACTIVE`, `COMPLETED`, `CANCELLED`.  
PHARMACIST may create REFILL only (not RENEWAL) — enforced in service.

---

## 14. Refill / renewal requests (`/api/refill-requests`)

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/refill-requests` | Yes | ADMIN, DOCTOR, PHARMACIST, PATIENT | Own refill | List (filters: status, patientId, requestType) |
| GET | `/api/refill-requests/:id` | Yes | ADMIN, DOCTOR, PHARMACIST, PATIENT | Own refill | Get one |
| PATCH | `/api/refill-requests/:id/status` | Yes | ADMIN, DOCTOR, PHARMACIST, PATIENT | Own + role rules | Approve / reject / cancel |
| POST | `/api/refill-requests/:id/create-order` | Yes | ADMIN, PATIENT | Own refill | Create order from APPROVED → FULFILLED |

Statuses: `SUBMITTED`, `APPROVED`, `REJECTED`, `CANCELLED`, `FULFILLED`.

---

## 15. Orders (`/api/orders`)

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/orders/patient/:patientId` | Yes | ADMIN, PHARMACIST, PATIENT | Own order | List orders |
| GET | `/api/orders/:id` | Yes | ADMIN, PHARMACIST, PATIENT | Own order | Get order |
| POST | `/api/orders` | Yes | ADMIN, PATIENT | Own order | Create order |
| PATCH | `/api/orders/:id/status` | Yes | ADMIN, PHARMACIST | — | Update order status |
| PATCH | `/api/orders/:id/payment-status` | Yes | ADMIN, PHARMACIST, PATIENT | Own order | Update payment status |
| DELETE | `/api/orders/:id` | Yes | ADMIN | — | Delete order |

Order statuses: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`.  
Payment statuses: `PENDING`, `PAID`, `FAILED`, `REFUNDED`.  
PATIENT payment updates limited in controller (e.g. PAID / FAILED on own order).

---

## 16. Medications / inventory (`/api/medications`)

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/medications` | Yes | ADMIN, PHARMACIST | — | List (filters: status, stockStatus, q) |
| POST | `/api/medications` | Yes | ADMIN, PHARMACIST | — | Create catalog entry |
| GET | `/api/medications/:id` | Yes | ADMIN, PHARMACIST | — | Get + derived stockStatus |
| PATCH | `/api/medications/:id` | Yes | ADMIN, PHARMACIST | — | Update catalog fields (not quantity) |
| POST | `/api/medications/:id/adjust` | Yes | ADMIN, PHARMACIST | — | Adjust stock with required reason |
| GET | `/api/medications/:id/movements` | Yes | ADMIN, PHARMACIST | — | Stock movement history (limit/offset) |

Derived `stockStatus`: `IN_STOCK` / `LOW_STOCK` / `OUT_OF_STOCK`.  
Orders do **not** auto-deduct stock.

---

## 17. Replenishment (`/api/replenishment-requests`)

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/replenishment-requests` | Yes | ADMIN, PHARMACIST | — | List (filters: status, medicationId) |
| POST | `/api/replenishment-requests` | Yes | ADMIN, PHARMACIST | — | Create request |
| GET | `/api/replenishment-requests/:id` | Yes | ADMIN, PHARMACIST | — | Get one |
| PATCH | `/api/replenishment-requests/:id/status` | Yes | ADMIN, PHARMACIST | Role rules in service | Approve / reject / cancel / receive |

Service rules: APPROVE/REJECT = ADMIN only; CANCEL = ADMIN or requester from SUBMITTED; RECEIVE = ADMIN/PHARMACIST from APPROVED. Duplicate open request → conflict.

---

## 18. Audit (`/api/audit-events`)

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/audit-events` | Yes | ADMIN, VIEWER, SUPPORT | — | List append-only events |

Query filters: `actorUserId`, `action`, `entityType`, `entityId`, `from`, `to`; pagination `limit` (default 50, max 100), `offset`.  
No write/update/delete audit routes.  
Entity types include: PATIENT, APPOINTMENT, APPOINTMENT_REQUEST, PRESCRIPTION, REFILL_REQUEST, ORDER, MEDICATION, REPLENISHMENT_REQUEST, LAB_TEST_ORDER.

---

## 19. Lab orders (`/api/lab-orders`)

| Method | Endpoint | Auth | Roles | Ownership | Purpose |
|--------|----------|------|-------|-----------|---------|
| GET | `/api/lab-orders` | Yes | ADMIN, DOCTOR, PATIENT | Own lab | List (filters: status, patientId, doctorId) |
| POST | `/api/lab-orders` | Yes | ADMIN, DOCTOR | — | Create (ordering doctor must be ACTIVE) |
| GET | `/api/lab-orders/:id` | Yes | ADMIN, DOCTOR, PATIENT | Own lab | Get; PATIENT result fields gated |
| PATCH | `/api/lab-orders/:id/status` | Yes | ADMIN, DOCTOR | Role rules in service | Collection / processing / cancel / reject |
| POST | `/api/lab-orders/:id/result` | Yes | ADMIN | — | Upload/replace result (`multipart`) |
| POST | `/api/lab-orders/:id/acknowledge` | Yes | ADMIN, DOCTOR | — | Acknowledge → ACKNOWLEDGED + Lab Report document |
| GET | `/api/lab-orders/:id/result-document/download` | Yes | ADMIN, DOCTOR, PATIENT | Own lab + ack gate | Download result file |

Statuses: `REQUESTED`, `SAMPLE_COLLECTED`, `PROCESSING`, `RESULT_AVAILABLE`, `ACKNOWLEDGED`, `CANCELLED`, `REJECTED`.  
Result flags: `NORMAL`, `ABNORMAL`, `CRITICAL`.  
ADMIN advances SAMPLE_COLLECTED / PROCESSING; DOCTOR may cancel early / reject / acknowledge.  
PATIENT sees result content only when `ACKNOWLEDGED`.

---

# C. Role / ownership matrix (summary by endpoint group)

| Area | ADMIN | DOCTOR | PATIENT | PHARMACIST | SUPPORT | VIEWER | Ownership notes |
|------|-------|--------|---------|------------|---------|--------|-----------------|
| Health | public | public | public | public | public | public | — |
| Auth login/register | public* | public* | public* | public* | admin-create | admin-create | *register: PATIENT/DOCTOR/PHARMACIST only |
| Users CRUD | Yes | No | No | No | No | No | — |
| Patients list/create/deactivate | Yes | Yes | No | No | No | No | — |
| Patients get/update + extensions | Yes | Yes | Own | No | No | No | `requirePatientAccess` |
| Documents upload/delete | Yes | Yes | No | No | No | No | — |
| Doctors read | Yes | Yes | ACTIVE only | No | No | No | — |
| Doctors write | Yes | No | No | No | No | No | — |
| Appointments create/update/delete | Yes | No† | No | No | No | No | †DOCTOR: status transitions + list/get |
| Appointment requests | Review | Review | Create/own | No | No | No | Patient own |
| Prescriptions | Yes | Yes | Own read | Read/status | No | No | Patient own |
| Refills | Yes | Yes | Own | Refill rules | No | No | Patient own |
| Orders | Yes | No | Own | Status/payment‡ | No | No | ‡no create/delete for pharmacist |
| Medications / replenishment | Yes | No | No | Yes | No | No | Replenish approve = ADMIN |
| Audit read | Yes | No | No | No | Yes | Yes | Append-only |
| Lab orders | Full ops | Clinical | Own + ack gate | No | No | No | Result privacy |

---

# D. Error / status reference

Statuses observed across controllers (not every endpoint returns every code):

| Status | Typical meaning |
|--------|-----------------|
| **200** | Success (GET/PUT/PATCH/DELETE/logout/result upload/ack) |
| **201** | Created (POST create resources) |
| **400** | Validation failed, invalid transition, bad ID, business rule rejection |
| **401** | Missing/invalid JWT (`authenticate`) |
| **403** | Role not allowed (`authorize`) or ownership failure |
| **404** | Resource not found |
| **409** | Conflict (e.g. duplicate open replenishment) |
| **500** | Unhandled server/DB error; health DOWN |

Do not assume a specific status for an endpoint unless that controller/service maps it.

Validation failures often return:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "...", "message": "..." }]
}
```

---

# E. Completeness note

This inventory was rebuilt from route modules mounted in `server.ts`:

`/api/auth`, `/api/users`, `/api/patients`, `/api/doctors`, `/api/appointments`, `/api/prescriptions`, `/api/orders`, `/api/refill-requests`, `/api/appointment-requests`, `/api/audit-events`, `/api/medications`, `/api/replenishment-requests`, `/api/lab-orders`, plus `GET /api/health`.

**Endpoint count: 80** — matches OpenAPI operation count when docs are reconciled.
