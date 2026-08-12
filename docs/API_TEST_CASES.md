# API Test Cases

Functional API test-case catalog for HealthOps.

This is **not** a duplicate of the endpoint list. Each row is a **scenario**.  
Suites are mapped separately so one test case can belong to Smoke **and** Sanity **and** Regression without duplication.

**How to use IDs:** prefer workflow-generated IDs (login → create → use returned `id`). Do not hard-code database IDs.

Base URL: `http://localhost:4000`

---

## Suite definitions

| Suite | Intent |
|-------|--------|
| **Smoke** | Smallest set proving the API process works |
| **Sanity** | Focused checks after a change in a module |
| **Regression** | Broader coverage of critical business workflows |
| **Negative / Security** | Auth, RBAC, ownership, validation, conflicts |

---

## Test case catalog

| TC ID | Module | Scenario | Role | Method | Endpoint | Priority | Suites |
|-------|--------|----------|------|--------|----------|----------|--------|
| TC-001 | Auth | Login with valid ADMIN credentials | Public→ADMIN | POST | `/api/auth/login` | P0 | Smoke, Sanity, Regression |
| TC-002 | Health | Health returns UP when DB connected | Public | GET | `/api/health` | P0 | Smoke, Sanity, Regression |
| TC-003 | Patients | ADMIN lists patients | ADMIN | GET | `/api/patients` | P0 | Smoke, Sanity, Regression |
| TC-004 | Patients | ADMIN/DOCTOR creates patient | ADMIN | POST | `/api/patients` | P0 | Smoke, Regression |
| TC-005 | Patients | PATIENT gets own profile | PATIENT | GET | `/api/patients/:id` | P0 | Smoke, Regression |
| TC-006 | Patients | PATIENT forbidden on another patient | PATIENT | GET | `/api/patients/:id` | P0 | Smoke, Negative |
| TC-007 | Auth | Unauthenticated request rejected | — | GET | `/api/patients` | P0 | Smoke, Negative |
| TC-008 | Doctors | List doctors as ADMIN | ADMIN | GET | `/api/doctors` | P1 | Sanity, Regression |
| TC-009 | Doctors | PATIENT sees only ACTIVE doctors | PATIENT | GET | `/api/doctors` | P1 | Regression |
| TC-010 | Appointments | ADMIN creates appointment | ADMIN | POST | `/api/appointments` | P0 | Smoke, Regression |
| TC-011 | Appointments | DOCTOR advances status | DOCTOR | PATCH | `/api/appointments/:id/status` | P0 | Sanity, Regression |
| TC-012 | Appointments | DOCTOR cannot create appointment | DOCTOR | POST | `/api/appointments` | P1 | Negative, Regression |
| TC-013 | Appointments | Invalid status transition rejected | ADMIN | PATCH | `/api/appointments/:id/status` | P1 | Negative, Regression |
| TC-014 | Appt Requests | PATIENT creates appointment request | PATIENT | POST | `/api/appointment-requests` | P0 | Sanity, Regression |
| TC-015 | Appt Requests | Staff approves request | ADMIN | PATCH | `/api/appointment-requests/:id/status` | P0 | Sanity, Regression |
| TC-016 | Prescriptions | DOCTOR creates prescription with items | DOCTOR | POST | `/api/prescriptions` | P0 | Smoke, Regression |
| TC-017 | Prescriptions | PATIENT lists own prescriptions | PATIENT | GET | `/api/prescriptions/patient/:patientId` | P0 | Sanity, Regression |
| TC-018 | Prescriptions | PATIENT cannot read another patient’s Rx | PATIENT | GET | `/api/prescriptions/patient/:patientId` | P0 | Negative |
| TC-019 | Refills | PATIENT creates REFILL request | PATIENT | POST | `/api/prescriptions/:id/refill-requests` | P0 | Sanity, Regression |
| TC-020 | Refills | PHARMACIST cannot create RENEWAL | PHARMACIST | POST | `/api/prescriptions/:id/refill-requests` | P1 | Negative, Regression |
| TC-021 | Refills | Staff approves refill | DOCTOR/ADMIN | PATCH | `/api/refill-requests/:id/status` | P0 | Sanity, Regression |
| TC-022 | Refills | Create order from APPROVED refill | ADMIN/PATIENT | POST | `/api/refill-requests/:id/create-order` | P0 | Regression |
| TC-023 | Orders | PATIENT creates order | PATIENT | POST | `/api/orders` | P0 | Sanity, Regression |
| TC-024 | Orders | PHARMACIST updates order status | PHARMACIST | PATCH | `/api/orders/:id/status` | P0 | Sanity, Regression |
| TC-025 | Orders | PATIENT updates own payment status | PATIENT | PATCH | `/api/orders/:id/payment-status` | P1 | Regression |
| TC-026 | Orders | PATIENT cannot access another order | PATIENT | GET | `/api/orders/:id` | P0 | Negative |
| TC-027 | Inventory | Create medication | ADMIN | POST | `/api/medications` | P0 | Sanity, Regression |
| TC-028 | Inventory | Adjust stock with reason | PHARMACIST | POST | `/api/medications/:id/adjust` | P0 | Sanity, Regression |
| TC-029 | Inventory | Adjust that would go negative rejected | ADMIN | POST | `/api/medications/:id/adjust` | P1 | Negative |
| TC-030 | Inventory | DOCTOR cannot list medications | DOCTOR | GET | `/api/medications` | P0 | Negative, Smoke |
| TC-031 | Replenish | Create replenishment request | PHARMACIST | POST | `/api/replenishment-requests` | P0 | Sanity, Regression |
| TC-032 | Replenish | Duplicate open request → 409 | PHARMACIST | POST | `/api/replenishment-requests` | P1 | Negative |
| TC-033 | Replenish | PHARMACIST cannot APPROVE | PHARMACIST | PATCH | `/api/replenishment-requests/:id/status` | P0 | Negative |
| TC-034 | Replenish | ADMIN approve then receive increases stock | ADMIN/PHARMACIST | PATCH | `/api/replenishment-requests/:id/status` | P0 | Regression |
| TC-035 | Audit | ADMIN lists audit events | ADMIN | GET | `/api/audit-events` | P0 | Smoke, Sanity, Regression |
| TC-036 | Audit | PATIENT cannot read audit | PATIENT | GET | `/api/audit-events` | P0 | Negative, Smoke |
| TC-037 | Audit | VIEWER/SUPPORT can read audit | VIEWER | GET | `/api/audit-events` | P1 | Sanity, Regression |
| TC-038 | Audit | Mutation creates audit event | ADMIN | GET | `/api/audit-events` | P1 | Regression |
| TC-039 | Documents | ADMIN uploads patient document | ADMIN | POST | `/api/patients/:id/documents` | P1 | Sanity, Regression |
| TC-040 | Documents | PATIENT can download own document | PATIENT | GET | `/api/patients/:id/documents/:documentId/download` | P1 | Regression |
| TC-041 | Documents | PATIENT cannot upload document | PATIENT | POST | `/api/patients/:id/documents` | P1 | Negative |
| TC-042 | Users | ADMIN creates SUPPORT user | ADMIN | POST | `/api/users` | P2 | Regression |
| TC-043 | Auth | Register PATIENT with profile fields | Public | POST | `/api/auth/register` | P0 | Sanity, Regression |
| TC-044 | Auth | Register ADMIN via public API rejected | Public | POST | `/api/auth/register` | P1 | Negative |
| TC-045 | Lab | DOCTOR creates lab order (ACTIVE doctor) | DOCTOR | POST | `/api/lab-orders` | P0 | Smoke, Regression |
| TC-046 | Lab | Create with inactive doctor rejected | ADMIN | POST | `/api/lab-orders` | P1 | Negative |
| TC-047 | Lab | ADMIN advances to PROCESSING | ADMIN | PATCH | `/api/lab-orders/:id/status` | P0 | Sanity, Regression |
| TC-048 | Lab | DOCTOR cannot mark SAMPLE_COLLECTED | DOCTOR | PATCH | `/api/lab-orders/:id/status` | P0 | Negative |
| TC-049 | Lab | ADMIN uploads result | ADMIN | POST | `/api/lab-orders/:id/result` | P0 | Smoke, Regression |
| TC-050 | Lab | PATIENT cannot see result before ack | PATIENT | GET | `/api/lab-orders/:id` | P0 | Smoke, Negative |
| TC-051 | Lab | PATIENT download before ack → 403 | PATIENT | GET | `/api/lab-orders/:id/result-document/download` | P0 | Smoke, Negative |
| TC-052 | Lab | DOCTOR acknowledges result | DOCTOR | POST | `/api/lab-orders/:id/acknowledge` | P0 | Smoke, Regression |
| TC-053 | Lab | PATIENT sees result after ack | PATIENT | GET | `/api/lab-orders/:id` | P0 | Smoke, Regression |
| TC-054 | Lab | Result immutable after ack | ADMIN | POST | `/api/lab-orders/:id/result` | P1 | Negative, Regression |
| TC-055 | Lab | PHARMACIST cannot list lab orders | PHARMACIST | GET | `/api/lab-orders` | P0 | Negative |
| TC-056 | Lab | Reject result then re-process | ADMIN/DOCTOR | PATCH/POST | `/api/lab-orders/:id/status` + result | P2 | Regression |
| TC-057 | Dependents | PATIENT adds dependent on own record | PATIENT | POST | `/api/patients/:id/dependents` | P2 | Regression |
| TC-058 | Emergency | Upsert emergency contact | ADMIN | PUT | `/api/patients/:id/emergency-contact` | P2 | Regression |
| TC-059 | Medical | Upsert medical profile | DOCTOR | PUT | `/api/patients/:id/medical-profile` | P2 | Regression |
| TC-060 | Auth | Change password while authenticated | Any | POST | `/api/auth/change-password` | P2 | Sanity |
| TC-061 | Auth | Logout contract returns success | Any | POST | `/api/auth/logout` | P2 | Sanity |
| TC-062 | Orders | Order create does not change medication stock | ADMIN | POST | `/api/orders` | P1 | Regression |
| TC-063 | Validation | Missing required body fields → 400 | ADMIN | POST | various | P1 | Negative |
| TC-064 | Auth | Invalid Bearer token → 401 | — | GET | `/api/patients` | P0 | Negative |

