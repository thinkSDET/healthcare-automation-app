# UI Functional E2E Test Case Catalog

**Product:** HealthOps (Healthcare Operations Management System)  
**Scope basis:** Application freeze — test the UI **as implemented today**  
**Document type:** Manual / functional / E2E test-case catalog only (no automation code)

---

## 1. Purpose

Provide a complete functional UI/E2E regression baseline so every currently implemented user-facing capability has at least one explicit test case. This catalog is the source for later automation authoring.

## 2. Scope

- Browser UI functional testing and end-to-end workflows
- Role-based access and navigation
- Ownership and unauthorized access via the UI
- Forms, validation, empty/loading/error presentation
- File upload/download, confirm dialogs, multi-tab behavior where implemented
- Cross-module business workflows executable through the UI

## 3. Out of Scope

- API-only test cases (separate phase)
- Direct database assertions as primary steps
- Performance, load, penetration, dedicated accessibility suites
- Automation framework / Playwright / Cypress / Selenium code
- Future or roadmap-only features not present in the current UI

## 4. Test Strategy

| Approach | Use |
|----------|-----|
| Module tests | Verify each page/feature in isolation |
| RBAC / ownership | Verify blocked roles and cross-patient access |
| Workflow E2E | Prove multi-screen business journeys |
| Negative / validation | Prove rejection paths and messages |
| Browser scenarios | Multi-tab auth inheritance, downloads, confirms, demo payment iframe |

**Source of truth:** frontend routes/pages/components; backend rules only to define expected UI outcomes.

## 5. Test Data Strategy

| Source | When to use |
|--------|-------------|
| Admin bootstrap (`create-admin` script / known local admin) | Staff login baseline |
| UI Register | PATIENT / DOCTOR / PHARMACIST accounts |
| Admin Users API is out of UI scope | Create SUPPORT/VIEWER via admin API **only as pre-data setup**, not as an API test case — or seed before suite |
| Create through UI | Patients, doctors, appointments, Rx, orders, inventory, lab |
| Prerequisite test case | Chain IDs (e.g. REFILL depends on RX) |
| Dynamic data | Unique emails, medical IDs, SKUs using timestamp suffix |

Avoid hardcoding fragile numeric IDs; capture IDs/numbers shown in the UI during the run.

**Shared persona aliases used below**

| Alias | Meaning |
|-------|---------|
| AdminA | ADMIN user |
| DoctorU | User with role DOCTOR |
| DoctorR | Active Doctor **registry** record |
| PharmA | PHARMACIST user |
| PatientA / PatientB | Distinct PATIENT users with linked patient records |
| ViewerA / SupportA | VIEWER / SUPPORT users |

## 6. Test Case ID Convention

| Prefix | Area |
|--------|------|
| AUTH | Authentication / password |
| DASH | Dashboard |
| PAT | Patient list / create |
| PDET | Patient details (core demographics) |
| DEP | Dependents |
| EMG | Emergency contact |
| MEDP | Medical profile |
| DOC | Patient documents |
| DR | Doctor management |
| APPT | Appointments |
| APREQ | Appointment requests |
| RX | Prescriptions |
| REFILL | Refill / renewal |
| ORD | Orders |
| PAY | Payments |
| PHARM | Pharmacy workspace |
| INV | Inventory |
| REPL | Replenishment |
| AUD | Audit logs |
| LAB | Lab orders / results |
| PORTAL | Patient portal aggregate / profile |
| NAV | Navigation / protected routes |
| RBAC | Cross-cutting RBAC / ownership |
| E2E | Cross-module workflows |
| BRW | Browser / multi-tab / dialogs |

IDs are unique and never reused.

### Common fields (every case)

Each case uses:

`ID | Module | Feature | Scenario | Type | Priority | Role | Preconditions | Test Data | Steps | Expected | Automation Priority | Suites`

---

## 7. Functional Coverage Matrix

| Module | Implemented UI functionality | Covered by |
|--------|------------------------------|------------|
| Auth | Login, register, remember-me, forgot/reset, change password, logout, lockout messaging | AUTH-* |
| Dashboard | Role-specific cards and copy | DASH-* |
| Patients | List, search, filter, sort, pagination, create | PAT-* |
| Patient details | View/edit demographics, deactivate | PDET-* |
| Dependents | Add/list/delete (+ portal read) | DEP-* |
| Emergency contact | Save/view/delete (+ portal read) | EMG-* |
| Medical profile | Save/view (+ portal read) | MEDP-* |
| Documents | Upload/list/download/delete (+ portal download) | DOC-* |
| Doctors | List/filter/sort, admin CRUD/status/delete, availability (localStorage) | DR-* |
| Appointments | List, create (admin), details, status, edit, cancel | APPT-* |
| Appointment requests | Patient submit/cancel; staff approve/reject | APREQ-* |
| Prescriptions | Staff create/status/delete on patient Rx page | RX-* |
| Refill/renewal | Patient/pharmacist request; staff review; create order | REFILL-* |
| Orders | Admin patient orders; patient my orders create/list | ORD-* |
| Payments | Pay page + embed demo success/fail | PAY-* |
| Pharmacy | Lookup Rx/orders; status updates; refill request | PHARM-* |
| Inventory | Create med, filter, adjust, request replenish | INV-* |
| Replenishment | Filter, approve/reject/cancel/receive | REPL-* |
| Audit | Filter, paginate, view trail | AUD-* |
| Lab | Create, filter, status, upload, acknowledge, patient view | LAB-* |
| Portal | Profile, appts, Rx, lab, orders, tracking | PORTAL-* + module IDs |
| Nav/RBAC | Role nav, direct URL, unauthorized redirect | NAV-*, RBAC-* |
| Browser | confirm(), window.open tracking, iframe payment | BRW-* |

---

## 8. Authentication Test Cases

### AUTH-001
- **Module:** Authentication  
- **Feature:** Login  
- **Scenario:** Valid admin login redirects to dashboard  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Preconditions:** AdminA exists and is ACTIVE  
- **Test Data:** Valid AdminA credentials  
- **Steps:** Open `/login` → enter email/password → Submit  
- **Expected:** Success; land on `/dashboard`; header shows HealthOps + AdminA name/role  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression  

### AUTH-002
- **Feature:** Login validation  
- **Scenario:** Empty email/password blocked  
- **Type:** Validation | **Priority:** P1 | **Role:** N/A  
- **Steps:** Submit login with empty fields  
- **Expected:** Browser/HTML required validation or page does not authenticate  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### AUTH-003
- **Feature:** Login negative  
- **Scenario:** Wrong password shows error  
- **Type:** Negative | **Priority:** P0 | **Role:** ADMIN  
- **Steps:** Enter valid email + wrong password → Submit  
- **Expected:** Error message; remain on login; no dashboard access  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression, Negative  

### AUTH-004
- **Feature:** Remember me  
- **Scenario:** Remember-me stores session in localStorage  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Login with Remember me checked → verify token in localStorage → close tab → reopen app URL  
- **Expected:** Session restored (within 30d token); dashboard accessible without re-login  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### AUTH-005
- **Feature:** Session storage login  
- **Scenario:** Without remember-me uses sessionStorage  
- **Type:** Positive | **Priority:** P1 | **Role:** PATIENT  
- **Steps:** Login unchecked Remember me → confirm token in sessionStorage not localStorage  
- **Expected:** Authenticated; token only in sessionStorage  
- **Automation Priority:** Medium | **Suites:** Regression  

### AUTH-006
- **Feature:** Register PATIENT  
- **Scenario:** Register patient with required profile fields  
- **Type:** Positive | **Priority:** P0 | **Role:** Public → PATIENT  
- **Test Data:** Unique email; DOB, gender, phone  
- **Steps:** `/register` → role PATIENT → complete fields → Submit → login  
- **Expected:** Account created; login works; portal dashboard available; profile linked  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression  

### AUTH-007
- **Feature:** Register PATIENT validation  
- **Scenario:** Missing DOB/gender/phone rejected  
- **Type:** Validation | **Priority:** P1 | **Role:** Public  
- **Steps:** PATIENT role without DOB/gender/phone → Submit  
- **Expected:** Client or server error; no successful registration  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### AUTH-008
- **Feature:** Register DOCTOR / PHARMACIST roles  
- **Scenario:** Public register as DOCTOR and PHARMACIST  
- **Type:** Positive | **Priority:** P1 | **Role:** Public  
- **Steps:** Register each role with unique emails → login  
- **Expected:** Accounts created; role-specific dashboards/nav appear (DoctorU ≠ DoctorR registry)  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### AUTH-009
- **Feature:** Register role restriction  
- **Scenario:** UI does not offer ADMIN registration  
- **Type:** RBAC | **Priority:** P1 | **Role:** Public  
- **Steps:** Inspect role dropdown on `/register`  
- **Expected:** Only PATIENT, DOCTOR, PHARMACIST options  
- **Automation Priority:** Medium | **Suites:** Regression, Negative/RBAC  

### AUTH-010
- **Feature:** Forgot password  
- **Scenario:** Submit known email shows success messaging  
- **Type:** Positive | **Priority:** P1 | **Role:** Public  
- **Steps:** `/forgot-password` → enter AdminA email → Submit  
- **Expected:** Success-style message (non-enumerating copy acceptable); can proceed to reset with returned/logged token in local/dev  
- **Automation Priority:** High | **Suites:** Sanity, Regression  
- **Note:** Email delivery not implemented — use reset token from UI response/dev console as app behavior today  

