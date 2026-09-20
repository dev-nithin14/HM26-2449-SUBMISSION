# The Five Hard Constraints

[← Back to README](../README.md)

The following constraints are treated as core engineering considerations for ReBuild Mysore. The implementation status reflects the current hackathon MVP and does not claim production-level municipal deployment.

| # | Constraint | Status | Video |
|---|---|---|---|
| 1 | Fake, spam and harassment reports | ⚠️ Partial | TBD |
| 2 | Unclear jurisdiction | ⚠️ Partial | TBD |
| 3 | Prioritisation beyond "most votes" | ✅ Handled | TBD |
| 4 | Bad input (duplicate, fake photo, wrong location, abuse) | ⚠️ Partial | TBD |
| 5 | Works without internet | ⚠️ Partial | TBD |

---

## 1. Fake, spam and harassment reports

- **Approach:** The MVP uses input validation, duplicate-probability analysis, verification workflow and role-based review. Reports can be flagged as `DUPLICATE` or `REJECTED` instead of automatically entering the collection workflow.
- **Human review:** Verification is kept as a separate workflow so AI/prototype analysis is not treated as the final decision.
- **Authentication:** Supabase Authentication provides application-level user authentication. However, the MVP does not provide government-grade identity verification or a production-scale abuse-prevention system.
- **Anonymity trade-off:** The current MVP focuses on authenticated, role-based reporting and workflow verification rather than anonymous reporting. Production deployment would require stronger identity, abuse-prevention and moderation mechanisms.
- **Code:** `src/backend/`

---

## 2. Unclear jurisdiction

- **Approach:** The MVP contains a routing/jurisdiction service that maps reports to project-defined collection zones.
- **Boundary cases:** Reports that do not clearly map to a zone can remain in the operational workflow for review rather than being silently assigned to an incorrect jurisdiction.
- **Important limitation:** The collection zones used by the MVP are synthetic/demo zones around Mysuru. They are **not official municipal ward or panchayat boundaries**.
- **Future requirement:** Production deployment would require verified and authorized municipal/GIS boundary data.
- **Code:** `src/backend/`

---

## 3. Prioritisation

- **Formula / rules:** Priority is calculated using multiple signals rather than report count alone. Current factors include:
  - Waste quantity
  - Waste type
  - Report age
  - Location sensitivity
  - Recyclability
  - Duplicate probability

The resulting priority is classified as `LOW`, `MEDIUM`, `HIGH` or `CRITICAL`, with reasons returned alongside the result.

- **Why not simply "most votes":** Construction-waste management depends on operational factors such as quantity, environmental/location sensitivity, urgency and recyclability. Therefore, report frequency alone is insufficient for deciding collection priority.
- **Code:** `src/backend/`

---

## 4. Bad input

| Input | What our system does |
|---|---|
| Duplicate report | Uses duplicate-probability analysis and verification workflow; reports can be marked `DUPLICATE`. |
| Fake / unrelated photo | Image-quality and AI-analysis signals are used as prototype indicators. Final verification is not fully automated. |
| Wrong or impossible location | Location data is validated and passed through the routing/jurisdiction workflow. The current MVP does not claim complete geospatial validation. |
| Abusive message | The MVP does not currently provide a dedicated production-grade abuse/moderation system. |
| Invalid form/API data | React Hook Form/Zod and backend validation reject malformed input before processing. |

---

## 5. Offline operation

- **What works offline:** The current MVP does not provide a complete offline-first citizen reporting workflow.
- **How it syncs:** No production-grade offline queue and conflict-resolution mechanism is currently implemented.
- **What does not work offline:** Report submission, AI analysis, routing and other API-dependent operations require the application/backend to be reachable.
- **How to test:** The current MVP should be treated as an online-first prototype. Offline support is a planned improvement rather than a completed feature.

---

## Supabase and Persistence

The final MVP uses **Supabase** as the persistent backend and database layer.

- Supabase Authentication provides application-level authentication.
- Supabase PostgreSQL provides persistent storage for application data.
- The application uses repository and service layers to separate business logic from persistence.
- Authentication and persistent data therefore replace the earlier prototype assumption of fixed client-side demo credentials and in-memory application state.

The project does not claim that Supabase integration by itself provides government-grade identity verification, complete abuse prevention or municipal authorization.

---

## Current Constraint Summary

The strongest implemented constraint handling in the MVP is the multi-factor prioritisation workflow and the separation of verification, routing and operational stages.

The main limitations are production-grade abuse prevention, official jurisdiction data, comprehensive input moderation and complete offline operation.

These limitations are documented explicitly rather than being presented as solved capabilities.