---

## Detailed scenarios (high priority)

### TC-001 — Login ADMIN

- **Preconditions:** Admin user exists (bootstrap script if needed).  
- **Request:** `{ "email": "...", "password": "...", "rememberMe": false }`  
- **Expected:** 200, `success: true`, `data.token` present, `data.user.role` = `ADMIN`.

### TC-002 — Health

- **Expected:** 200 with `status: "UP"` and `database: "CONNECTED"` when Postgres is reachable.

### TC-005 / TC-006 — Patient ownership

- **Preconditions:** Two patients; login as PATIENT linked to patient A.  
- **TC-005:** `GET /api/patients/{A}` → 200.  
- **TC-006:** `GET /api/patients/{B}` → 403.

### TC-010 / TC-011 — Appointment workflow

- **Preconditions:** `patientId`, ACTIVE `doctorId`, ADMIN token; then DOCTOR token.  
- **TC-010:** Create appointment → 201, status SCHEDULED.  
- **TC-011:** Valid status transition → 200 with new status.

### TC-016 → TC-022 — Prescription / refill / order chain

1. Create ACTIVE prescription (TC-016).  
2. Create REFILL request (TC-019).  
3. Approve (TC-021).  
4. Create order from approved request (TC-022) → request FULFILLED.

### TC-045 → TC-053 — Lab smoke chain

