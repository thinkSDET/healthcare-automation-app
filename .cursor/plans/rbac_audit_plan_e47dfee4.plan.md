---
name: RBAC Audit Plan
overview: Approved RBAC target decisions with a strict six-step baby-step implementation plan. Align FE routes/actions with existing BE authorize/requirePatientAccess; add Patient/Pharmacist portals using existing APIs only; fix PATIENT order ownership. No code execution in this planning update.
todos:
  - id: step1-dashboard
    content: "STEP 1: Role-specific Dashboard/navigation"
    status: completed
  - id: step2-routes
    content: "STEP 2: Frontend route protection/alignment"
    status: pending
  - id: step3-actions
    content: "STEP 3: Frontend action permissions"
    status: pending
  - id: step4-backend
    content: "STEP 4: Backend ownership/security gaps (+ patientId for portal)"
    status: pending
  - id: step5-portals
    content: "STEP 5: Patient/Pharmacist portal functionality using existing APIs"
    status: pending
  - id: step6-verify
    content: "STEP 6: Full four-role verification"
    status: pending
isProject: false
---

# RBAC Implementation Plan (Updated — Decisions Locked)

**Status:** Audit approved. Target decisions locked. **No implementation yet.**

**Baseline:** Keep existing backend `authorize` / `requirePatientAccess` wherever possible. Make FE visibility, routes, and actions consistent with BE. Change BE only for security gaps required by the target model.

---

## Locked target decisions

| Role | Target |
|---|---|
| **ADMIN** | Full administration of existing admin functionality |
| **DOCTOR** | View patients + details/sub-resources; view appointments; prescriptions per existing BE; **no** appointment write; **no** Doctor write; **no** Orders; hide FE actions BE would reject |
| **PATIENT** | Own patient record + own dependents/emergency/medical/documents per BE; view own appointments; view/create/manage own Orders per BE; **no** global patient list; **no** other patients; **no** booking; **no** document upload/delete |
| **PHARMACIST** | **No** patient list/CRUD; pharmacy workflow on Prescriptions + Orders via **existing** APIs; no new patient APIs |
| **SUPPORT / VIEWER** | Out of scope now |
| **Doctor↔Doctor link** | Do not implement now |
| **Patient self-booking** | Disabled |
| **Patient document upload** | ADMIN/DOCTOR only |

---

## Approved target matrix (summary)

| Module | ADMIN | DOCTOR | PATIENT | PHARMACIST |
|---|---|---|---|---|
| Dashboard | Full ops cards | Clinical (Patients, Doctors read, Appointments, Prescriptions entry) | Own portal cards | Pharmacy cards (Prescriptions/Orders) |
| Patients list/create/deactivate | Y | Y | N | N |
| Patient details + sub-resources | Any | Any | Own | N |
| Documents upload/delete | Y | Y | N | N |
| Documents list/download | Any | Any | Own | N |
| Doctors read | Y | Y | N | N |
| Doctors write | Y | N | N | N |
| Appointments read | Y | Y | Own (via own history API) | N |
| Appointments create/update/cancel | Y | N | N | N |
| Prescriptions | Per BE (full write) | Per BE (create/status/delete) | N (no FE portal for Rx now unless later) | Read + status (existing BE) |
| Orders | Per BE | **N** | Own create/view/manage per BE + ownership fix | Read + status/payment (existing BE) |

---

## STEP 1 — Role-specific Dashboard/navigation

**Goal:** Each role only sees cards that lead to reachable destinations (or destinations that will exist after STEP 2/5). Fix misleading copy. Do not build portals yet—cards may temporarily point only to routes that already exist for ADMIN/DOCTOR; PATIENT/PHARMACIST cards that need new routes are prepared in copy/structure but can wait until STEP 2 routes exist, **or** STEP 1 only removes broken cards and STEP 5 adds portal cards. **Preferred:** STEP 1 removes broken cards and updates welcome text; portal cards added in STEP 5 when routes exist (avoids broken links mid-sequence).

**Exact files**
- [`frontend/src/pages/Dashboard.tsx`](frontend/src/pages/Dashboard.tsx)