### AUTH-011
- **Feature:** Forgot password unknown email  
- **Scenario:** Unknown email still shows generic success  
- **Type:** Positive / Negative | **Priority:** P2 | **Role:** Public  
- **Steps:** Submit email that does not exist  
- **Expected:** Same generic success messaging (no account enumeration)  
- **Automation Priority:** Medium | **Suites:** Regression  

### AUTH-012
- **Feature:** Reset password  
- **Scenario:** Valid token resets password and allows login  
- **Type:** Positive | **Priority:** P0 | **Role:** Public  
- **Preconditions:** AUTH-010 token available  
- **Steps:** `/reset-password` with token + matching new passwords → Submit → login with new password  
- **Expected:** Success; redirect/login works with new password  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### AUTH-013
- **Feature:** Reset password validation  
- **Scenario:** Mismatched or short passwords rejected  
- **Type:** Validation | **Priority:** P1 | **Role:** Public  
- **Steps:** Submit mismatched confirm password / invalid length  
- **Expected:** Error; password unchanged  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### AUTH-014
- **Feature:** Change password  
- **Scenario:** Authenticated user changes password  
- **Type:** Positive | **Priority:** P1 | **Role:** Any authenticated  
- **Steps:** User menu → Change Password → current + new (≥8, different) → Submit  
- **Expected:** Success message; subsequent login uses new password  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### AUTH-015
- **Feature:** Change password negative  
- **Scenario:** Wrong current password rejected  
- **Type:** Negative | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Enter incorrect current password  
- **Expected:** Error; old password still works  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### AUTH-016
- **Feature:** Logout  
- **Scenario:** Logout clears session and blocks protected pages  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Steps:** Open user menu → Logout → try `/dashboard`  
- **Expected:** Redirected to login; token cleared from storage  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression  

### AUTH-017
- **Feature:** Account lockout messaging  
- **Scenario:** Repeated failed logins show lock message  
- **Type:** Negative | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Fail login ≥5 times with wrong password  
- **Expected:** Lockout error (≈15 minutes); further attempts blocked until wait/admin unlock path  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### AUTH-018
- **Feature:** Session expiry UX  
- **Scenario:** Expired JWT forces re-login (if token expired)  
- **Type:** Browser/Navigation | **Priority:** P2 | **Role:** Any  
- **Preconditions:** Expired token placed in storage (or wait for 1h non-remember session in long runs)  
- **Steps:** Open protected page with expired token  
- **Expected:** Alert/logout or failed auth leading to login  
- **Automation Priority:** Medium | **Suites:** Regression  

---

## 9. Dashboard Test Cases

### DASH-001
- **Scenario:** Admin dashboard cards navigate correctly  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Steps:** Login → verify cards (Patients, Doctors, Appointments, Appt Requests, Refills, Inventory, Replenishment, Audit) → click each  
- **Expected:** Each card routes to the correct page  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression  

### DASH-002
- **Scenario:** Doctor dashboard cards (no inventory/audit cards)  
- **Type:** RBAC | **Priority:** P1 | **Role:** DOCTOR  
- **Steps:** Login as DoctorU → inspect cards  
- **Expected:** Clinical cards present; Inventory/Replenish/Audit cards absent; Appt Requests & Refills present  
- **Automation Priority:** High | **Suites:** Sanity, Regression, Negative/RBAC  

### DASH-003
- **Scenario:** Patient dashboard portal cards  
- **Type:** Positive | **Priority:** P0 | **Role:** PATIENT  
- **Steps:** Login PatientA → cards for Profile, Appointments, Prescriptions, Orders  
- **Expected:** Cards navigate to `/my/*` routes  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### DASH-004
- **Scenario:** Pharmacist dashboard cards  
- **Type:** Positive | **Priority:** P0 | **Role:** PHARMACIST  
- **Steps:** Login PharmA → Pharmacy, Refill Queue, Inventory, Replenishment  
- **Expected:** Correct navigation targets  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### DASH-005
- **Scenario:** VIEWER/SUPPORT dashboard limited to audit  
- **Type:** RBAC | **Priority:** P1 | **Role:** VIEWER, SUPPORT  
- **Steps:** Login each → inspect cards/copy  
- **Expected:** Audit Logs card present; clinical/pharmacy cards absent  
- **Automation Priority:** High | **Suites:** Sanity, Regression, Negative/RBAC  

### DASH-006
- **Scenario:** Welcome copy is role-specific  
- **Type:** Positive | **Priority:** P3 | **Role:** All  
- **Steps:** Compare welcome text across roles  
- **Expected:** Matches role-appropriate operations description  
- **Automation Priority:** Low | **Suites:** Regression  

---

## 10. Patient Management Test Cases

### PAT-001
- **Scenario:** Admin opens patients list with data  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Expected:** `/patients` loads table or empty state; loading resolves  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression  

### PAT-002
- **Scenario:** Doctor can view patients list  
- **Type:** Positive | **Priority:** P1 | **Role:** DOCTOR  
- **Expected:** List accessible  
- **Automation Priority:** High | **Suites:** Regression  

### PAT-003
- **Scenario:** Add patient with required fields  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN or DOCTOR  
- **Test Data:** Unique medicalId, names, DOB, gender, email, phone  
- **Steps:** + Add Patient → fill required → Save  
- **Expected:** Success; patient appears in list  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression  

### PAT-004
- **Scenario:** Add patient missing required fields  
- **Type:** Validation | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Submit empty/partial form  
- **Expected:** Required validation prevents create  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### PAT-005
- **Scenario:** Duplicate medicalId / email rejected by UI error  
- **Type:** Negative | **Priority:** P1 | **Role:** ADMIN  
- **Preconditions:** Existing patient  
- **Steps:** Create with duplicate unique field  
- **Expected:** Error message; no duplicate row  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### PAT-006
- **Scenario:** Search patients by name/medicalId/email/phone  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Enter search text matching one patient  
- **Expected:** Filtered list shows matches only  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### PAT-007
- **Scenario:** Status filter  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Filter ACTIVE / INACTIVE  
- **Expected:** Only matching statuses shown  
- **Automation Priority:** Medium | **Suites:** Regression  

### PAT-008
- **Scenario:** Column sort  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Steps:** Sort by name/status/etc.  
- **Expected:** Order changes consistently  
- **Automation Priority:** Medium | **Suites:** Regression  

### PAT-009
- **Scenario:** Pagination and page size  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Preconditions:** >10 patients (create as needed)  
- **Steps:** Change page size; next/prev  
- **Expected:** Pages update; counts consistent  
- **Automation Priority:** Medium | **Suites:** Regression  

### PAT-010
- **Scenario:** Clear filters  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Steps:** Apply search+filter → clear  
- **Expected:** Full list restored  
- **Automation Priority:** Low | **Suites:** Regression  

### PAT-011
- **Scenario:** Open patient details from row  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Steps:** Click patient row/link  
- **Expected:** `/patients/:id` opens with demographics  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### PAT-012
- **Scenario:** Unauthorized roles cannot open `/patients`  
- **Type:** RBAC | **Priority:** P0 | **Role:** PATIENT, PHARMACIST, VIEWER  
- **Steps:** Direct navigate `/patients`  
- **Expected:** Redirect to `/dashboard` (ProtectedRoute)  
- **Automation Priority:** Critical | **Suites:** Smoke, Negative/RBAC, Regression  

---

## 11. Patient Details Test Cases

### PDET-001
- **Scenario:** View patient details  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Expected:** Demographics visible; sections for dependents/emergency/medical/documents/shortcuts  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### PDET-002
- **Scenario:** Edit patient demographics  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN or DOCTOR  
- **Steps:** Edit → change phone/address → Save  
- **Expected:** Success message; values persist on reload  
- **Automation Priority:** Critical | **Suites:** Sanity, Regression  

### PDET-003
- **Scenario:** Edit validation for required demographics  
- **Type:** Validation | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Clear required fields → Save  
- **Expected:** Validation error; no corrupt save  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### PDET-004
- **Scenario:** Deactivate patient with confirmation  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN or DOCTOR  
- **Steps:** Deactivate → confirm dialog → OK  
- **Expected:** Success; status INACTIVE  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### PDET-005
- **Scenario:** Cancel deactivate confirmation  
- **Type:** Browser/Navigation | **Priority:** P2 | **Role:** ADMIN  
- **Steps:** Deactivate → Cancel confirm  
- **Expected:** Status unchanged  
- **Automation Priority:** Medium | **Suites:** Regression  

### PDET-006
- **Scenario:** Admin-only Orders shortcut visible  
- **Type:** RBAC | **Priority:** P1 | **Role:** ADMIN vs DOCTOR  
- **Steps:** Compare Patient Details shortcuts  
- **Expected:** Orders link only for ADMIN; Prescriptions for ADMIN/DOCTOR  
- **Automation Priority:** High | **Suites:** Regression, Negative/RBAC  

### PDET-007
- **Scenario:** Invalid patient id error state  
- **Type:** Negative | **Priority:** P2 | **Role:** ADMIN  
- **Steps:** Open `/patients/999999`  
- **Expected:** Error/not found presentation  
- **Automation Priority:** Medium | **Suites:** Regression  

### PDET-008
- **Scenario:** Back navigation to patients list  
- **Type:** Positive | **Priority:** P3 | **Role:** ADMIN  
- **Expected:** Returns to `/patients`  
- **Automation Priority:** Low | **Suites:** Regression  

---

## 12. Dependents Test Cases

