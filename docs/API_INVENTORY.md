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
| GET | `/api/doctors` | Yes | ADMIN, DOCTOR | List doctors |
| GET | `/api/doctors/:id` | Yes | ADMIN, DOCTOR | Get doctor |
| POST | `/api/doctors` | Yes | ADMIN | Create doctor |
| PUT | `/api/doctors/:id` | Yes | ADMIN | Update doctor |
| DELETE | `/api/doctors/:id` | Yes | ADMIN | Delete doctor |
| GET | `/api/appointments` | Yes | ADMIN, DOCTOR | List appointments |
| POST | `/api/appointments` | Yes | ADMIN | Create appointment |
| GET | `/api/appointments/:id` | Yes | ADMIN, DOCTOR | Get appointment |
| PUT | `/api/appointments/:id` | Yes | ADMIN | Update schedule/details (not status) |
| PATCH | `/api/appointments/:id/status` | Yes | ADMIN, DOCTOR | Lifecycle status transition |
| DELETE | `/api/appointments/:id` | Yes | ADMIN | Cancel if SCHEDULED → CANCELLED |
| GET | `/api/prescriptions/patient/:patientId` | Yes | ADMIN, DOCTOR, PHARMACIST | List prescriptions for patient |
| GET | `/api/prescriptions/:id` | Yes | ADMIN, DOCTOR, PHARMACIST | Get prescription |
| POST | `/api/prescriptions` | Yes | ADMIN, DOCTOR | Create prescription |
| PATCH | `/api/prescriptions/:id/status` | Yes | ADMIN, DOCTOR, PHARMACIST | Update prescription status |
| DELETE | `/api/prescriptions/:id` | Yes | ADMIN, DOCTOR | Delete prescription |
| GET | `/api/orders/patient/:patientId` | Yes | ADMIN, PHARMACIST, PATIENT* | List orders for patient |
| GET | `/api/orders/:id` | Yes | ADMIN, PHARMACIST, PATIENT* | Get order |
| POST | `/api/orders` | Yes | ADMIN, PATIENT* | Create order |
| PATCH | `/api/orders/:id/status` | Yes | ADMIN, PHARMACIST | Update order status |
| PATCH | `/api/orders/:id/payment-status` | Yes | ADMIN, PHARMACIST | Update payment status |
| DELETE | `/api/orders/:id` | Yes | ADMIN | Delete order |

\* **PATIENT ownership:** when role is `PATIENT`, the patientId (path/body or order’s patientId) must match the Patient linked to the JWT `userId`. Otherwise **403**.

## Roles present in schema

| Role | Notes |
|------|--------|
| ADMIN | Full admin APIs; appointment create/update/cancel |
| DOCTOR | Clinical read/write within authorize lists; no appointment create |
| PHARMACIST | Prescriptions read/status; orders list/get/status/payment |
| PATIENT | Own patient record (via `requirePatientAccess`); own orders |
| SUPPORT | Exists in `UserRole` / admin user create schema; **no route currently authorizes SUPPORT** |
| VIEWER | Exists in `UserRole` / admin user create schema; **no route currently authorizes VIEWER** |

## Totals

- **Endpoints documented:** 53
- **Full OpenAPI:** [openapi.yaml](./openapi.yaml)
- **Testing guide:** [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)