**Exact changes**
- **ADMIN:** Keep Patients, Doctors, Appointments cards; welcome = full ops.
- **DOCTOR:** Keep Patients, Doctors, Appointments; welcome = clinical view (not “manage doctors” as write); **no** Orders card.
- **PATIENT:** Remove broken Appointments → `/appointments` card for now (or replace with non-navigating placeholder until STEP 5). Welcome = own healthcare access coming / account only.
- **PHARMACIST:** Remove broken Patients card. Welcome = pharmacy workflows (routes in STEP 5).
- Optional low-risk: Change Password link for all authenticated roles (discoverability only).

**Roles affected:** All four.

**Dependencies:** None (can ship alone).

**Risk:** Low. Temporary PATIENT/PHARMACIST dashboards may look sparse until STEP 5.

---

## STEP 2 — Frontend route protection/alignment

**Goal:** `App.tsx` `allowedRoles` match target. Remove Doctor from Orders routes. Keep appointment create ADMIN-only. Do not add full portals yet—only realign existing route guards so Doctor cannot open Orders URLs.

**Exact files**
- [`frontend/src/App.tsx`](frontend/src/App.tsx)
- [`frontend/src/pages/ProtectedRoute.tsx`](frontend/src/pages/ProtectedRoute.tsx) — no behavior change unless needed for clarity (keep redirect-to-dashboard)

**Exact changes**
- Move `/patients/:id/orders` (and any orders-only nesting) off the ADMIN+DOCTOR group → **ADMIN only** for now (PHARMACIST orders UI arrives in STEP 5 with its own routes).
- Keep `/patients`, `/patients/:id`, prescriptions, doctors, appointments list/details on ADMIN+DOCTOR.
- Keep `/appointments/new` ADMIN only.
- Do **not** yet open PATIENT/PHARMACIST module routes (STEP 5).

**Roles affected:** DOCTOR (loses Orders URL), ADMIN (unchanged access), PATIENT/PHARMACIST (still no new routes).

**Dependencies:** STEP 1 preferred first so Doctor is not steered to Orders from Dashboard.

**Risk:** Low–Medium. Doctor History “Orders” card on PatientDetails still navigates to orders until STEP 3.

---

## STEP 3 — Frontend action permissions

**Goal:** Hide FE actions that BE rejects for the current role.

**Exact files**
- [`frontend/src/pages/Doctors.tsx`](frontend/src/pages/Doctors.tsx)
- [`frontend/src/pages/PatientDetails.tsx`](frontend/src/pages/PatientDetails.tsx)
- [`frontend/src/pages/PatientOrders.tsx`](frontend/src/pages/PatientOrders.tsx) — only if still reachable by wrong roles; primarily ADMIN after STEP 2
- [`frontend/src/pages/Appointments.tsx`](frontend/src/pages/Appointments.tsx) / [`AppointmentDetails.tsx`](frontend/src/pages/AppointmentDetails.tsx) — confirm New/edit/cancel remain ADMIN-only (already largely true)
- [`frontend/src/pages/PatientPrescriptions.tsx`](frontend/src/pages/PatientPrescriptions.tsx) — keep Doctor create/delete; pharmacist UI flags already exist for later

**Exact changes**
- **Doctors.tsx:** Gate Edit / Activate-Deactivate / Delete behind `isAdmin` (Add already gated). Doctor retains View + Availability (client-only).
- **PatientDetails.tsx:** Hide History **Orders** card for DOCTOR (ADMIN keeps it). Leave Prescriptions/Appointments/Documents as today for ADMIN/DOCTOR.
- **PatientDetails documents:** Ensure upload/delete UI remains ADMIN/DOCTOR only (page already ADMIN+DOCTOR-only until Patient portal).
- **Appointments:** No Doctor create/update/cancel controls (verify; already ADMIN-gated for New).
- **PatientOrders.tsx:** After STEP 2, only ADMIN on this path; ensure create/status/payment actions match ADMIN (+ later PHARMACIST in STEP 5). Remove any Doctor-oriented assumptions.