### DEP-001
- **Scenario:** Add dependent with required fields  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** On Patient Details → add dependent (first, last, relationship) → Save  
- **Expected:** Success; dependent listed  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### DEP-002
- **Scenario:** Add dependent missing required fields  
- **Type:** Validation | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Error requiring first/last/relationship  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### DEP-003
- **Scenario:** Delete dependent with confirm  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Remove dependent → confirm  
- **Expected:** Removed from list  
- **Automation Priority:** High | **Suites:** Regression  

### DEP-004
- **Scenario:** Cancel delete dependent  
- **Type:** Browser | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** Dependent remains  
- **Automation Priority:** Low | **Suites:** Regression  

### DEP-005
- **Scenario:** Empty dependents state  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** Empty-state messaging when none  
- **Automation Priority:** Low | **Suites:** Regression  

### DEP-006
- **Scenario:** Patient portal shows dependents read-only  
- **Type:** Positive | **Priority:** P1 | **Role:** PATIENT  
- **Preconditions:** Staff created dependent for PatientA  
- **Steps:** `/my/profile` dependents section  
- **Expected:** Listed; no add/delete controls  
- **Automation Priority:** High | **Suites:** Regression  

---

## 13. Emergency Contact Test Cases

### EMG-001
- **Scenario:** Save emergency contact  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Enter first/last/relationship/phone → Save  
- **Expected:** Success; contact displayed  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### EMG-002
- **Scenario:** Missing required emergency fields  
- **Type:** Validation | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Error; not saved  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### EMG-003
- **Scenario:** Update existing emergency contact  
- **Type:** Positive | **Priority:** P2 | **Role:** DOCTOR  
- **Expected:** Updated values persist  
- **Automation Priority:** Medium | **Suites:** Regression  

### EMG-004
- **Scenario:** Delete emergency contact with confirm  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Removed; empty state  
- **Automation Priority:** High | **Suites:** Regression  

### EMG-005
- **Scenario:** Portal read-only emergency contact  
- **Type:** Positive | **Priority:** P1 | **Role:** PATIENT  
- **Expected:** Visible on `/my/profile` without edit/delete  
- **Automation Priority:** Medium | **Suites:** Regression  

---

## 14. Medical Profile Test Cases

### MEDP-001
- **Scenario:** Save medical profile fields  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Enter conditions/allergies/medications/notes → Save  
- **Expected:** Success; values persist  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### MEDP-002
- **Scenario:** Update medical profile  
- **Type:** Positive | **Priority:** P2 | **Role:** DOCTOR  
- **Expected:** Changes saved  
- **Automation Priority:** Medium | **Suites:** Regression  

### MEDP-003
- **Scenario:** Empty medical profile state then save  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** Empty state initially; after save content shown  
- **Automation Priority:** Low | **Suites:** Regression  

### MEDP-004
- **Scenario:** Portal read-only medical profile  
- **Type:** Positive | **Priority:** P1 | **Role:** PATIENT  
- **Expected:** Visible on profile; no staff save controls  
- **Automation Priority:** Medium | **Suites:** Regression  

---

## 15. Documents Test Cases

### DOC-001
- **Scenario:** Upload allowed document type  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Test Data:** PDF/PNG/JPEG within 10MB; document type selected  
- **Steps:** Select type + file → Upload  
- **Expected:** Success; document listed  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression  

### DOC-002
- **Scenario:** Upload without type or file  
- **Type:** Validation | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Error requiring type and file  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### DOC-003
- **Scenario:** Unsupported MIME rejected  
- **Type:** Negative | **Priority:** P1 | **Role:** ADMIN  
- **Test Data:** Disallowed file type if browser allows selecting  
- **Expected:** Error from upload; not listed  
- **Automation Priority:** Medium | **Suites:** Regression, Negative  

### DOC-004
- **Scenario:** Download document  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Steps:** Click Download  
- **Expected:** File download starts with original name  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### DOC-005
- **Scenario:** Delete document with confirm  
- **Type:** Positive | **Priority:** P1 | **Role:** DOCTOR  
- **Expected:** Removed after confirm  
- **Automation Priority:** High | **Suites:** Regression  

### DOC-006
- **Scenario:** Empty documents state  
- **Type:** Positive | **Priority:** P3 | **Role:** ADMIN  
- **Expected:** Empty messaging  
- **Automation Priority:** Low | **Suites:** Regression  

### DOC-007
- **Scenario:** Patient downloads own document from portal  
- **Type:** Ownership | **Priority:** P1 | **Role:** PATIENT  
- **Preconditions:** Staff uploaded doc for PatientA  
- **Steps:** `/my/profile` → Download  
- **Expected:** Download succeeds  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### DOC-008
- **Scenario:** Patient cannot upload/delete on portal  
- **Type:** RBAC | **Priority:** P1 | **Role:** PATIENT  
- **Expected:** No upload/delete controls on `/my/profile`  
- **Automation Priority:** High | **Suites:** Regression, Negative/RBAC  

### DOC-009
- **Scenario:** Doctor can upload on patient details  
- **Type:** Positive | **Priority:** P1 | **Role:** DOCTOR  
- **Expected:** Upload succeeds  
- **Automation Priority:** High | **Suites:** Regression  

---

## 16. Doctor Management Test Cases

### DR-001
- **Scenario:** List doctors  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Expected:** `/doctors` loads list/empty/loading correctly  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### DR-002
- **Scenario:** Admin creates doctor  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Test Data:** Unique doctorCode, license, email; required fields  
- **Expected:** Success; appears in list ACTIVE  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression  

### DR-003
- **Scenario:** Create doctor validation  
- **Type:** Validation | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Omit required fields / invalid phone/experience  
- **Expected:** Client validation messages; not created  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### DR-004
- **Scenario:** Duplicate code/license/email rejected  
- **Type:** Negative | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Error; no duplicate  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### DR-005
- **Scenario:** Edit doctor  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Updates persist  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### DR-006
- **Scenario:** Change doctor status (ACTIVE/INACTIVE/ON_LEAVE)  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Status badge updates  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### DR-007
- **Scenario:** Delete doctor with confirm  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Removed after confirm (use disposable doctor)  
- **Automation Priority:** High | **Suites:** Regression  

### DR-008
- **Scenario:** Search/filter/sort doctors  
- **Type:** Positive | **Priority:** P2 | **Role:** DOCTOR  
- **Expected:** Filters and sorts work; doctor role has view without admin action buttons  
- **Automation Priority:** Medium | **Suites:** Regression  

### DR-009
- **Scenario:** Doctor role cannot create/edit/delete  
- **Type:** RBAC | **Priority:** P0 | **Role:** DOCTOR  
- **Steps:** Inspect `/doctors` UI for Add/Edit/Delete  
- **Expected:** Admin-only controls hidden  
- **Automation Priority:** Critical | **Suites:** Smoke, Negative/RBAC, Regression  

### DR-010
- **Scenario:** Manage availability saved to browser localStorage  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Steps:** Open availability → add slots → Save → reload page → reopen availability  
- **Expected:** Success message; slots restored from localStorage for that doctor id  
- **Automation Priority:** Medium | **Suites:** Regression  
- **Note:** Client-only feature (not backend-persisted) — still user-facing  

### DR-011
- **Scenario:** Availability validation (overlap / end before start)  
- **Type:** Validation | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** Error messages; not saved  
- **Automation Priority:** Medium | **Suites:** Regression, Negative  

### DR-012
- **Scenario:** Unauthorized role blocked from `/doctors`  
- **Type:** RBAC | **Priority:** P0 | **Role:** PATIENT, PHARMACIST  
- **Expected:** Redirect to dashboard  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

---

## 17. Appointment Test Cases

### APPT-001
- **Scenario:** Admin opens appointments list  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Expected:** List loads; New Appointment button visible  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### APPT-002
- **Scenario:** Doctor sees list without New Appointment  
- **Type:** RBAC | **Priority:** P1 | **Role:** DOCTOR  
- **Expected:** Can view; no create button  
- **Automation Priority:** High | **Suites:** Regression, Negative/RBAC  

### APPT-003
- **Scenario:** Create appointment (admin)  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Preconditions:** ACTIVE patient + ACTIVE DoctorR; optional availability in localStorage  
- **Steps:** `/appointments/new` → select patient/doctor/future time/reason → Submit  
- **Expected:** Created; appears in list SCHEDULED  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### APPT-004
- **Scenario:** Create validation missing fields  
- **Type:** Validation | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Required field errors  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### APPT-005
- **Scenario:** Cannot schedule with inactive doctor  
- **Type:** Negative | **Priority:** P1 | **Role:** ADMIN  
- **Preconditions:** DoctorR set INACTIVE/ON_LEAVE  
- **Expected:** UI/server error preventing create  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### APPT-006
- **Scenario:** Overlapping appointment rejected  
- **Type:** Negative | **Priority:** P1 | **Role:** ADMIN  
- **Preconditions:** Existing appointment for doctor/patient overlapping window  
- **Expected:** Error about overlap  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### APPT-007
- **Scenario:** Open appointment details  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Expected:** Details + status + available actions  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### APPT-008
- **Scenario:** Status Confirm → Check in → Start → Complete  
- **Type:** Workflow | **Priority:** P0 | **Role:** ADMIN or DOCTOR  
- **Steps:** Advance via UI buttons through CONFIRMED → CHECKED_IN → IN_CONSULTATION → COMPLETED  
- **Expected:** Each step success; terminal COMPLETED has no further advance actions  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### APPT-009
- **Scenario:** Mark No-show from SCHEDULED  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN or DOCTOR  
- **Expected:** Status NO_SHOW; terminal  
- **Automation Priority:** High | **Suites:** Regression  

