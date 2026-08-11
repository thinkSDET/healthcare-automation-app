# HealthOps — AI Agent Instructions

This repository is a **Healthcare Operations Management System** (`frontend/` + `backend/`).

Before making changes, read this file, then the **applicable** rule files under `.cursor/rules/`, then the relevant project documents below. Inspect the existing implementation and prefer the smallest safe change.

## Rule files

| File | Purpose |
|------|---------|
| [`.cursor/rules/01-project-context.mdc`](.cursor/rules/01-project-context.mdc) | Project context and existing modules |
| [`.cursor/rules/02-development-rules.mdc`](.cursor/rules/02-development-rules.mdc) | Development and change-scope rules |
| [`.cursor/rules/03-product-roadmap.mdc`](.cursor/rules/03-product-roadmap.mdc) | Product roadmap governance |
| [`.cursor/rules/04-api-rules.mdc`](.cursor/rules/04-api-rules.mdc) | API design and compatibility rules |
| [`.cursor/rules/05-database-rules.mdc`](.cursor/rules/05-database-rules.mdc) | Prisma / database rules |
| [`.cursor/rules/06-rbac-rules.mdc`](.cursor/rules/06-rbac-rules.mdc) | Authentication and authorization rules |
| [`.cursor/rules/07-testing-verification.mdc`](.cursor/rules/07-testing-verification.mdc) | Verification and reporting rules |
| [`.cursor/rules/08-documentation-rules.mdc`](.cursor/rules/08-documentation-rules.mdc) | Documentation alignment rules |

## Project documents

| Document | Role |
|----------|------|
| [`docs/NEXT_PRODUCT_FEATURES.md`](docs/NEXT_PRODUCT_FEATURES.md) | Master Product Feature Roadmap |
| [`docs/API_INVENTORY.md`](docs/API_INVENTORY.md) | Existing API inventory |
| [`docs/API_TESTING_GUIDE.md`](docs/API_TESTING_GUIDE.md) | API setup and standalone API testing |
| [`docs/openapi.yaml`](docs/openapi.yaml) | OpenAPI / API reference |

Detailed rules live in `.cursor/rules/` — do not treat this file as a substitute for those rules.
