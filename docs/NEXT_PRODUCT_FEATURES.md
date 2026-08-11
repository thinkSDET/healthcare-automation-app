---
name: Next Product Features Doc
overview: "Documentation-only: create docs/NEXT_PRODUCT_FEATURES.md as the MASTER PRODUCT FEATURE ROADMAP for the next development phases (7 prioritized capabilities, additive-only, no app/API/schema changes)."
todos:
  - id: draft-current-capability
    content: "Write §1 Current Product Capability + already-implemented anti-duplication from schema/API/UI"
    status: pending
  - id: draft-seven-features
    content: "Write §2–3 Master Roadmap + full 19-field specs for all 7 features in final priority order"
    status: pending
  - id: draft-refill-detail
    content: "Write expanded #1 Prescription Refill/Renewal functional specification (refill vs renewal, decision points)"
    status: pending
  - id: draft-deps-strategy
    content: "Write Dependencies matrix, incremental Implementation Strategy, Safety Principle, Out of Scope"
    status: pending
  - id: draft-compare-top3-phases
    content: "Write Comparison Table, Top 3 rationale, Master Implementation Order PHASE A–G"
    status: pending
  - id: write-doc-only
    content: "Create ONLY docs/NEXT_PRODUCT_FEATURES.md; report confirmations; STOP"
    status: pending
isProject: false
---

# Master Product Feature Roadmap — Documentation Plan

## Deliverable (execution when approved)

Create **only** [docs/NEXT_PRODUCT_FEATURES.md](docs/NEXT_PRODUCT_FEATURES.md).

- Do **not** modify application code, APIs, Prisma/schema, migrations, or other files.
- File does not exist yet; create it as the master roadmap.
- After write: report exact file changed + confirmations; **STOP**.

## Product principle (must appear in doc)

All roadmap features are genuine healthcare operations business capabilities. Not for UI testing, automation practice, browser testing, artificial scenarios, cosmetic UI, or duplicate CRUD. Testing value must arise naturally from business workflows.

## Evidence base (do not invent existing APIs/fields)

| Source | Role |
|--------|------|
| [backend/prisma/schema.prisma](backend/prisma/schema.prisma) | Models/enums only: User, Patient*, Doctor, Appointment, Prescription*, Order*, auth security |
| [docs/API_INVENTORY.md](docs/API_INVENTORY.md) | ~53 existing endpoints |
| Appointment status machine | [backend/src/services/appointment.service.ts](backend/src/services/appointment.service.ts) |
| UI roles/routes | [frontend/src/App.tsx](frontend/src/App.tsx), AppHeader; patient appointments view-only (“Booking is not available”) |

Label anything not in schema/API inventory as **PROPOSED**.

---

## Document outline (exact structure to write)

### 1. Current Product Capability
Summarize what HealthOps already supports (auth, users, patients+extensions, doctors, appointments lifecycle, prescriptions, orders/payments, pharmacy workspace, patient portal). Explicit “already vs new” so future work does not duplicate.

### 2. Already Implemented (Do Not Duplicate)
Bullet list of existing capabilities including: JWT RBAC; unused SUPPORT/VIEWER roles in enum only; appointment overlap + transitions; Rx ACTIVE/COMPLETED/CANCELLED; order status + payment status; document type label “Insurance” ≠ claims.

### 3. Master Feature Roadmap
Final priority order (fixed):

1. Prescription Refill / Renewal Requests  
2. Patient Appointment Request & Staff Scheduling Approval  
3. Specialist Referral Management  
4. Appointment Cancellation Waitlist  
5. Clinical / Operational Audit Trail  
6. Pharmacy Medication Inventory & Replenishment  
7. Lab Test Order & Result Acknowledgment  

### 4. Feature Specifications (each of 7 — 19 fields)
For every feature document:

1. Feature name  
2. Business purpose  
3. Problem it solves  
4. Existing module(s) it extends  
5. Complete business workflow  
6. Roles involved  
7. Role responsibilities  
8. Business rules  
9. States/statuses (**PROPOSED** where new)  
10. State transitions (**PROPOSED**)  
11. Existing APIs/data that can be reused (real only)  
12. New APIs potentially required (**PROPOSED**)  
13. Database/schema changes potentially required (**PROPOSED**)  
14. Dependencies on other roadmap features (DIRECT / OPTIONAL / INDEPENDENT)  
15. Important edge cases  
16. Existing functionality that must remain unchanged  
17. Complexity (Low / Medium / High)  
18. Business value  
19. Why this is genuinely new  

### 5. Prescription Refill / Renewal — detailed #1 section
Separate **REFILL** vs **RENEWAL**. High-level flow:

```
PATIENT → Active Prescription → Request Refill/Renewal → Submitted
→ Doctor/Pharmacist Review → Approved/Rejected
→ If Approved → (PROPOSED link to) Existing Order Workflow → Pharmacy Processing → Completed/Delivered
```

Business decisions to call out explicitly:
- Who may request (patient vs pharmacist)
- When refill vs renewal is required
- Who may approve (doctor vs pharmacist rules)
- Whether approval **automatically** creates an Order — mark as **PROPOSED**; do not assume unless product chooses it; prefer manual/optional order creation reusing `POST /api/orders`
- Existing Rx status machine stays; new request entity is additive

### 6. Dependencies section
Matrix for all seven with labels:
- **DIRECT DEPENDENCY**
- **OPTIONAL INTEGRATION**
- **INDEPENDENT FEATURE**