### APPT-010
- **Scenario:** Admin edits schedule while SCHEDULED/CONFIRMED  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Save success; new time shown  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### APPT-011
- **Scenario:** Doctor cannot edit schedule fields  
- **Type:** RBAC | **Priority:** P1 | **Role:** DOCTOR  
- **Expected:** Edit schedule controls not available (advance only)  
- **Automation Priority:** High | **Suites:** Regression, Negative/RBAC  

### APPT-012
- **Scenario:** Admin cancel SCHEDULED appointment  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** CANCELLED  
- **Automation Priority:** High | **Suites:** Regression  

### APPT-013
- **Scenario:** Doctor cannot cancel via UI  
- **Type:** RBAC | **Priority:** P1 | **Role:** DOCTOR  
- **Expected:** Cancel control absent  
- **Automation Priority:** High | **Suites:** Negative/RBAC, Regression  

### APPT-014
- **Scenario:** Invalid transition not offered  
- **Type:** Negative | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** On COMPLETED appointment inspect actions  
- **Expected:** No illegal transition buttons  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### APPT-015
- **Scenario:** Non-admin blocked from `/appointments/new`  
- **Type:** RBAC | **Priority:** P0 | **Role:** DOCTOR, PATIENT  
- **Expected:** Redirect to dashboard  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### APPT-016
- **Scenario:** Patient filter query on appointments list (if linked from patient)  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Steps:** Open appointments with patient filter query if UI supports  
- **Expected:** Filtered subset or clear messaging  
- **Automation Priority:** Low | **Suites:** Regression  

---

## 18. Appointment Request Test Cases

### APREQ-001
- **Scenario:** Patient submits appointment request  
- **Type:** Positive | **Priority:** P0 | **Role:** PATIENT  
- **Steps:** `/my/appointments/request` → doctor, future datetime, reason ≥3 chars → Submit  
- **Expected:** Success with request number; appears under My Appointments requests as SUBMITTED  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### APREQ-002
- **Scenario:** Validation reason too short / missing doctor/time  
- **Type:** Validation | **Priority:** P1 | **Role:** PATIENT  
- **Expected:** Error; not submitted  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### APREQ-003
- **Scenario:** Patient cancels SUBMITTED request  
- **Type:** Positive | **Priority:** P1 | **Role:** PATIENT  
- **Expected:** CANCELLED  
- **Automation Priority:** High | **Suites:** Regression  

### APREQ-004
- **Scenario:** Staff lists SUBMITTED requests  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Expected:** `/appointment-requests` shows queue; filter works  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### APREQ-005
- **Scenario:** Approve request creates appointment  
- **Type:** Workflow | **Priority:** P0 | **Role:** ADMIN or DOCTOR  
- **Steps:** Approve SUBMITTED request  
- **Expected:** APPROVED; linked appointment exists; visible in appointments / patient history  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### APREQ-006
- **Scenario:** Reject requires reason  
- **Type:** Validation | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Reject without reason  
- **Expected:** Error requiring reason  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### APREQ-007
- **Scenario:** Reject with reason  
- **Type:** Positive | **Priority:** P1 | **Role:** DOCTOR  
- **Expected:** REJECTED; reason visible  
- **Automation Priority:** High | **Suites:** Regression  

### APREQ-008
- **Scenario:** Status filter ALL/SUBMITTED/etc.  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** List refreshes by status  
- **Automation Priority:** Medium | **Suites:** Regression  

### APREQ-009
- **Scenario:** Patient cannot open staff review page  
- **Type:** RBAC | **Priority:** P0 | **Role:** PATIENT  
- **Steps:** `/appointment-requests`  
- **Expected:** Redirect dashboard  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### APREQ-010
- **Scenario:** Duplicate submitted / overlap shows error  
- **Type:** Negative | **Priority:** P1 | **Role:** PATIENT  
- **Preconditions:** Conflicting request/appointment  
- **Expected:** Error messaging; not created  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### APREQ-011
- **Scenario:** My Appointments shows scheduled + requests  
- **Type:** Positive | **Priority:** P1 | **Role:** PATIENT  
- **Expected:** Both sections render with empty or data states  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

---

## 19. Prescription Test Cases

### RX-001
- **Scenario:** Open patient prescriptions page  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Steps:** Patient Details → Prescriptions  
- **Expected:** `/patients/:id/prescriptions` loads  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### RX-002
- **Scenario:** Create prescription with items  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN or DOCTOR  
- **Steps:** + New Prescription → select doctor → add medicine fields → Create  
- **Expected:** Success; ACTIVE prescription listed with items  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### RX-003
- **Scenario:** Create validation incomplete medicine rows  
- **Type:** Validation | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Error to complete medicine fields  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### RX-004
- **Scenario:** Add/remove medicine line items in form  
- **Type:** Positive | **Priority:** P2 | **Role:** DOCTOR  
- **Expected:** Can add multiple; cannot remove last remaining row incorrectly (app rule)  
- **Automation Priority:** Medium | **Suites:** Regression  

### RX-005
- **Scenario:** Update prescription status ACTIVE→COMPLETED  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Status updates; success message  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### RX-006
- **Scenario:** Cancel prescription  
- **Type:** Positive | **Priority:** P1 | **Role:** DOCTOR  
- **Expected:** CANCELLED  
- **Automation Priority:** High | **Suites:** Regression  

### RX-007
- **Scenario:** Delete prescription with confirm  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Removed after confirm  
- **Automation Priority:** High | **Suites:** Regression  

### RX-008
- **Scenario:** Empty prescriptions state  
- **Type:** Positive | **Priority:** P3 | **Role:** ADMIN  
- **Expected:** Empty CTA messaging  
- **Automation Priority:** Low | **Suites:** Regression  

### RX-009
- **Scenario:** Pharmacist cannot open staff patient prescriptions route  
- **Type:** RBAC | **Priority:** P1 | **Role:** PHARMACIST  
- **Steps:** Direct `/patients/:id/prescriptions`  
- **Expected:** Redirect (route is ADMIN/DOCTOR only)  
- **Automation Priority:** High | **Suites:** Negative/RBAC, Regression  

---

## 20. Refill/Renewal Test Cases

### REFILL-001
- **Scenario:** Patient requests refill on ACTIVE Rx  
- **Type:** Positive | **Priority:** P0 | **Role:** PATIENT  
- **Preconditions:** ACTIVE prescription for PatientA  
- **Steps:** `/my/prescriptions` → Request refill  
- **Expected:** SUBMITTED request listed  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### REFILL-002
- **Scenario:** Patient requests renewal on ACTIVE or COMPLETED  
- **Type:** Positive | **Priority:** P1 | **Role:** PATIENT  
- **Expected:** SUBMITTED renewal created when eligible  
- **Automation Priority:** High | **Suites:** Regression, Critical Workflow  

### REFILL-003
- **Scenario:** Refill button hidden when not ACTIVE / pending exists  
- **Type:** Negative | **Priority:** P1 | **Role:** PATIENT  
- **Expected:** Controls disabled/hidden per UI rules when SUBMITTED exists or ineligible  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### REFILL-004
- **Scenario:** Patient cancels own SUBMITTED request  
- **Type:** Positive | **Priority:** P1 | **Role:** PATIENT  
- **Expected:** CANCELLED  
- **Automation Priority:** High | **Suites:** Regression  

### REFILL-005
- **Scenario:** Admin/Doctor approve renewal or refill  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Steps:** `/refill-requests` → Approve  
- **Expected:** APPROVED  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression, Critical Workflow  

### REFILL-006
- **Scenario:** Pharmacist can approve REFILL only  
- **Type:** RBAC | **Priority:** P0 | **Role:** PHARMACIST  
- **Steps:** View REFILL vs RENEWAL in queue  
- **Expected:** Approve/Reject available for REFILL; not for RENEWAL  
- **Automation Priority:** Critical | **Suites:** Sanity, Negative/RBAC, Regression  

### REFILL-007
- **Scenario:** Reject requires reason  
- **Type:** Validation | **Priority:** P1 | **Role:** DOCTOR  
- **Expected:** Error without reason  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### REFILL-008
- **Scenario:** Patient creates order from APPROVED request  
- **Type:** Workflow | **Priority:** P0 | **Role:** PATIENT  
- **Steps:** On My Prescriptions → create order from approved request (line items/prices as UI requires) → Submit  
- **Expected:** Order created; request FULFILLED  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### REFILL-009
- **Scenario:** Status filter on review page  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** Filters SUBMITTED/APPROVED/etc.  
- **Automation Priority:** Medium | **Suites:** Regression  

### REFILL-010
- **Scenario:** Pharmacist requests refill from pharmacy workspace  
- **Type:** Positive | **Priority:** P1 | **Role:** PHARMACIST  
- **Preconditions:** ACTIVE Rx loaded in pharmacy  
- **Steps:** Request refill button  
- **Expected:** SUBMITTED refill created  
- **Automation Priority:** High | **Suites:** Regression  

### REFILL-011
- **Scenario:** Duplicate SUBMITTED blocked  
- **Type:** Negative | **Priority:** P1 | **Role:** PATIENT  
- **Expected:** Error when second SUBMITTED attempted  
- **Automation Priority:** High | **Suites:** Regression, Negative  

---

## 21. Orders Test Cases

