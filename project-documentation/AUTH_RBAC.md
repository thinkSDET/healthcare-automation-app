# Authentication & RBAC

This document describes **authentication and authorization as implemented** in HealthOps. Permissions are taken from route middleware and service/controller checks — not invented.

## Security principle

| Layer | Role |
|-------|------|
| Backend `authenticate` / `authorize` / ownership checks | **Security boundary** |
| Frontend `ProtectedRoute` / nav visibility | Convenience only — **not** security |

Always assume a client can call any API URL; the backend must reject unauthorized access.

---

## Authentication

### Mechanisms

| Feature | Implementation |
|---------|----------------|
| Password storage | bcrypt hash in `User.passwordHash` |
| Session token | JWT signed with `JWT_SECRET` (fallback `local-development-secret`) |
| Token payload | `userId`, `role`, `email` |
| Normal expiry | `1h` |
| Remember-me expiry | `30d` |
| Client storage | remember-me → `localStorage`; else `sessionStorage` |
| API usage | `Authorization: Bearer <token>` |

### Login (`POST /api/auth/login`)

1. Normalize email; load user
2. Ensure `AccountSecurity` row exists
3. Reject if temporary lock active, or user status INACTIVE/LOCKED
4. Verify password; on failure increment attempts; at **5** failures lock for **15** minutes
5. On success clear failures; issue JWT; include linked `patientId` when present

### Register (`POST /api/auth/register`)

- Allowed public roles: `PATIENT`, `DOCTOR`, `PHARMACIST` only (`ADMIN` forbidden here)
- Default role if omitted: `PATIENT`
- PATIENT requires date of birth, gender, phone; creates linked `Patient` with `medicalId` `PAT-#####`

### Forgot / reset password

- Forgot: does not reveal whether email exists; stores SHA-256 hashed token (15 minutes)
- **KNOWN LIMITATION:** raw token is logged to the server console and returned in the JSON response for development; no email service
- Reset: validates unused non-expired token, updates password, marks token used

### Change password

- `POST /api/auth/change-password` requires `authenticate`
- Validates current password and sets a new hash

### Logout

- `POST /api/auth/logout` requires auth and returns success
- JWT is stateless; frontend removes stored token/user (**IMPLEMENTED** contract + client clear)

### Authentication middleware

`authenticate` in `backend/src/middleware/auth.ts`:

- Missing/invalid Bearer token → **401**
- Valid token → `req.user = { userId, role, email }`

### Frontend session handling

- `AuthContext` restores user/token from storage, hydrates from opener window when needed (e.g. tracking tab)
- Client-side expiry check logs out when JWT `exp` passes
- `ProtectedRoute` redirects unauthenticated users to `/login`

---

## Authorization

### Role enum (`UserRole`)

`ADMIN` · `DOCTOR` · `PHARMACIST` · `PATIENT` · `SUPPORT` · `VIEWER`

### Route authorization helper

`authorize(...roles)` → **403** if authenticated but role not listed.

### Ownership checks

| Mechanism | Behavior |
|-----------|----------|
| `requirePatientAccess` | ADMIN/DOCTOR pass; PATIENT only if `Patient.userId === req.user.userId`; other roles 403 |
| Order/prescription controllers | PATIENT restricted to own `patientId` |
| Request services | Patients filtered to own requests; cancel often requester or ADMIN |

---

## Role summaries

### ADMIN

**Major areas:** users, patients, doctors, appointments (create/update/cancel), appointment requests, prescriptions, refill review + order create, orders, inventory, replenishment approve/receive, lab create/status/result upload/acknowledge, audit.

**Restrictions:** still subject to business rules (transitions, overlaps, etc.).

**Frontend:** broad clinical + inventory + audit navigation.

### DOCTOR

**Major areas:** patients (not hard delete), appointments (view + allowed status transitions; not create/cancel-delete), appointment request review, prescriptions, refill approve/reject (not create), lab orders (create/status/acknowledge; not result upload), doctor list.

**Restrictions:** cannot access inventory APIs; cannot cancel appointments via DELETE route; cannot upload lab results; cannot manage users.

**Frontend:** clinical navigation without inventory (unless also admin).

### PHARMACIST

**Major areas:** pharmacy workspace, prescriptions (read + status), refill create (REFILL only) + approve REFILL, orders (read + status/payment), inventory, replenishment create/cancel own / receive path per service rules.

**Restrictions:** cannot approve RENEWAL; cannot create RENEWAL; no patient list admin UI; no lab module routes typically.

**Frontend:** `/pharmacy`, inventory, replenish, refills.

### PATIENT

**Major areas:** own profile (via patient access), own appointments history, appointment requests, prescriptions/refills, orders/payment, lab orders (results after acknowledge).

**Restrictions:** cannot access other patients’ data; payment status limited to PAID/FAILED on own orders; many staff write APIs forbidden.

**Frontend:** `/my/*` portal routes.

### SUPPORT / VIEWER

**Major areas:** `GET /api/audit-events` and `/audit-logs` UI.

**Restrictions:** most clinical/pharmacy APIs do not authorize these roles. Presence in the enum does **not** grant general access.

---

## Frontend vs backend matrix (illustrative)

| Capability | Frontend gate | Backend gate |
|------------|---------------|--------------|
| Open `/patients` | ADMIN, DOCTOR | Patient list API ADMIN/DOCTOR |
| Open `/pharmacy` | PHARMACIST | Order/Rx APIs with pharmacist roles |
| Open `/audit-logs` | ADMIN, VIEWER, SUPPORT | Audit API same roles |
| Open `/my/orders` | PATIENT | Order APIs + ownership |

If frontend allowed a page incorrectly, backend must still reject.

---

## Admin bootstrap

Script: `backend/src/scripts/create-admin.ts`

- Env overrides: `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- Defaults exist for local development (see [SETUP_GUIDE.md](./SETUP_GUIDE.md))
- Creates or updates an ACTIVE ADMIN user

Public registration cannot create ADMIN.

---

## Related documents

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [MODULES.md](./MODULES.md)
- [WORKFLOWS.md](./WORKFLOWS.md)
- [docs/API_INVENTORY.md](../docs/API_INVENTORY.md) — per-endpoint roles