**Roles affected:** DOCTOR (primary), ADMIN.

**Dependencies:** STEP 2 for Orders route alignment.

**Risk:** Low.

---

## STEP 4 — Backend ownership/security gaps

**Goal:** Close IDOR on PATIENT order create; enable Patient portal to resolve own `patientId` without inventing patient-list APIs. Do not change Doctor/Pharmacist authorize matrices except as required for ownership.

**Exact files**
- [`backend/src/controllers/order.controller.ts`](backend/src/controllers/order.controller.ts)
- [`backend/src/services/order.service.ts`](backend/src/services/order.service.ts) (if ownership helper fits better here)
- [`backend/src/middleware/auth.ts`](backend/src/middleware/auth.ts) — use `AuthRequest` on order create if needed
- [`backend/src/services/auth.service.ts`](backend/src/services/auth.service.ts) and/or auth controller — include linked `patientId` on login (and optionally register) response when `Patient.userId` matches
- [`frontend/src/context/AuthContext.tsx`](frontend/src/context/AuthContext.tsx) / Login handling — store optional `patientId` on user object for STEP 5

**Exact changes**
1. **Order create ownership:** If `req.user.role === PATIENT`, resolve their Patient by `userId`; require `body.patientId === ownPatient.id` (or force body patientId to own). Reject otherwise with 403.
2. **Order read path for PATIENT (if used in STEP 5):** When listing/getting orders as PATIENT, ensure only own patient’s orders (may require authorize adjustment or ownership checks on get-by-patient — today PATIENT is not on order GET authorize; STEP 5 may use ADMIN/PATIENT create + need PATIENT read). **Align with existing BE:** currently order GET is `ADMIN, PHARMACIST` only. Target says PATIENT can view own orders — **this requires a minimal BE authorize extension** to allow PATIENT on `GET /orders/patient/:patientId` and/or `GET /orders/:id` **with ownership checks**. Document as intentional small BE change in STEP 4, not a new resource API.
3. **Login/`patientId`:** Return `patientId` when linked so FE portal can call existing `/api/patients/:id/*` without a patient list.

**Roles affected:** PATIENT (security + portal prerequisite); ADMIN/PHARMACIST unchanged for pharmacy paths.

**Dependencies:** None blocking; should complete before STEP 5 Patient Orders UI.

**Risk:** Medium (authz behavior change). Keep changes narrowly scoped to ownership + PATIENT read-own-orders.

**Out of scope here:** Doctor↔Doctor linking; SUPPORT/VIEWER; schema migrations; new patient search APIs.

---

## STEP 5 — Patient / Pharmacist portal functionality (existing APIs)

**Goal:** Useful portals without inventing patient CRUD/list APIs.

### 5A — Patient portal

**Exact files (expected)**
- [`frontend/src/App.tsx`](frontend/src/App.tsx) — PATIENT-only routes
- New thin pages under `frontend/src/pages/` (e.g. `MyPatient.tsx` or reuse `PatientDetails` in patient mode), `MyAppointments.tsx`, `MyOrders.tsx` — **minimal**, reuse patterns from existing pages
- [`frontend/src/pages/Dashboard.tsx`](frontend/src/pages/Dashboard.tsx) — add Patient cards: My Profile, My Appointments, My Orders
- Possibly adapt [`PatientDetails.tsx`](frontend/src/pages/PatientDetails.tsx) behind PATIENT route with `id` from auth `patientId` (hide ADMIN-only actions: deactivate, document upload/delete, orders history that goes to admin paths)

**Exact changes**
- Routes e.g. `/my/profile`, `/my/appointments`, `/my/orders` (names flexible) allowedRoles `PATIENT`.
- Profile: `GET/PUT /api/patients/:id` + dependents/emergency/medical/documents list+download using existing endpoints; **no** upload/delete document UI.
- Appointments: `GET /api/patients/:id/appointments` only (no booking).
- Orders: create/list/manage via existing order APIs after STEP 4 ownership + PATIENT read-own.
- Guard: if no `patientId` on user, show clear empty/error (unlinked account).