### ORD-001
- **Scenario:** Admin opens patient orders page  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Steps:** Patient Details → Orders  
- **Expected:** `/patients/:id/orders` loads  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### ORD-002
- **Scenario:** Admin creates order with line items  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Steps:** Add products qty/price → Create  
- **Expected:** Success; order PENDING / payment PENDING  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### ORD-003
- **Scenario:** Create order validation incomplete items  
- **Type:** Validation | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Error requiring product/qty/price  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### ORD-004
- **Scenario:** Admin updates order status through lifecycle  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** PENDING→CONFIRMED→PROCESSING→SHIPPED→DELIVERED  
- **Expected:** Each update success  
- **Automation Priority:** High | **Suites:** Sanity, Regression, Critical Workflow  

### ORD-005
- **Scenario:** Admin updates payment status  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Payment badge updates (PAID/FAILED/REFUNDED)  
- **Automation Priority:** High | **Suites:** Regression  

### ORD-006
- **Scenario:** Cancel order status  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** CANCELLED  
- **Automation Priority:** Medium | **Suites:** Regression  

### ORD-007
- **Scenario:** Doctor cannot open patient orders route  
- **Type:** RBAC | **Priority:** P0 | **Role:** DOCTOR  
- **Steps:** `/patients/:id/orders`  
- **Expected:** Redirect dashboard  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### ORD-008
- **Scenario:** Patient lists my orders  
- **Type:** Positive | **Priority:** P0 | **Role:** PATIENT  
- **Expected:** `/my/orders` shows orders or empty state  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### ORD-009
- **Scenario:** Patient creates order from portal  
- **Type:** Positive | **Priority:** P1 | **Role:** PATIENT  
- **Steps:** Create order form with items → Submit  
- **Expected:** Success; order appears  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### ORD-010
- **Scenario:** Track shipment button only for PROCESSING/SHIPPED/DELIVERED  
- **Type:** Positive | **Priority:** P1 | **Role:** PATIENT  
- **Expected:** Track visible only for those statuses; opens tracking  
- **Automation Priority:** High | **Suites:** Regression  

### ORD-011
- **Scenario:** Make Payment button for PENDING/FAILED payment  
- **Type:** Positive | **Priority:** P0 | **Role:** PATIENT  
- **Expected:** Navigates to pay page when payment PENDING/FAILED  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression, Critical Workflow  

### ORD-012
- **Scenario:** Filters on admin patient orders (status/payment/search if present)  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** Filters narrow list  
- **Automation Priority:** Medium | **Suites:** Regression  

---

## 22. Payment Test Cases

### PAY-001
- **Scenario:** Open order payment page for own unpaid order  
- **Type:** Positive | **Priority:** P0 | **Role:** PATIENT  
- **Expected:** `/my/orders/:orderId/pay` shows order summary + payment embed  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### PAY-002
- **Scenario:** Successful demo payment persists PAID  
- **Type:** Workflow | **Priority:** P0 | **Role:** PATIENT  
- **Test Data:** Card not ending in 0000; valid expiry/CVV  
- **Steps:** Complete embed form → wait for success → parent persists payment  
- **Expected:** Success messages; order paymentStatus PAID; pay controls hidden afterward  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### PAY-003
- **Scenario:** Declined card ending 0000  
- **Type:** Negative | **Priority:** P1 | **Role:** PATIENT  
- **Expected:** Decline message; payment remains unpaid/FAILED path per UI  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### PAY-004
- **Scenario:** Invalid card validation in embed  
- **Type:** Validation | **Priority:** P1 | **Role:** PATIENT  
- **Steps:** Short card number / bad expiry / bad CVV  
- **Expected:** Validation errors; no success  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### PAY-005
- **Scenario:** Already paid order messaging  
- **Type:** Positive | **Priority:** P2 | **Role:** PATIENT  
- **Preconditions:** Order PAID  
- **Expected:** Indicates already paid; no new charge flow  
- **Automation Priority:** Medium | **Suites:** Regression  

### PAY-006
- **Scenario:** Cannot pay another patient’s order by URL  
- **Type:** Ownership | **Priority:** P0 | **Role:** PATIENT  
- **Preconditions:** Order belongs to PatientB; login PatientA  
- **Steps:** Open `/my/orders/{B_orderId}/pay`  
- **Expected:** Permission error; payment not completed  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### PAY-007
- **Scenario:** Non-patient blocked from payment routes  
- **Type:** RBAC | **Priority:** P0 | **Role:** ADMIN  
- **Steps:** `/my/orders/1/pay`  
- **Expected:** Redirect dashboard  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### PAY-008
- **Scenario:** Payment embed page loads in iframe context  
- **Type:** Browser | **Priority:** P1 | **Role:** PATIENT  
- **Expected:** Embed shows amount/order; posts messages to parent on success/fail  
- **Automation Priority:** High | **Suites:** Regression  

---

## 23. Pharmacy Test Cases

### PHARM-001
- **Scenario:** Open pharmacy workspace  
- **Type:** Positive | **Priority:** P0 | **Role:** PHARMACIST  
- **Expected:** `/pharmacy` loads lookup controls  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### PHARM-002
- **Scenario:** Lookup by patient ID loads Rx and orders  
- **Type:** Positive | **Priority:** P0 | **Role:** PHARMACIST  
- **Expected:** Tables populate or empty states  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression  

### PHARM-003
- **Scenario:** Invalid patient ID error  
- **Type:** Validation | **Priority:** P1 | **Role:** PHARMACIST  
- **Expected:** Validation/error message  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### PHARM-004
- **Scenario:** Lookup prescription by ID  
- **Type:** Positive | **Priority:** P1 | **Role:** PHARMACIST  
- **Expected:** Prescription details loaded  
- **Automation Priority:** High | **Suites:** Regression  

### PHARM-005
- **Scenario:** Lookup order by ID  
- **Type:** Positive | **Priority:** P1 | **Role:** PHARMACIST  
- **Expected:** Order details loaded  
- **Automation Priority:** High | **Suites:** Regression  

### PHARM-006
- **Scenario:** Update prescription status from workspace  
- **Type:** Positive | **Priority:** P1 | **Role:** PHARMACIST  
- **Expected:** Status change success  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### PHARM-007
- **Scenario:** Update order and payment status from workspace  
- **Type:** Positive | **Priority:** P1 | **Role:** PHARMACIST  
- **Expected:** Updates persist  
- **Automation Priority:** High | **Suites:** Sanity, Regression, Critical Workflow  

### PHARM-008
- **Scenario:** Request refill enabled only for ACTIVE Rx  
- **Type:** Negative | **Priority:** P1 | **Role:** PHARMACIST  
- **Expected:** Button disabled when not ACTIVE  
- **Automation Priority:** Medium | **Suites:** Regression  

### PHARM-009
- **Scenario:** Non-pharmacist blocked from `/pharmacy`  
- **Type:** RBAC | **Priority:** P0 | **Role:** ADMIN, PATIENT  
- **Expected:** Redirect dashboard  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

---

## 24. Inventory Test Cases

### INV-001
- **Scenario:** Open inventory  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Expected:** `/inventory` loads list/filters  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### INV-002
- **Scenario:** Create medication  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN or PHARMACIST  
- **Test Data:** Unique SKU  
- **Expected:** Created ACTIVE with quantities  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### INV-003
- **Scenario:** Create medication validation  
- **Type:** Validation | **Priority:** P1 | **Role:** PHARMACIST  
- **Expected:** Required SKU/name/unit enforced  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### INV-004
- **Scenario:** Duplicate SKU rejected  
- **Type:** Negative | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Error  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### INV-005
- **Scenario:** Filter by catalog status and stock status  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Filters apply (e.g. low stock)  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### INV-006
- **Scenario:** Adjust stock with reason  
- **Type:** Positive | **Priority:** P0 | **Role:** PHARMACIST  
- **Steps:** Adjust delta + reason → Submit  
- **Expected:** Quantity updates; success  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression, Critical Workflow  

### INV-007
- **Scenario:** Adjust without reason / negative resulting stock rejected  
- **Type:** Validation / Negative | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Error; stock unchanged  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### INV-008
- **Scenario:** Request replenishment from inventory row  
- **Type:** Positive | **Priority:** P1 | **Role:** PHARMACIST  
- **Expected:** Replenishment request created (SUBMITTED)  
- **Automation Priority:** High | **Suites:** Sanity, Regression, Critical Workflow  

### INV-009
- **Scenario:** Unauthorized role blocked from inventory  
- **Type:** RBAC | **Priority:** P0 | **Role:** DOCTOR, PATIENT  
- **Expected:** Redirect dashboard  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### INV-010
- **Scenario:** View stock movements if UI exposes them  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** Movements visible after adjust (if page shows them)  
- **Automation Priority:** Medium | **Suites:** Regression  
- **Note:** If movements UI not present on page, cover via inventory quantity change only and mark movements as API-backed without dedicated UI — verify quantity change in UI  

---

## 25. Replenishment Test Cases

### REPL-001
- **Scenario:** Open replenishment requests  
- **Type:** Positive | **Priority:** P0 | **Role:** PHARMACIST  
- **Expected:** `/replenishment-requests` loads; status filter defaults  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### REPL-002
- **Scenario:** Admin approves SUBMITTED request  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Expected:** APPROVED  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### REPL-003
- **Scenario:** Admin rejects with reason  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** REJECTED; reason shown  
- **Automation Priority:** High | **Suites:** Regression  

### REPL-004
- **Scenario:** Reject without reason blocked  
- **Type:** Validation | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Error  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### REPL-005
- **Scenario:** Pharmacist cannot approve/reject (UI)  
- **Type:** RBAC | **Priority:** P0 | **Role:** PHARMACIST  
- **Expected:** Approve/Reject controls not shown; Cancel may be available for SUBMITTED  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### REPL-006
- **Scenario:** Cancel SUBMITTED request  
- **Type:** Positive | **Priority:** P1 | **Role:** PHARMACIST (requester) or ADMIN  
- **Expected:** CANCELLED  
- **Automation Priority:** High | **Suites:** Regression  

