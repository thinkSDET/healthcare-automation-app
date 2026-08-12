# HealthOps

Healthcare Operations Management System — a full-stack web application for managing patients, providers, appointments, prescriptions, pharmacy orders, inventory, lab orders, and operational audit activity.

## Project Overview

HealthOps helps clinical and operational staff run day-to-day healthcare workflows in one place. Patients use a portal for profile, appointments, prescriptions, lab results, orders, and payments. Staff roles (admin, doctor, pharmacist, and limited support/viewer access) work through role-specific workspaces backed by a secured REST API and PostgreSQL.

**Who uses it**

| Audience | Typical use |
|----------|-------------|
| Administrators | Users, patients, doctors, scheduling, inventory, lab results upload, audit |
| Doctors | Patient records, appointments, prescriptions, refill/appointment review, lab orders |
| Pharmacists | Pharmacy lookup, order/prescription status, inventory, replenishment, refill review |
| Patients | Profile, appointment requests, prescriptions/refills, orders/payment, lab results |
| Support / Viewer | Audit log review (limited surface) |

## Key Capabilities

| Module | Capability | Status |
|--------|------------|--------|
| Auth & security | Register, login, JWT, remember-me, password reset/change, account lockout | Implemented |
| User management | Admin CRUD for staff/system users | Implemented |
| Patients | Records, deactivate, dependents, emergency contact, documents, medical profile | Implemented |
| Doctors | Provider registry with status (including ON_LEAVE) | Implemented |
| Appointments | Admin create; status lifecycle with overlap checks | Implemented |
| Appointment requests | Patient submit; staff approve/reject (creates appointment on approve) | Implemented |
| Prescriptions | Create with items; ACTIVE / COMPLETED / CANCELLED | Implemented |
| Refill / renewal | Request, review, fulfill via linked order | Implemented |
| Orders & payments | Order lifecycle; payment status (patient can mark paid/failed) | Implemented |
| Pharmacy workspace | Lookup patient prescriptions/orders; update statuses | Implemented |
| Inventory | Medications, stock adjust, stock movements | Implemented |
| Replenishment | Request → approve/reject → receive stock | Implemented |
| Lab orders | Order lifecycle, result upload, acknowledge, patient visibility gate | Implemented |
| Audit | Append-only audit events; filtered listing | Implemented |

## High-Level Architecture

```text
Browser (React SPA)
        ↓
   REST API (HTTP / JSON)
        ↓
Backend (Express)
        ↓
Routes → AuthZ middleware → Controllers → Validators → Services
        ↓
Prisma ORM (+ PostgreSQL driver adapter)
        ↓
PostgreSQL
```

Local file uploads (patient documents / lab result files) are stored under the backend process working directory (`uploads/patient-documents`).

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, React Router 7, Vite 8, TypeScript, Axios |
| Backend | Node.js, Express 5, TypeScript (`tsx` in development) |
| Validation | Zod |
| Auth | JWT (`jsonwebtoken`), bcrypt password hashing |
| ORM | Prisma 7 with `@prisma/adapter-pg` |
| Database | PostgreSQL (`pg`) |
| Uploads | Multer (disk storage) |

Versions above reflect dependencies declared in `frontend/package.json` and `backend/package.json`. There is no `engines` field; local development has been used successfully with current Node 24.x / npm 11.x.

## Quick Start

**Prerequisites:** Node.js + npm, PostgreSQL, Git.

```bash
# Backend
cd backend
npm install
# Create backend/.env with DATABASE_URL (required). See SETUP_GUIDE.
npx prisma migrate deploy
npx prisma generate
npm run dev
# → http://localhost:4000

# Frontend (second terminal)
cd frontend
npm install
npm run dev
# → Vite default (usually http://localhost:5173)
```

Optional admin bootstrap (from `backend/`):

```bash
npx tsx src/scripts/create-admin.ts
```

Full instructions: **[project-documentation/SETUP_GUIDE.md](project-documentation/SETUP_GUIDE.md)**

## Roles

| Role | Summary (from route authorization) |
|------|-------------------------------------|
| `ADMIN` | Full operational access across users, clinical, pharmacy, inventory, lab upload, audit |
| `DOCTOR` | Patients, appointments, prescriptions, requests, lab orders (not inventory admin UI) |
| `PHARMACIST` | Pharmacy, prescriptions/orders updates, inventory, replenishment, refill review |
| `PATIENT` | Own patient record and portal workflows (ownership enforced on backend) |
| `SUPPORT` / `VIEWER` | Audit event listing (and matching frontend audit page) |

Backend `authenticate` / `authorize` / ownership checks are the security boundary. Frontend route guards only control UI visibility.

## Documentation

| Document | Description |
|----------|-------------|
| [PROJECT_DOCUMENTATION.md](project-documentation/PROJECT_DOCUMENTATION.md) | Documentation index and reading order |
| [ARCHITECTURE.md](project-documentation/ARCHITECTURE.md) | System architecture and request lifecycle |
| [MODULES.md](project-documentation/MODULES.md) | Functional modules |
| [DATABASE.md](project-documentation/DATABASE.md) | Data model overview |
| [AUTH_RBAC.md](project-documentation/AUTH_RBAC.md) | Authentication and authorization |
| [WORKFLOWS.md](project-documentation/WORKFLOWS.md) | End-to-end business workflows |
| [SETUP_GUIDE.md](project-documentation/SETUP_GUIDE.md) | Complete local setup |

## API Documentation

API details live under `docs/` (not duplicated here):

| Document | Description |
|----------|-------------|
| [API_GUIDE_EntryPoint.md](docs/API_GUIDE_EntryPoint.md) | API docs entry point |
| [API_INVENTORY.md](docs/API_INVENTORY.md) | Endpoint inventory |
| [API_TESTING_GUIDE.md](docs/API_TESTING_GUIDE.md) | API setup and testing |
| [API_TEST_CASES.md](docs/API_TEST_CASES.md) | Functional API test cases |
| [openapi.yaml](docs/openapi.yaml) | OpenAPI 3 definition |

If API docs and code disagree, **the backend implementation wins**.

## Current Status

HealthOps is an implemented local full-stack application covering auth, clinical operations, pharmacy/inventory, lab orders, and audit. Payments and shipment tracking are application-managed demos (status/UI), not external payment or carrier integrations. Password reset is development-oriented (token logged / returned; no email delivery service). Doctor **registry** records are separate from `User` accounts with role `DOCTOR`.
