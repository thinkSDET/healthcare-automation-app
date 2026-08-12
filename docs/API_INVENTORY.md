# API Inventory

Quick reference for every backend endpoint discovered in the current codebase (`backend/src/server.ts` + route modules).

**Base URL:** `http://localhost:4000`  
**Auth:** Bearer JWT (`Authorization: Bearer <token>`) unless noted  
**Roles source of truth:** `authenticate` / `authorize` / `requirePatientAccess` / order ownership checks in controllers

| Method | Endpoint | Auth | Roles | Purpose |
|--------|----------|------|-------|---------|
| GET | `/api/health` | No | Public | Health + DB connectivity check |
| POST | `/api/auth/register` | No | Public (roles: PATIENT, DOCTOR, PHARMACIST only) | Register user (+ Patient row when PATIENT) |
| POST | `/api/auth/login` | No | Public | Login; returns JWT |
| POST | `/api/auth/forgot-password` | No | Public | Start password reset (dev may return `resetToken`) |
| POST | `/api/auth/reset-password` | No | Public | Reset password with token |
| POST | `/api/auth/change-password` | Yes | Any authenticated role | Change own password |
| POST | `/api/auth/logout` | Yes | Any authenticated role | Logout contract (stateless JWT) |
| GET | `/api/users` | Yes | ADMIN | List users |
| GET | `/api/users/:id` | Yes | ADMIN | Get user |
| POST | `/api/users` | Yes | ADMIN | Create user |
| PUT | `/api/users/:id` | Yes | ADMIN | Update user |
| DELETE | `/api/users/:id` | Yes | ADMIN | Delete user |
| GET | `/api/patients` | Yes | ADMIN, DOCTOR | List patients |
| POST | `/api/patients` | Yes | ADMIN, DOCTOR | Create patient |
| GET | `/api/patients/:id` | Yes | ADMIN, DOCTOR, or owning PATIENT | Get patient |
| PUT | `/api/patients/:id` | Yes | ADMIN, DOCTOR, or owning PATIENT | Update patient |
| DELETE | `/api/patients/:id` | Yes | ADMIN | Permanently delete patient |
| PATCH | `/api/patients/:id/deactivate` | Yes | ADMIN, DOCTOR | Set patient status INACTIVE |
| GET | `/api/patients/:id/dependents` | Yes | ADMIN, DOCTOR, or owning PATIENT | List dependents |
| POST | `/api/patients/:id/dependents` | Yes | ADMIN, DOCTOR, or owning PATIENT | Add dependent |
| DELETE | `/api/patients/:id/dependents/:dependentId` | Yes | ADMIN, DOCTOR, or owning PATIENT | Remove dependent |
| GET | `/api/patients/:id/emergency-contact` | Yes | ADMIN, DOCTOR, or owning PATIENT | Get emergency contact |
| PUT | `/api/patients/:id/emergency-contact` | Yes | ADMIN, DOCTOR, or owning PATIENT | Upsert emergency contact |
| DELETE | `/api/patients/:id/emergency-contact` | Yes | ADMIN, DOCTOR, or owning PATIENT | Delete emergency contact |
| GET | `/api/patients/:id/documents` | Yes | ADMIN, DOCTOR, or owning PATIENT | List documents |
| POST | `/api/patients/:id/documents` | Yes | ADMIN, DOCTOR | Upload document (`multipart`) |
| GET | `/api/patients/:id/documents/:documentId/download` | Yes | ADMIN, DOCTOR, or owning PATIENT | Download document file |
| DELETE | `/api/patients/:id/documents/:documentId` | Yes | ADMIN, DOCTOR | Delete document |
| GET | `/api/patients/:id/medical-profile` | Yes | ADMIN, DOCTOR, or owning PATIENT | Get medical profile |
| PUT | `/api/patients/:id/medical-profile` | Yes | ADMIN, DOCTOR, or owning PATIENT | Upsert medical profile |
| GET | `/api/patients/:id/appointments` | Yes | ADMIN, DOCTOR, or owning PATIENT | Patient appointment history |
| GET | `/api/doctors` | Yes | ADMIN, DOCTOR, PATIENT* | List doctors (PATIENT sees ACTIVE only) |
| GET | `/api/doctors/:id` | Yes | ADMIN, DOCTOR, PATIENT* | Get doctor (PATIENT: ACTIVE only) |
| POST | `/api/doctors` | Yes | ADMIN | Create doctor |
| PUT | `/api/doctors/:id` | Yes | ADMIN | Update doctor |
| DELETE | `/api/doctors/:id` | Yes | ADMIN | Delete doctor |
| GET | `/api/appointments` | Yes | ADMIN, DOCTOR | List appointments |
| POST | `/api/appointments` | Yes | ADMIN | Create appointment |
| GET | `/api/appointments/:id` | Yes | ADMIN, DOCTOR | Get appointment |
| PUT | `/api/appointments/:id` | Yes | ADMIN | Update schedule/details (not status) |
| PATCH | `/api/appointments/:id/status` | Yes | ADMIN, DOCTOR | Lifecycle status transition |
| DELETE | `/api/appointments/:id` | Yes | ADMIN | Cancel if SCHEDULED → CANCELLED |
| POST | `/api/appointment-requests` | Yes | PATIENT* | Create appointment request |
| GET | `/api/appointment-requests` | Yes | ADMIN, DOCTOR, PATIENT* | List appointment requests |
| GET | `/api/appointment-requests/:id` | Yes | ADMIN, DOCTOR, PATIENT* | Get appointment request |
| PATCH | `/api/appointment-requests/:id/status` | Yes | ADMIN, DOCTOR, PATIENT* | Approve/reject/cancel (role rules apply) |
| GET | `/api/prescriptions/patient/:patientId` | Yes | ADMIN, DOCTOR, PHARMACIST, PATIENT* | List prescriptions for patient |
| GET | `/api/prescriptions/:id` | Yes | ADMIN, DOCTOR, PHARMACIST, PATIENT* | Get prescription |
| POST | `/api/prescriptions` | Yes | ADMIN, DOCTOR | Create prescription |
| PATCH | `/api/prescriptions/:id/status` | Yes | ADMIN, DOCTOR, PHARMACIST | Update prescription status |
| DELETE | `/api/prescriptions/:id` | Yes | ADMIN, DOCTOR | Delete prescription |
| POST | `/api/prescriptions/:id/refill-requests` | Yes | ADMIN, PHARMACIST, PATIENT* | Create refill/renewal request (PHARMACIST: REFILL only) |
| GET | `/api/refill-requests` | Yes | ADMIN, DOCTOR, PHARMACIST, PATIENT* | List refill/renewal requests (filters: status, patientId, requestType) |
| GET | `/api/refill-requests/:id` | Yes | ADMIN, DOCTOR, PHARMACIST, PATIENT* | Get refill/renewal request |
| PATCH | `/api/refill-requests/:id/status` | Yes | ADMIN, DOCTOR, PHARMACIST, PATIENT* | Approve/reject/cancel per role and request type |
| POST | `/api/refill-requests/:id/create-order` | Yes | ADMIN, PATIENT* | Create order from APPROVED request and mark FULFILLED |
| GET | `/api/orders/patient/:patientId` | Yes | ADMIN, PHARMACIST, PATIENT* | List orders for patient |
| GET | `/api/orders/:id` | Yes | ADMIN, PHARMACIST, PATIENT* | Get order |
| POST | `/api/orders` | Yes | ADMIN, PATIENT* | Create order |
| PATCH | `/api/orders/:id/status` | Yes | ADMIN, PHARMACIST | Update order status |
| PATCH | `/api/orders/:id/payment-status` | Yes | ADMIN, PHARMACIST, PATIENT* | Update payment status |
| DELETE | `/api/orders/:id` | Yes | ADMIN | Delete order |
| GET | `/api/audit-events` | Yes | ADMIN, VIEWER, SUPPORT | List append-only audit events (filters: actorUserId, action, entityType, entityId, from, to; pagination: limit, offset) |
| GET | `/api/medications` | Yes | ADMIN, PHARMACIST | List medications (filters: status, stockStatus, q) |
| POST | `/api/medications` | Yes | ADMIN, PHARMACIST | Create medication catalog entry |
| GET | `/api/medications/:id` | Yes | ADMIN, PHARMACIST | Get medication + derived stockStatus |
| PATCH | `/api/medications/:id` | Yes | ADMIN, PHARMACIST | Update catalog fields (not quantity) |
| POST | `/api/medications/:id/adjust` | Yes | ADMIN, PHARMACIST | Adjust stock with required reason |
| GET | `/api/medications/:id/movements` | Yes | ADMIN, PHARMACIST | Stock movement history (limit/offset) |
| GET | `/api/replenishment-requests` | Yes | ADMIN, PHARMACIST | List replenishment requests (filters: status, medicationId) |
| POST | `/api/replenishment-requests` | Yes | ADMIN, PHARMACIST | Create replenishment request |
| GET | `/api/replenishment-requests/:id` | Yes | ADMIN, PHARMACIST | Get replenishment request |
| PATCH | `/api/replenishment-requests/:id/status` | Yes | ADMIN, PHARMACIST* | Approve/reject (ADMIN); cancel; receive (ADMIN/PHARMACIST) |
| POST | `/api/lab-orders` | Yes | ADMIN, DOCTOR | Create lab test order (ordering doctor must be ACTIVE) |
| GET | `/api/lab-orders` | Yes | ADMIN, DOCTOR, PATIENT* | List lab orders (filters: status, patientId, doctorId); PATIENT own only |
| GET | `/api/lab-orders/:id` | Yes | ADMIN, DOCTOR, PATIENT* | Get lab order; PATIENT result fields only when ACKNOWLEDGED |
| PATCH | `/api/lab-orders/:id/status` | Yes | ADMIN, DOCTOR† | Collection/processing (ADMIN); cancel; reject result |
| POST | `/api/lab-orders/:id/result` | Yes | ADMIN | Upload/replace result (`multipart`: resultSummary, resultFlag, optional document) → RESULT_AVAILABLE |
| POST | `/api/lab-orders/:id/acknowledge` | Yes | ADMIN, DOCTOR | Acknowledge result → ACKNOWLEDGED; attach Lab Report PatientDocument |
| GET | `/api/lab-orders/:id/result-document/download` | Yes | ADMIN, DOCTOR, PATIENT* | Download result file; PATIENT only when ACKNOWLEDGED |