### REPL-007
- **Scenario:** Receive APPROVED stock increases inventory  
- **Type:** Workflow | **Priority:** P0 | **Role:** ADMIN or PHARMACIST  
- **Steps:** Enter received qty → Receive  
- **Expected:** RECEIVED; medication on-hand increased  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### REPL-008
- **Scenario:** Status filter  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** List filtered  
- **Automation Priority:** Medium | **Suites:** Regression  

### REPL-009
- **Scenario:** Duplicate open request blocked from inventory action  
- **Type:** Negative | **Priority:** P1 | **Role:** PHARMACIST  
- **Preconditions:** Existing SUBMITTED/APPROVED for same med  
- **Expected:** Error on second request  
- **Automation Priority:** High | **Suites:** Regression, Negative  

---

## 26. Audit Test Cases

### AUD-001
- **Scenario:** Admin opens audit logs  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Expected:** `/audit-logs` lists events or empty; loading clears  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### AUD-002
- **Scenario:** VIEWER and SUPPORT can open audit logs  
- **Type:** RBAC | **Priority:** P0 | **Role:** VIEWER, SUPPORT  
- **Expected:** Page accessible  
- **Automation Priority:** Critical | **Suites:** Smoke, Negative/RBAC, Regression  

### AUD-003
- **Scenario:** Filter by action and entity type  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Preconditions:** Prior mutations exist (create patient etc.)  
- **Expected:** Filters narrow results  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### AUD-004
- **Scenario:** Filter by entityId / actorUserId  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** Matching events only  
- **Automation Priority:** Medium | **Suites:** Regression  

### AUD-005
- **Scenario:** Pagination next/prev  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Preconditions:** Enough events  
- **Expected:** Pages change; buttons disable at bounds  
- **Automation Priority:** Medium | **Suites:** Regression  

### AUD-006
- **Scenario:** Business action creates visible audit entry  
- **Type:** Workflow | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Create/update a patient or appointment → open audit logs → filter entity  
- **Expected:** Corresponding CREATE/UPDATE/STATUS_CHANGE event appears  
- **Automation Priority:** High | **Suites:** Sanity, Regression, Critical Workflow  

### AUD-007
- **Scenario:** Patient/Doctor/Pharmacist blocked from audit page  
- **Type:** RBAC | **Priority:** P0 | **Role:** PATIENT, DOCTOR, PHARMACIST  
- **Expected:** Redirect dashboard (Doctor has no audit nav; direct URL blocked)  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### AUD-008
- **Scenario:** Empty/error presentation  
- **Type:** Positive / Negative | **Priority:** P3 | **Role:** ADMIN  
- **Expected:** Empty list handled; failed load shows error  
- **Automation Priority:** Low | **Suites:** Regression  

---

## 27. Lab Test Cases

### LAB-001
- **Scenario:** Staff opens lab orders list  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Expected:** `/lab-orders` loads; New lab order available  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### LAB-002
- **Scenario:** Create lab order  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN or DOCTOR  
- **Steps:** Select patient, ACTIVE doctor, test name → Create  
- **Expected:** REQUESTED order listed  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### LAB-003
- **Scenario:** Create validation missing fields  
- **Type:** Validation | **Priority:** P1 | **Role:** DOCTOR  
- **Expected:** Not created  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### LAB-004
- **Scenario:** Status filter  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** Filtered list  
- **Automation Priority:** Medium | **Suites:** Regression  

### LAB-005
- **Scenario:** Open lab order details  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Expected:** Details + role-appropriate actions  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### LAB-006
- **Scenario:** Admin marks SAMPLE_COLLECTED then PROCESSING  
- **Type:** Workflow | **Priority:** P0 | **Role:** ADMIN  
- **Expected:** Status advances; doctor cannot collect/process buttons  
- **Automation Priority:** Critical | **Suites:** Sanity, Regression, Critical Workflow  

### LAB-007
- **Scenario:** Doctor cannot collect sample / start processing  
- **Type:** RBAC | **Priority:** P1 | **Role:** DOCTOR  
- **Expected:** Those admin-only actions absent  
- **Automation Priority:** High | **Suites:** Negative/RBAC, Regression  

### LAB-008
- **Scenario:** Admin uploads result (summary + flag + optional file)  
- **Type:** Positive | **Priority:** P0 | **Role:** ADMIN  
- **Preconditions:** PROCESSING  
- **Expected:** RESULT_AVAILABLE; success  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### LAB-009
- **Scenario:** Upload validation missing summary  
- **Type:** Validation | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Error  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### LAB-010
- **Scenario:** Acknowledge result (ADMIN/DOCTOR)  
- **Type:** Positive | **Priority:** P0 | **Role:** DOCTOR  
- **Preconditions:** RESULT_AVAILABLE  
- **Expected:** ACKNOWLEDGED; success notes patient visibility  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression, Critical Workflow  

### LAB-011
- **Scenario:** Reject result requires reason  
- **Type:** Validation / Positive | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Reject without reason fails; with reason → REJECTED  
- **Automation Priority:** High | **Suites:** Regression, Negative  

### LAB-012
- **Scenario:** Cancel early lab order  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN or DOCTOR  
- **Preconditions:** REQUESTED or SAMPLE_COLLECTED  
- **Expected:** CANCELLED  
- **Automation Priority:** Medium | **Suites:** Regression  

### LAB-013
- **Scenario:** Download result file as staff  
- **Type:** Positive | **Priority:** P1 | **Role:** ADMIN  
- **Preconditions:** Result file uploaded  
- **Expected:** Download works  
- **Automation Priority:** High | **Suites:** Regression  

### LAB-014
- **Scenario:** Patient list my lab orders  
- **Type:** Positive | **Priority:** P0 | **Role:** PATIENT  
- **Expected:** `/my/lab-orders` shows own orders  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### LAB-015
- **Scenario:** Patient cannot see result details before ACKNOWLEDGED  
- **Type:** Ownership / Workflow | **Priority:** P0 | **Role:** PATIENT  
- **Preconditions:** Order RESULT_AVAILABLE not acknowledged  
- **Steps:** Open `/my/lab-orders/:id`  
- **Expected:** Waiting message; no summary/flag/download  
- **Automation Priority:** Critical | **Suites:** Sanity, Regression, Critical Workflow, Negative/RBAC  

### LAB-016
- **Scenario:** Patient sees results after acknowledge + download if file  
- **Type:** Positive | **Priority:** P0 | **Role:** PATIENT  
- **Preconditions:** ACKNOWLEDGED  
- **Expected:** Summary/flag visible; download if hasResultFile  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression, Critical Workflow  

### LAB-017
- **Scenario:** Patient cannot access staff lab routes  
- **Type:** RBAC | **Priority:** P0 | **Role:** PATIENT  
- **Steps:** `/lab-orders`  
- **Expected:** Redirect dashboard  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### LAB-018
- **Scenario:** Lab nav available for ADMIN/DOCTOR (header) even if dashboard card absent  
- **Type:** Positive | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** Header Lab Orders link works  
- **Automation Priority:** Medium | **Suites:** Regression  

---

## 28. Patient Portal Test Cases

### PORTAL-001
- **Scenario:** Portal nav links for patient  
- **Type:** Positive | **Priority:** P0 | **Role:** PATIENT  
- **Expected:** Dashboard, My Profile, Appointments, Prescriptions, Lab Results, Orders  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### PORTAL-002
- **Scenario:** Edit own profile demographics  
- **Type:** Positive | **Priority:** P1 | **Role:** PATIENT  
- **Steps:** `/my/profile` → Edit → Save  
- **Expected:** Success; values persist  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### PORTAL-003
- **Scenario:** Profile requires patientId linkage  
- **Type:** Negative | **Priority:** P1 | **Role:** PATIENT  
- **Preconditions:** PATIENT user without linked patient (if creatable)  
- **Expected:** Clear error about missing patient link  
- **Automation Priority:** Medium | **Suites:** Regression  
- **Note:** Normal register creates link; only run if such account exists  

### PORTAL-004
- **Scenario:** Portal pages show loading then content/empty  
- **Type:** Positive | **Priority:** P2 | **Role:** PATIENT  
- **Expected:** No permanent spinner; empty states when no data  
- **Automation Priority:** Medium | **Suites:** Regression  

### PORTAL-005
- **Scenario:** Deep link between portal sections works  
- **Type:** Positive | **Priority:** P2 | **Role:** PATIENT  
- **Steps:** Appointments → Request appointment → back  
- **Expected:** Navigation consistent  
- **Automation Priority:** Low | **Suites:** Regression  

### PORTAL-006
- **Scenario:** Shipment tracking page renders demo timeline  
- **Type:** Positive | **Priority:** P1 | **Role:** PATIENT  
- **Preconditions:** Order in PROCESSING/SHIPPED/DELIVERED  
- **Steps:** Track Shipment  
- **Expected:** Tracking UI with HealthOps Courier demo stages matching status  
- **Automation Priority:** High | **Suites:** Sanity, Regression  

### PORTAL-007
- **Scenario:** Patient blocked from staff pages via nav absence  
- **Type:** RBAC | **Priority:** P1 | **Role:** PATIENT  
- **Expected:** No Patients/Doctors/Inventory nav items  
- **Automation Priority:** High | **Suites:** Negative/RBAC, Regression  

