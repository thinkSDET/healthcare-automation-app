# HealthOps API Documentation

This folder contains the **API documentation set** for the Healthcare Operations Management System backend.

It is written for developers and QA engineers who need to understand, call, or test the HTTP API.

---

## What is this documentation set?

| Document | Purpose |
|----------|---------|
| [API_INVENTORY.md](./API_INVENTORY.md) | Complete API reference: every endpoint, roles, ownership, and quick lookups by HTTP method and by resource |
| [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) | Step-by-step local setup and how to call APIs with Postman (or any HTTP client) |
| [API_TEST_CASES.md](./API_TEST_CASES.md) | Functional API test-case catalog plus Smoke / Sanity / Regression suite mapping |
| [openapi.yaml](./openapi.yaml) | Machine-readable OpenAPI 3 description of the same API |
| [NEXT_PRODUCT_FEATURES.md](./NEXT_PRODUCT_FEATURES.md) | Product roadmap (not an API reference) |

### About `openapi.yaml`

**`openapi.yaml` is NOT the API itself.**

It is a structured **description / contract** of the API. Tools such as Swagger UI, Postman import, or Redoc can read it to display or exercise endpoints. The live API is the Express server in `backend/`.

If OpenAPI and running code ever disagree, **the backend code is the source of truth**.

---

## Recommended reading order

1. **README** (this file) — orientation  
2. **[API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)** — get the backend running and make your first authenticated call  
3. **[API_INVENTORY.md](./API_INVENTORY.md)** — look up any endpoint, roles, and ownership rules  
4. **[API_TEST_CASES.md](./API_TEST_CASES.md)** — pick Smoke / Sanity / Regression scenarios to execute  
5. **[openapi.yaml](./openapi.yaml)** — import into an OpenAPI/Swagger viewer or codegen tool  

---

## Quick facts

| Item | Value |
|------|--------|
| Base URL (local) | `http://localhost:4000` |
| Auth | Bearer JWT (`Authorization: Bearer <token>`) |
| Health check | `GET /api/health` (no auth) |
| Endpoint count (code) | **80** |

---

## Source of truth

Documentation in this folder is reconciled against:

- `backend/src/server.ts`
- `backend/src/routes/**`
- Controllers, services, validators, and middleware under `backend/src/`
- `backend/prisma/schema.prisma` (roles and domain models)

Do not treat older copies of these docs as authoritative without checking the code.