1. Create lab order.  
2. ADMIN: REQUESTED → SAMPLE_COLLECTED → PROCESSING.  
3. Upload result (multipart: `resultSummary`, `resultFlag`, optional `document`).  
4. PATIENT get detail → no result payload.  
5. Acknowledge.  
6. PATIENT get detail → result visible; download allowed.

### TC-035 / TC-036 — Audit RBAC

- ADMIN/VIEWER/SUPPORT → 200 on `GET /api/audit-events`.  
- PATIENT/DOCTOR/PHARMACIST → 403.

---

## Suite mapping (no duplicated cases)

### Smoke (minimal)

TC-001, TC-002, TC-003, TC-005, TC-006, TC-007, TC-010, TC-016, TC-030, TC-035, TC-036, TC-045, TC-049, TC-050, TC-051, TC-052, TC-053, TC-064

### Sanity (module-focused examples)

| After changing… | Run |
|-----------------|-----|
| Auth | TC-001, TC-043, TC-044, TC-060, TC-061, TC-064 |
| Patients / documents | TC-003–TC-006, TC-039–TC-041, TC-057–TC-059 |
| Appointments | TC-010–TC-015 |
| Prescriptions / refills | TC-016–TC-022 |
| Orders | TC-023–TC-026, TC-062 |
| Inventory | TC-027–TC-034 |
| Audit | TC-035–TC-038 |
| Labs | TC-045–TC-056 |

### Regression (broader)

All **P0** and **P1** cases in the catalog, plus critical P2 workflow cases (TC-056–TC-062) as time allows.

### Negative / security pack

TC-006, TC-007, TC-012, TC-013, TC-018, TC-020, TC-026, TC-029, TC-030, TC-032, TC-033, TC-036, TC-041, TC-044, TC-046, TC-048, TC-050, TC-051, TC-054, TC-055, TC-063, TC-064

---

## ID dependency examples

| Case | Prerequisites |
|------|----------------|
| TC-005 | TC-043 (or existing patient user) → login → use `patientId` |
| TC-010 | TC-001 + TC-004 + TC-008 → `patientId`, `doctorId` |
| TC-019 | TC-016 → `prescriptionId` |
| TC-022 | TC-019 + TC-021 → `refillRequestId` |
| TC-028 | TC-027 → `medicationId` |
| TC-034 | TC-031 + ADMIN approve → receive |
| TC-049 | TC-045 + TC-047 → `labOrderId` |
| TC-053 | TC-049 + TC-052 |

---

## Related docs

- [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) — how to run the API locally  
- [API_INVENTORY.md](./API_INVENTORY.md) — endpoint reference  
- [openapi.yaml](./openapi.yaml) — machine-readable contract  