---

## 29. Navigation / Protected Routes

### NAV-001
- **Scenario:** `/` redirects to `/login`  
- **Type:** Browser/Navigation | **Priority:** P0 | **Role:** Anonymous  
- **Expected:** Login page  
- **Automation Priority:** Critical | **Suites:** Smoke, Regression  

### NAV-002
- **Scenario:** Unknown route redirects to login  
- **Type:** Browser/Navigation | **Priority:** P1 | **Role:** Anonymous  
- **Steps:** `/this-does-not-exist`  
- **Expected:** Login (app fallback)  
- **Automation Priority:** Medium | **Suites:** Regression  

### NAV-003
- **Scenario:** Unauthenticated access to `/dashboard` redirects login  
- **Type:** RBAC | **Priority:** P0 | **Role:** Anonymous  
- **Expected:** Redirect `/login` with return state  
- **Automation Priority:** Critical | **Suites:** Smoke, Negative/RBAC, Regression  

### NAV-004
- **Scenario:** Authenticated wrong-role URL redirects dashboard  
- **Type:** RBAC | **Priority:** P0 | **Role:** PATIENT  
- **Steps:** Visit `/inventory`, `/patients`, `/pharmacy`, `/audit-logs`  
- **Expected:** Each redirects to `/dashboard`  
- **Automation Priority:** Critical | **Suites:** Smoke, Negative/RBAC, Regression  

### NAV-005
- **Scenario:** Header brand navigates to dashboard  
- **Type:** Positive | **Priority:** P3 | **Role:** Any  
- **Expected:** HealthOps mark links to `/dashboard`  
- **Automation Priority:** Low | **Suites:** Regression  

### NAV-006
- **Scenario:** Active nav highlight  
- **Type:** Positive | **Priority:** P3 | **Role:** ADMIN  
- **Expected:** Current route nav link active styling  
- **Automation Priority:** Low | **Suites:** Regression  

### NAV-007
- **Scenario:** User menu open/close and escape  
- **Type:** Browser | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** Menu toggles; Escape/outside click closes  
- **Automation Priority:** Low | **Suites:** Regression  

### NAV-008
- **Scenario:** Role nav matrices match AppHeader  
- **Type:** RBAC | **Priority:** P0 | **Role:** All roles  
- **Steps:** Login each role; capture nav labels  
- **Expected:** Matches implemented `getPrimaryNav` (Admin includes Inventory/Replenish/Audit; Doctor clinical without inventory; etc.)  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Negative/RBAC, Regression  

### NAV-009
- **Scenario:** Change password route available to all authenticated roles  
- **Type:** Positive | **Priority:** P1 | **Role:** VIEWER  
- **Expected:** `/change-password` accessible via menu  
- **Automation Priority:** Medium | **Suites:** Regression  

---

## 30. RBAC / Ownership

### RBAC-001
- **Scenario:** Matrix — ADMIN can access clinical + inventory + audit  
- **Type:** RBAC | **Priority:** P0 | **Role:** ADMIN  
- **Expected:** All admin routes load  
- **Automation Priority:** Critical | **Suites:** Smoke, Negative/RBAC, Regression  

### RBAC-002
- **Scenario:** Matrix — DOCTOR clinical yes / inventory+audit+pharmacy+admin-orders no  
- **Type:** RBAC | **Priority:** P0 | **Role:** DOCTOR  
- **Expected:** Allowed pages load; forbidden URLs redirect  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### RBAC-003
- **Scenario:** Matrix — PHARMACIST pharmacy/inventory/refills yes; patients list no  
- **Type:** RBAC | **Priority:** P0 | **Role:** PHARMACIST  
- **Expected:** As above  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### RBAC-004
- **Scenario:** Matrix — PATIENT portal only  
- **Type:** RBAC | **Priority:** P0 | **Role:** PATIENT  
- **Expected:** Staff URLs redirect  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### RBAC-005
- **Scenario:** Matrix — SUPPORT/VIEWER audit only  
- **Type:** RBAC | **Priority:** P0 | **Role:** SUPPORT, VIEWER  
- **Expected:** Audit OK; patients/pharmacy redirect  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### RBAC-006
- **Scenario:** PatientA cannot view PatientB profile via crafted patient id (if attempted through any reachable UI)  
- **Type:** Ownership | **Priority:** P0 | **Role:** PATIENT  
- **Steps:** If any UI allows entering another patient id, attempt; otherwise navigate only own `/my/profile` and confirm data is own medicalId  
- **Expected:** Only own data shown; cross-access errors if forced  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### RBAC-007
- **Scenario:** PatientA cannot pay/track PatientB order IDs  
- **Type:** Ownership | **Priority:** P0 | **Role:** PATIENT  
- **Expected:** Error on pay/tracking for foreign orderId  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### RBAC-008
- **Scenario:** PatientA cannot open PatientB lab order details  
- **Type:** Ownership | **Priority:** P0 | **Role:** PATIENT  
- **Expected:** Forbidden/error  
- **Automation Priority:** Critical | **Suites:** Negative/RBAC, Regression  

### RBAC-009
- **Scenario:** Refill approve permissions by role/type  
- **Type:** RBAC | **Priority:** P1 | **Role:** PHARMACIST, DOCTOR  
- **Expected:** Matches REFILL-006 rules in UI  
- **Automation Priority:** High | **Suites:** Negative/RBAC, Regression  

### RBAC-010
- **Scenario:** Lab result upload admin-only in UI  
- **Type:** RBAC | **Priority:** P1 | **Role:** DOCTOR  
- **Expected:** Upload form absent for doctor  
- **Automation Priority:** High | **Suites:** Negative/RBAC, Regression  

---

## 31. Cross-Module E2E Workflows

### E2E-001 — Appointment request to completion
- **Type:** Workflow | **Priority:** P0 | **Roles:** PATIENT → ADMIN/DOCTOR  
- **Depends:** AUTH-006, DR-002, APREQ-001  
- **Steps:** Patient submits request → staff approves → appointment appears → Confirm → Check in → Start → Complete  
- **Expected:** Full lifecycle succeeds; patient sees completed appointment in My Appointments  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### E2E-002 — Prescription refill to paid order
- **Type:** Workflow | **Priority:** P0 | **Roles:** DOCTOR/ADMIN → PATIENT → PHARMACIST  
- **Depends:** PAT-003, DR-002, RX-002  
- **Steps:** Create ACTIVE Rx → patient refill → staff approve → patient create-order → patient pay success → pharmacist advances order to SHIPPED → patient tracks  
- **Expected:** Request FULFILLED; payment PAID; tracking visible  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### E2E-003 — Admin order fulfillment without refill
- **Type:** Workflow | **Priority:** P1 | **Roles:** ADMIN → PATIENT → PHARMACIST  
- **Steps:** Admin creates order → patient pays → pharmacy updates statuses → track  
- **Expected:** End-to-end order commerce path works  
- **Automation Priority:** High | **Suites:** Regression, Critical Workflow  

### E2E-004 — Inventory replenishment cycle
- **Type:** Workflow | **Priority:** P0 | **Roles:** PHARMACIST → ADMIN → PHARMACIST/ADMIN  
- **Steps:** Create med low stock → request replenishment → admin approve → receive qty → verify on-hand increased  
- **Expected:** Stock and request statuses correct  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### E2E-005 — Lab order to patient visibility
- **Type:** Workflow | **Priority:** P0 | **Roles:** DOCTOR/ADMIN → ADMIN → DOCTOR → PATIENT  
- **Steps:** Create lab → collect → processing → upload result+file → acknowledge → patient views/downloads  
- **Expected:** Pre-ack hidden; post-ack visible  
- **Automation Priority:** Critical | **Suites:** Smoke, Sanity, Regression, Critical Workflow  

### E2E-006 — Audit trail across mutations
- **Type:** Workflow | **Priority:** P1 | **Role:** ADMIN (+ VIEWER read)  
- **Steps:** Perform patient create, appointment status change, Rx create → open audit → filter entities  
- **Expected:** Events present for actions  
- **Automation Priority:** High | **Suites:** Sanity, Regression, Critical Workflow  

### E2E-007 — Pharmacy-assisted refill
- **Type:** Workflow | **Priority:** P1 | **Roles:** PHARMACIST (+ ADMIN/DOCTOR if renewal)  
- **Steps:** Pharmacy lookup patient → request refill on ACTIVE → approve as pharmacist → patient fulfills order  
- **Expected:** Path completes for REFILL type  
- **Automation Priority:** High | **Suites:** Regression, Critical Workflow  

### E2E-008 — Deactivated patient blocks new clinical scheduling (UI error)
- **Type:** Negative / Workflow | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Deactivate patient → attempt new appointment / request as linked patient  
- **Expected:** Operations fail with clear errors where enforced  
- **Automation Priority:** High | **Suites:** Regression, Negative  

---

## 32. Browser / Multi-tab / Dialog Scenarios

### BRW-001
- **Scenario:** `window.confirm` cancel on deactivate/delete document/dependent  
- **Type:** Browser | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** No destructive change when cancelled  
- **Automation Priority:** High | **Suites:** Regression  

### BRW-002
- **Scenario:** Track Shipment opens new tab with inherited auth  
- **Type:** Browser | **Priority:** P0 | **Role:** PATIENT  
- **Steps:** From My Orders click Track Shipment (window.open without noopener)  
- **Expected:** New tab authenticated; tracking renders (AuthContext opener hydration)  
- **Automation Priority:** Critical | **Suites:** Sanity, Regression, Critical Workflow  

