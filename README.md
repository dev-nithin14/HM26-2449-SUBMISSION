# ReBuild Mysore — Intelligent Construction Waste Management for Mysuru

> HackMysuru 1.0 · Phase 1 · Civic Governance & Clean Mysuru  
> Team `HM26-2449`

| 📎 Submission links | 📋 Templates | 🏗️ Architecture | 🛡️ Hard constraints | ⚙️ Setup | 🤖 AI usage | ⚠️ Limitations |
|---|---|---|---|---|---|---|
| [resource.md](./resource.md) | [resource-templates/](./resource-templates/) | [docs/architecture.md](./docs/architecture.md) | [docs/constraints.md](./docs/constraints.md) | [docs/setup.md](./docs/setup.md) | [ai.md](./ai.md) | [docs/limitations.md](./docs/limitations.md) |

---

## 1. Problem Understanding

### Chosen sub-problem: Construction & Demolition Waste Management

Construction and demolition activities generate significant quantities of waste, but the journey from reporting waste to its collection, processing and recycling can be fragmented. Citizens and builders may not have a simple way to report waste and track what happens after a report is submitted. Collection teams need clear information about what needs to be collected and where it is located, while processing teams need traceability of recovered materials.

ReBuild Mysore addresses this gap by creating a unified digital workflow for construction-waste management. Instead of treating a waste report as an isolated complaint, the platform tracks it through analysis, verification, prioritization, collection, processing and recycling.

We chose this sub-problem because construction waste management involves multiple actors and stages, making traceability and coordination important. The goal of the MVP is to demonstrate a connected workflow where a waste report can progress from initial submission to measurable recycling impact.

### What "solved" looks like for us

A construction-waste report should have a clear lifecycle:

**Report → Analyze → Verify → Prioritize → Assign → Collect → Process → Recycle → Measure Impact**

The system should provide visibility into this lifecycle for the relevant users.

---

## 2. Target Users & Mysuru Context

| User | Their situation | What they need from us |
|---|---|---|
| **Citizen** | Encounters construction or demolition waste in their locality | Report waste, provide evidence/location and track the report |
| **Builder** | Generates construction waste during project activities | Manage waste responsibly and coordinate its movement |
| **Collection Team** | Handles assigned waste collection operations | View assignments, locations and collection requirements |
| **Processing Team** | Receives collected construction waste for processing | Track incoming material, processing and material recovery |
| **Admin** | Oversees the overall waste-management workflow | Monitor reports, operations, analytics and impact |

### Local context we designed for

The MVP is designed around a Mysuru-focused construction-waste management workflow. It considers location-based reporting, coordination between different operational roles, traceability of waste movement and visibility into recycling outcomes.

The current demonstration uses seeded/demo data and demonstration collection zones rather than claiming to represent official municipal boundaries or live municipal data.

### Demo access

Demo accounts are available directly from the ReBuild Mysore login page. Select a role under **Demo Access** and its fixed demo credentials will be populated automatically for hackathon evaluation.

---

## 3. Solution Overview

**ReBuild Mysore** is a civic-tech platform that connects construction-waste reporting with the downstream collection, processing and recycling workflow. A report can be analyzed, verified and prioritized before being assigned for collection, after which the material can be tracked through processing and recovery.

### Core flow

1. **Citizen/Builder reports construction waste** with relevant details, evidence and location.
2. **The system analyzes and verifies the report**, including waste characteristics and potential duplicates.
3. **The system prioritizes and routes the report** for the appropriate collection workflow.
4. **Collection and processing teams update the waste lifecycle**, allowing recovered materials and recycling impact to be tracked.

### Core journey

```text
Report
   ↓
Analyze
   ↓
Verify
   ↓
Prioritize
   ↓
Assign
   ↓
Collect
   ↓
Process
   ↓
Recycle
   ↓
Measure Impact