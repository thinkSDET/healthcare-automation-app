# Project Documentation

This folder is the **project manual** for HealthOps (Healthcare Operations Management System). It explains how the application is structured, what is implemented, how security and data work, and how to run it locally.

## Purpose

Use this documentation set to:

- Orient new developers to the repository
- Understand architecture, modules, database, auth/RBAC, and workflows
- Set up a local development environment
- Know where API reference material lives (without duplicating it here)

## Documentation map

| Location | Role |
|----------|------|
| [`README.md`](../README.md) | Project landing page — concise overview, stack, quick start, links |
| [`project-documentation/`](./) | Complete project manual (this folder) |
| [`docs/`](../docs/) | API-specific documentation |

### How the three layers relate

1. **Root README** — first impression and navigation.
2. **Project documentation** — product/system understanding from the **codebase**.
3. **API documentation (`docs/`)** — HTTP endpoint reference, testing guide, OpenAPI, and test cases.

API files are **secondary references**. The Express routes, controllers, services, and Prisma schema are authoritative when anything conflicts.

## Project scope (implemented)

HealthOps is a React SPA + Express REST API + PostgreSQL system covering:

- Authentication and account security
- Admin user management
- Patient records and related clinical profile data
- Doctor provider registry
- Appointments and patient appointment requests
- Prescriptions and refill/renewal requests
- Medication orders and payment status
- Pharmacist workspace
- Medication inventory and replenishment
- Lab test orders and results
- Operational audit events

It is designed for local development and standalone API/UI use. External email, real payment gateways, and real courier integrations are **not** implemented.

## What each file covers

| File | Contents |
|------|----------|
| [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) | This index |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Frontend/backend layers, middleware, request lifecycle, storage |
| [MODULES.md](./MODULES.md) | Functional modules, roles, pages, backend resources |
| [DATABASE.md](./DATABASE.md) | Prisma/PostgreSQL models, relationships, enums |
| [AUTH_RBAC.md](./AUTH_RBAC.md) | Login/JWT/password flows and role permissions |
| [WORKFLOWS.md](./WORKFLOWS.md) | End-to-end business workflows and state transitions |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Spoon-feeding local setup and troubleshooting |

## Where a new developer should start

1. Skim the root [README.md](../README.md).
2. Read this file for orientation.
3. Follow [SETUP_GUIDE.md](./SETUP_GUIDE.md) until health check and login work.
4. Read [ARCHITECTURE.md](./ARCHITECTURE.md) and [AUTH_RBAC.md](./AUTH_RBAC.md).
5. Use [MODULES.md](./MODULES.md) and [WORKFLOWS.md](./WORKFLOWS.md) while exploring features.
6. Use [DATABASE.md](./DATABASE.md) when changing or querying data.
7. Use [`docs/API_GUIDE_EntryPoint.md`](../docs/API_GUIDE_EntryPoint.md) for HTTP details.

## Recommended reading order

1. [`README.md`](../README.md)
2. [`PROJECT_DOCUMENTATION.md`](./PROJECT_DOCUMENTATION.md) (this file)
3. [`ARCHITECTURE.md`](./ARCHITECTURE.md)
4. [`MODULES.md`](./MODULES.md)
5. [`AUTH_RBAC.md`](./AUTH_RBAC.md)
6. [`DATABASE.md`](./DATABASE.md)
7. [`WORKFLOWS.md`](./WORKFLOWS.md)
8. [`SETUP_GUIDE.md`](./SETUP_GUIDE.md)
9. API documentation — start at [`docs/API_GUIDE_EntryPoint.md`](../docs/API_GUIDE_EntryPoint.md)

## API documentation references

Do not expect a full endpoint list in this folder. Use:

| Document | Purpose |
|----------|---------|
| [API_GUIDE_EntryPoint.md](../docs/API_GUIDE_EntryPoint.md) | API docs entry point |
| [API_INVENTORY.md](../docs/API_INVENTORY.md) | Complete endpoint inventory |
| [API_TESTING_GUIDE.md](../docs/API_TESTING_GUIDE.md) | Backend setup and calling APIs |
| [API_TEST_CASES.md](../docs/API_TEST_CASES.md) | Functional API test catalog |
| [openapi.yaml](../docs/openapi.yaml) | Machine-readable OpenAPI definition |

**`openapi.yaml` describes the API; it is not the running API.** The live API is `backend/src/server.ts` and its routes.

## Source of truth policy

| Topic | Primary source |
|-------|----------------|
| Features, modules, workflows | Application source code |
| Roles and route permissions | `backend/src/routes/**`, middleware, services |
| Data model | `backend/prisma/schema.prisma` |
| Run commands | `backend/package.json`, `frontend/package.json` |
| Env vars | Code that reads `process.env` |
| HTTP contract details | Code first; `docs/*` as supporting reference |

Status labels used in this manual:

- **IMPLEMENTED** — present and usable in code
- **PARTIALLY IMPLEMENTED** — present with intentional limits
- **KNOWN LIMITATION** — real gap or demo behavior in the current code
- **PLANNED / FUTURE** — only when explicitly documented elsewhere as future work (not asserted from roadmap alone)

## Repository layout (high level)

```text
healthcare-automation-app/
├── README.md
├── project-documentation/   ← you are here
├── docs/                    ← API documentation
├── frontend/                ← React + Vite SPA
└── backend/                 ← Express API + Prisma
    ├── prisma/
    └── src/
```