### BRW-003
- **Scenario:** Payment iframe postMessage success/fail  
- **Type:** Browser | **Priority:** P0 | **Role:** PATIENT  
- **Expected:** Parent page reacts to embed messages and persists payment  
- **Automation Priority:** Critical | **Suites:** Regression, Critical Workflow  

### BRW-004
- **Scenario:** File download triggers browser download  
- **Type:** Browser | **Priority:** P1 | **Role:** ADMIN / PATIENT  
- **Expected:** Document/lab file download initiates  
- **Automation Priority:** High | **Suites:** Regression  

### BRW-005
- **Scenario:** Doctor availability persists across reload via localStorage  
- **Type:** Browser | **Priority:** P2 | **Role:** ADMIN  
- **Expected:** Slots survive reload in same browser profile  
- **Automation Priority:** Medium | **Suites:** Regression  

### BRW-006
- **Scenario:** Remember-me survives browser restart; session login does not  
- **Type:** Browser | **Priority:** P1 | **Role:** ADMIN  
- **Expected:** Matches AUTH-004/005 storage behavior  
- **Automation Priority:** High | **Suites:** Regression  

### BRW-007
- **Scenario:** Async loading indicators disappear  
- **Type:** Browser | **Priority:** P2 | **Role:** Various  
- **Steps:** Open data-heavy pages (patients, audit, inventory)  
- **Expected:** Loading text clears; content or empty/error shown  
- **Automation Priority:** Medium | **Suites:** Regression  

### BRW-008
- **Scenario:** Direct URL deep link while logged in  
- **Type:** Browser/Navigation | **Priority:** P1 | **Role:** ADMIN  
- **Steps:** Paste `/appointments/:id` while authenticated  
- **Expected:** Details load without going through list first  
- **Automation Priority:** High | **Suites:** Regression  

---

## 33. Smoke Suite Mapping

Smallest proof the app works end-to-end:

`AUTH-001, AUTH-006, AUTH-012, AUTH-016, DASH-001, DASH-003, DASH-004, PAT-001, PAT-003, PAT-011, PAT-012, PDET-001, PDET-002, DOC-001, DOC-004, DR-001, DR-002, DR-009, DR-012, APPT-001, APPT-003, APPT-007, APPT-008, APPT-015, APREQ-001, APREQ-004, APREQ-005, APREQ-009, RX-001, RX-002, REFILL-001, REFILL-005, REFILL-008, ORD-001, ORD-002, ORD-008, ORD-011, PAY-001, PAY-002, PAY-006, PAY-007, PHARM-001, PHARM-002, PHARM-009, INV-001, INV-002, INV-006, INV-009, REPL-001, REPL-002, REPL-007, AUD-001, AUD-002, AUD-007, LAB-001, LAB-002, LAB-005, LAB-008, LAB-010, LAB-014, LAB-015, LAB-016, LAB-017, PORTAL-001, NAV-001, NAV-003, NAV-004, NAV-008, RBAC-001, RBAC-002, RBAC-003, RBAC-004, RBAC-005, E2E-001, E2E-002, E2E-004, E2E-005, BRW-002, BRW-003`

**Smoke count:** 86

---

## 34. Sanity Suite Mapping

Important paths after changes (subset + key negatives):

All Smoke IDs **plus**:

`AUTH-004, AUTH-008, AUTH-010, AUTH-014, DASH-002, DASH-005, PAT-006, DEP-001, EMG-001, MEDP-001, DOC-007, DR-005, DR-006, APPT-010, APREQ-011, RX-005, REFILL-006, ORD-004, ORD-009, PAY-003, PHARM-006, PHARM-007, INV-005, INV-008, REPL-003, AUD-003, AUD-006, LAB-006, PORTAL-002, PORTAL-006, E2E-006, E2E-007`

**Sanity count:** 86 + 32 = **118** (unique IDs)

---

## 35. Regression Suite Mapping

**All test cases in this catalog** belong to Regression.

**Regression count:** see §38 total.

---

## 36. Negative / Security Suite Mapping

`AUTH-002, AUTH-003, AUTH-007, AUTH-009, AUTH-013, AUTH-015, AUTH-017, PAT-004, PAT-005, PAT-012, PDET-005, PDET-007, DEP-002, DEP-004, EMG-002, DOC-002, DOC-003, DOC-008, DR-003, DR-004, DR-009, DR-011, DR-012, APPT-004, APPT-005, APPT-006, APPT-011, APPT-013, APPT-014, APPT-015, APREQ-002, APREQ-006, APREQ-009, APREQ-010, RX-003, RX-009, REFILL-003, REFILL-006, REFILL-007, REFILL-011, ORD-003, ORD-007, PAY-003, PAY-004, PAY-006, PAY-007, PHARM-003, PHARM-008, PHARM-009, INV-003, INV-004, INV-007, INV-009, REPL-004, REPL-005, REPL-009, AUD-007, LAB-003, LAB-007, LAB-009, LAB-011, LAB-015, LAB-017, PORTAL-007, NAV-003, NAV-004, NAV-008, RBAC-001 through RBAC-010, E2E-008, BRW-001`

**Negative/RBAC/Ownership-focused count:** 78

---

## 37. Coverage Matrix

| Module | Key UI capabilities | Test IDs | Covered? |
|--------|---------------------|----------|----------|
| Auth | Login/register/reset/change/logout/lock/remember | AUTH-001–018 | Yes |
| Dashboard | Role cards | DASH-001–006 | Yes |
| Patients | CRUD list UX | PAT-001–012 | Yes |
| Patient details | Edit/deactivate/shortcuts | PDET-001–008 | Yes |
| Dependents | Staff CRUD + portal read | DEP-001–006 | Yes |
| Emergency | Staff CRUD + portal read | EMG-001–005 | Yes |
| Medical profile | Staff save + portal read | MEDP-001–004 | Yes |
| Documents | Upload/download/delete + portal | DOC-001–009 | Yes |
| Doctors | Admin CRUD/status/availability | DR-001–012 | Yes |
| Appointments | Create/lifecycle/edit/cancel | APPT-001–016 | Yes |
| Appt requests | Submit/review/approve | APREQ-001–011 | Yes |
| Prescriptions | Create/status/delete | RX-001–009 | Yes |
| Refill/renewal | Request/review/fulfill | REFILL-001–011 | Yes |
| Orders | Admin + patient create/status | ORD-001–012 | Yes |
| Payments | Embed pay success/fail/ownership | PAY-001–008 | Yes |
| Pharmacy | Lookup/update/refill | PHARM-001–009 | Yes |
| Inventory | Create/adjust/filter/request | INV-001–010 | Yes |
| Replenishment | Approve/receive/cancel | REPL-001–009 | Yes |
| Audit | Filters/pagination/trail | AUD-001–008 | Yes |
| Lab | Full lifecycle + patient gate | LAB-001–018 | Yes |
| Portal | Profile/nav/tracking | PORTAL-001–007 | Yes |
| Nav | Guards/redirects/nav matrix | NAV-001–009 | Yes |
| RBAC | Role/ownership matrix | RBAC-001–010 | Yes |
| E2E | Cross-module | E2E-001–008 | Yes |
| Browser | Tabs/dialogs/iframe/downloads | BRW-001–008 | Yes |

### Intentionally limited / notes

| Item | Reason |
|------|--------|
| Admin Users CRUD UI | **No dedicated users management page** in frontend — cannot UI-test user admin CRUD; SUPPORT/VIEWER require pre-seeded users |
| Hard delete patient | UI exposes deactivate; permanent delete API not exposed as primary UI action |
| Stock movements dedicated page | Inventory adjusts quantity in UI; dedicated movements viewer may be absent — covered via quantity change (INV-006/010) |
| Real email reset | Not implemented — AUTH-010/012 use app’s current token exposure behavior |
| Real payment/courier | Demo only — still tested as implemented |
| Doctor availability backend | localStorage only — tested as client feature (DR-010, BRW-005) |
| Dashboard Lab card | Lab accessed via header nav (LAB-018); no dashboard lab card in current UI |

---

## 38. Final Coverage Summary

| Metric | Value |
|--------|-------|
| Modules / areas with UI cases | 26 sections with cases (Auth→Browser) |
| Total test cases | **243** |
| Cross-module E2E workflows | **8** (`E2E-001`–`E2E-008`) |
| Smoke suite IDs | **86** |
| Sanity suite IDs | **118** |
| Regression suite IDs | **243** (all) |
| Negative/RBAC/ownership-focused IDs | **78** |
| Critical Workflow suite | `E2E-001`–`E2E-007`, plus embedded workflow-tagged module cases (`APPT-008`, `REFILL-008`, `PAY-002`, `LAB-015/016`, `REPL-007`, …) |

### Dependency sketch (high level)

```text
AUTH-001/006
  → PAT-003 → PDET/DEP/EMG/MEDP/DOC
  → DR-002 → APPT-003 / APREQ-001 → E2E-001
  → RX-002 → REFILL-001 → REFILL-005 → REFILL-008 → PAY-002 → E2E-002
  → INV-002 → INV-008 → REPL-002 → REPL-007 → E2E-004
  → LAB-002 → LAB-006 → LAB-008 → LAB-010 → LAB-016 → E2E-005
  → AUD-006 / E2E-006
```

### Confirmations

- Catalog based on current frontend routes/pages and backend rules affecting UI.
- **No API test cases** included.
- **No automation code** created.
- Roadmap-only features excluded.
- Every implemented major UI module above has explicit coverage; exclusions called out in §37.

---

*End of UI Functional E2E Test Case Catalog*