**Roles affected:** PATIENT.

**Dependencies:** STEP 4 (`patientId` on login + order ownership/read-own).

**Risk:** Medium. Prefer reuse over cloning full Admin PatientDetails.

### 5B — Pharmacist portal

**Exact files (expected)**
- [`frontend/src/App.tsx`](frontend/src/App.tsx) — PHARMACIST routes
- New pages e.g. `PharmacyPrescriptions.tsx`, `PharmacyOrders.tsx` (or one Pharmacy hub)
- [`frontend/src/pages/Dashboard.tsx`](frontend/src/pages/Dashboard.tsx) — Prescriptions / Orders cards
- Optionally reuse logic from [`PatientPrescriptions.tsx`](frontend/src/pages/PatientPrescriptions.tsx) / [`PatientOrders.tsx`](frontend/src/pages/PatientOrders.tsx) with pharmacist mode (`isPharmacist` already partially present)

**Exact changes**
- **No** `/patients` list access.
- Workflow: pharmacist enters **patientId** (or order/prescription id) → call existing:
  - `GET/PATCH` `/api/prescriptions/patient/:patientId`, `/api/prescriptions/:id`, status
  - `GET/PATCH` `/api/orders/patient/:patientId`, `/api/orders/:id`, status/payment
- Hide create/delete prescription and create/delete order actions for pharmacist (match BE).
- Do not call patient CRUD or `requirePatientAccess` patient routes.

**Roles affected:** PHARMACIST.

**Dependencies:** STEP 1–2 done; STEP 3 pharmacist flags helpful; no Doctor↔Doctor link needed.

**Risk:** Medium. UX depends on knowing a patientId (acceptable for QA app without new patient APIs).

---

## STEP 6 — Full four-role verification

**Goal:** Prove FE and BE consistency for ADMIN, DOCTOR, PATIENT, PHARMACIST.

**Exact files:** None required (manual + optional checklist doc only if asked). No schema/package changes.

**Exact checks**
- [ ] ADMIN: patients/doctors/appointments/prescriptions/orders; book appointments; doctor write; document upload
- [ ] DOCTOR: patients/details/sub-resources/prescriptions/appointments view; cannot new appointment URL; cannot doctor edit; cannot orders URL/actions; no 403 from visible buttons
- [ ] PATIENT: dashboard → my portal only; own profile/sub-resources; own appointments view; own orders create/view; cannot `/patients` list; cannot other patient ids; cannot book; cannot document upload/delete
- [ ] PHARMACIST: no patient list; can load prescriptions/orders by patientId; status updates work; create/delete hidden and API 403 if forced
- [ ] Direct URL negatives redirect to `/dashboard` for disallowed routes
- [ ] SUPPORT/VIEWER untouched / not newly featured

**Roles affected:** All four.

**Dependencies:** STEPS 1–5 complete.

**Risk:** Low (verification only).

---

## Implementation order (strict)

1. STEP 1 — Dashboard/navigation  
2. STEP 2 — Route protection/alignment  
3. STEP 3 — Frontend action permissions  
4. STEP 4 — Backend ownership + patientId for portal  
5. STEP 5 — Patient + Pharmacist portals (existing APIs)  
6. STEP 6 — Four-role verification  

**Do not combine steps.** After each step: run relevant FE/BE checks, report files changed, stop for approval before the next step.

---

## Explicit non-goals (this RBAC track)

- Doctor User ↔ Doctor record linking  
- Patient self-booking  
- Patient document upload/delete  
- Pharmacist patient list/CRUD or new patient APIs  
- SUPPORT/VIEWER feature work  
- Prisma schema/migrations unless an unavoidable ownership bug requires it (not expected)  
- Unrelated Phase 2+ workflow engines  

---

## Residual notes (not blocking)

- Admin Users UI / user.validator PATIENT enum: out of this RBAC baby-step sequence unless later approved.  
- Change Password dashboard link: optional in STEP 1.  
- Pharmacist must know a `patientId` to use pharmacy APIs without a patient directory — accepted under “no new patient APIs.”
