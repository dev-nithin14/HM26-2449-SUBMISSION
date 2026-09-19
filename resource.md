# HackMysuru 1.0 — Phase 1 Submission Index

> **This is the landing file for our submission.**
> Reviewers can use this file to access the repository documents, live MVP, and final evaluation artifacts.

---

## 1. Team Details

| Field | Value |
|---|---|
| Team ID | `HM26-2449` |
| Team Name | `ReBuild Mysore` |
| College | `Maharaja Institute of Technology Mysore` |
| Team Leader | `Nithin B C` |
| Repository | `https://github.com/dev-nithin14/HM26-2449-SUBMISSION` |

| # | Member | Program & Year | GitHub Handle | Primary Role |
|---|---|---|---|---|
| 1 | `Nithin B C` | `B.E. CSE-AI&ML` | `@dev-nithin14` | `Frontend / Integration` |
| 2 | `Somashekar N` | `B.E. CSE-AI&ML` | `@<handle>` | `<role>` |
| 3 | `Adithya S Yadav` | `B.E. CSE-AI&ML` | `@<handle>` | `<role>` |
| 4 | `Touheed Khan` | `B.E. CSE-AI&ML` | `@<handle>` | `<role>` |

> Replace the remaining GitHub handles and roles with the actual team details before submission.

---

## 2. What We Built

**Sub-problem:** `End-to-end construction-waste coordination`

**In one sentence:**  
`ReBuild Mysore is a role-based civic platform that connects construction-waste reporting with AI-assisted analysis, verification, prioritisation, collection, processing, recycling, and impact tracking.`

---

## 3. Repository Documents

| Document | What it covers |
|---|---|
| [README.md](./README.md) | Problem, target users, solution, architecture, AI usage, setup and limitations |
| [ai.md](./ai.md) | AI tools used during development and AI/ML functionality inside the product |
| [docs/architecture.md](./docs/architecture.md) | System architecture, components, data model, APIs and technical stack |
| [docs/constraints.md](./docs/constraints.md) | Handling of the five hard constraints |
| [docs/setup.md](./docs/setup.md) | Local setup, environment configuration, demo accounts and testing |
| [docs/limitations.md](./docs/limitations.md) | Known limitations, edge cases and scaling roadmap |
| [resource-templates/](./resource-templates/) | Submission templates and supporting guides |

---

## 4. Submission Artifacts

| # | Artifact | Link | File Name | SHA-256 (first 16 chars) |
|---|---|---|---|---|
| 1 | Pitch + Code Walkthrough Video (≤ 10 min) | `TO BE ADDED` | `HM26-2449_video.mp4` | `TO BE ADDED` |
| 2 | Decision Log (1 page) | `TO BE ADDED` | `HM26-2449_decision-log.pdf` | `TO BE ADDED` |
| 3 | Presentation | `TO BE ADDED` | `HM26-2449_presentation.pdf` | `TO BE ADDED` |

> All final evaluation artifacts will be uploaded to Google Drive with Viewer access and linked here before the submission freeze.

### Video Chapters

> Update these timestamps after the final recording. The structure below follows the required evaluation flow.

| Timestamp | Section |
|---|---|
| `00:00` | Problem & target users |
| `00:40` | Live MVP — core journey |
| `02:00` | Bad-input / duplicate handling |
| `02:40` | Offline / connectivity limitation |
| `03:10` | Architecture overview |
| `04:20` | Data model & APIs |
| `05:20` | Core logic walkthrough |
| `06:40` | Decisions & trade-offs |
| `07:40` | Mysuru-scale limitations |
| `08:40` | AI usage & disclosure |
| `09:20` | Closing / team |

---

## 5. Live MVP

| Field | Value |
|---|---|
| Live URL | `https://hm-26-2449-submission.vercel.app/` |
| Platform | `Web Application` |
| Database | `Demo / repository-based persistence; Supabase is not currently connected to this MVP` |
| Sample data loaded? | `Yes — fictional/demo Mysuru records` |
| Offline mode | `The current MVP is online-first. API-dependent operations require network connectivity.` |
| Local setup | Follow [docs/setup.md](./docs/setup.md) |

### Demo Accounts

All demo accounts use the password:

`demo123`

| Role | Demo Email |
|---|---|
| Citizen | `citizen@rebuildmysore.demo` |
| Builder | `builder@rebuildmysore.demo` |
| Collection Crew | `collection@rebuildmysore.demo` |
| Processing Plant | `processing@rebuildmysore.demo` |
| MCC Admin | `admin@rebuildmysore.demo` |

The login page provides role cards that automatically fill the corresponding demo credentials.

---

## 6. Quick Reviewer Path

A reviewer can understand the core workflow in approximately 3 minutes:

1. Open the [live MVP](https://hm-26-2449-submission.vercel.app/).
2. Use the **Citizen** demo account to submit/view a construction-waste report.
3. Observe AI-assisted analysis, verification and priority information associated with the report.
4. Use the **Collection Crew**, **Processing Plant**, or **MCC Admin** demo account to explore the corresponding operational dashboards.
5. Follow the report lifecycle from **Report → Verify → Prioritize → Collect → Process → Recycle → Impact**.

---

## 7. Core Evaluation Areas

The MVP demonstrates:

- Construction-waste reporting with structured information.
- AI-assisted waste analysis signals.
- Duplicate and verification checks.
- Priority calculation using multiple operational factors.
- Role-based workflows for citizens, builders, collection teams, processing teams and administrators.
- Collection and processing traceability.
- Material recovery and recycled-product tracking.
- Analytics and impact-oriented views.
- API-based frontend/backend architecture.
- Demo Mysuru locations and records clearly treated as prototype data.

---

## 8. Declaration

- [ ] All Google Drive links open in an incognito/private window with **Viewer** access.
- [ ] The final video is one continuous recording and is within the required time limit.
- [ ] The Decision Log is one page and written by the team in our own words.
- [ ] All AI tools used during development and inside the product are disclosed in [ai.md](./ai.md).
- [ ] No challenge-specific code was written before `18 September 2026, 00:00 IST`.
- [ ] Final artifact links and SHA-256 hashes will be frozen before the submission deadline.

---

**Submitted by:** `Nithin B C`  
**Team ID:** `HM26-2449`  
**Project:** `ReBuild Mysore`