Examples to include:
- Refill → Prescription + Pharmacy + Order (direct existing modules)
- Appointment Request → Appointment lifecycle (direct)
- Waitlist → Appointment lifecycle (direct); Appointment Request (optional/direct as designed)
- Referral → Patients/Doctors (direct); Appointments (optional)
- Inventory → Pharmacy + Orders (direct)
- Audit → eventually all modules (optional progressive coverage; can start independent)
- Lab → Documents optional reuse; Patients/Doctors direct

### 7. Implementation Strategy (strict incremental)
For **every** feature, process:

1. Inspect existing implementation  
2. Produce detailed implementation plan  
3. User approval  
4. Implement **only** that feature  
5. Run relevant checks  
6. Manual verification  
7. Report files/API/schema changes  
8. Stop and wait for approval  

Never implement multiple roadmap features together.

### 8. Safety Principle
All features **ADDITIVE**. Do not rewrite appointment lifecycle, remove APIs, change RBAC unnecessarily, break order/payment/portal, broad refactor, or unnecessary migrations. Prefer new workflow around existing behavior.

### 9. Comparison Table

| Priority | Feature | Business Value | Complexity | Existing Modules Reused | New APIs | DB Changes | Dependencies |

Complexity: Low / Medium / High. APIs/DB: Existing / New / Potential / None as appropriate.

### 10. Top 3
1. Prescription Refill / Renewal  
2. Patient Appointment Request & Staff Approval  
3. Specialist Referral Management  

Explain strongest combo of business value, new capability, reuse, workflow richness, effort, minimal disruption.

### 11. Master Implementation Order (do not implement now)

- **PHASE A** — Prescription Refill / Renewal  
- **PHASE B** — Patient Appointment Request & Staff Scheduling Approval  
- **PHASE C** — Specialist Referral Management  
- **PHASE D** — Appointment Cancellation Waitlist  
- **PHASE E** — Clinical / Operational Audit Trail  
- **PHASE F** — Pharmacy Medication Inventory & Replenishment  
- **PHASE G** — Lab Test Order & Result Acknowledgment  

### 12. Out of Scope
Generic UI dashboards; testing-only features; artificial browser scenarios; duplicate CRUD; generic notifications without business trigger; billing/claims without deliberate domain expansion; unnecessary external integrations.

---

## Feature sketch content (for accurate doc drafting)

### Feature 1 — Prescription Refill / Renewal Requests
- **Existing today:** `Prescription` + `PrescriptionItem`; statuses ACTIVE/COMPLETED/CANCELLED; create/status/delete APIs; pharmacy can patch Rx status; orders independent free-text items; **no** refill count, request entity, or Rx↔Order FK.
- **PROPOSED:** `RefillRequest` (or similar) with SUBMITTED/APPROVED/REJECTED/CANCELLED/FULFILLED; type REFILL|RENEWAL; review by DOCTOR (renewal) / PHARMACIST±DOCTOR (refill) per rules; optional order creation after approval.
- Complexity: **Medium**. Business value: **High**.

### Feature 2 — Patient Appointment Request & Staff Scheduling Approval
- **Existing today:** ADMIN-only `POST /api/appointments`; patient GET history only; status machine SCHEDULED→…→COMPLETED/CANCELLED/NO_SHOW; overlap checks.
- **PROPOSED:** `AppointmentRequest` queue; SUPPORT/ADMIN approve → create Appointment via existing create logic; deny/propose alternate.
- Complexity: **Medium**. Value: **High**.

### Feature 3 — Specialist Referral Management
- **Existing today:** Doctors + Patients; no referral model.
- **PROPOSED:** `Referral` with referring/receiving doctor, specialty, statuses (REQUESTED→ACCEPTED→SCHEDULED→COMPLETED/DECLINED/CANCELLED); optional appointment link.
- Complexity: **Medium–High**. Value: **High**.

### Feature 4 — Appointment Cancellation Waitlist
- **Existing today:** CANCELLED/NO_SHOW free capacity; no waitlist.
- **PROPOSED:** Waitlist entry + offer on cancellation; accept → schedule.
- Complexity: **Medium**. Value: **Medium–High**. Dependency: Appointment lifecycle DIRECT; Appointment Request OPTIONAL/DIRECT.

### Feature 5 — Clinical / Operational Audit Trail
- **Existing today:** No AuditLog; mutations not recorded immutably.
- **PROPOSED:** Append-only `AuditEvent`; progressive hooks; VIEWER/SUPPORT read.
- Complexity: **Low–Medium**. Value: **Medium–High**. Can start INDEPENDENT.

### Feature 6 — Pharmacy Medication Inventory & Replenishment
- **Existing today:** OrderItem.productName free text; no catalog/stock.
- **PROPOSED:** MedicationCatalog + stock levels + replenishment requests; soft link to orders later.
- Complexity: **Medium–High**. Value: **Medium–High**.

### Feature 7 — Lab Test Order & Result Acknowledgment
- **Existing today:** PatientDocument generic upload; no lab orders/results workflow.
- **PROPOSED:** LabOrder + results; optional document attach; doctor acknowledgment.
- Complexity: **High**. Value: **High**.

---

## Completion report template (after file write)

- Exact file changed: `docs/NEXT_PRODUCT_FEATURES.md`
- No application code changed
- No API behavior changed
- No database/schema changed
- No migrations changed
- STOP — document is master roadmap only; phases not implemented