\* **Replenishment status rules:** APPROVE/REJECT = ADMIN only; CANCEL = ADMIN or requester from SUBMITTED; RECEIVE = ADMIN/PHARMACIST from APPROVED.

† **Lab status rules:** SAMPLE_COLLECTED / PROCESSING / REJECTED→PROCESSING = ADMIN only; CANCEL from REQUESTED/SAMPLE_COLLECTED = ADMIN or DOCTOR; REJECT from RESULT_AVAILABLE = ADMIN or DOCTOR (reason required).

\* **PATIENT ownership:** when role is `PATIENT`, the patientId (path/body or resource’s patientId) must match the Patient linked to the JWT `userId`. Otherwise **403**.

## Roles present in schema

| Role | Notes |
|------|--------|
| ADMIN | Full admin APIs; appointment create/update/cancel; refill/renewal review; audit read; inventory + replenishment approve; lab ops (status + result upload) + acknowledge |
| DOCTOR | Clinical read/write within authorize lists; no appointment create; renewal approve; create/view/cancel/ack/reject lab orders |
| PHARMACIST | Prescriptions read/status; orders list/get/status/payment; refill request (not renewal) + refill approve; inventory view/adjust; replenishment create/receive |
| PATIENT | Own patient record; own prescriptions (read); own refill/renewal requests; own orders; own appointment requests; own lab orders (result content after ACKNOWLEDGED); ACTIVE doctors (read) |
| SUPPORT | Exists in `UserRole` / admin user create schema; **read-only audit** via `GET /api/audit-events` |
| VIEWER | Exists in `UserRole` / admin user create schema; **read-only audit** via `GET /api/audit-events` |

## Totals

- **Endpoints documented:** 80
- **Full OpenAPI:** [openapi.yaml](./openapi.yaml)
- **Testing guide:** [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)
