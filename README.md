# ReBuild Mysore — Intelligent Construction Waste Management for Mysuru

> **HackMysuru 1.0 · Phase 1 · Civic Governance & Clean Mysuru**  
> **Team `HM26-2449`**

| 📎 Submission links | 📋 Templates | 🏗️ Architecture | 🛡️ Hard constraints | ⚙️ Setup | 🤖 AI usage | ⚠️ Limitations |
|---|---|---|---|---|---|---|
| [resource.md](./resource.md) | [resource-templates/](./resource-templates/) | [docs/architecture.md](./docs/architecture.md) | [docs/constraints.md](./docs/constraints.md) | [docs/setup.md](./docs/setup.md) | [ai.md](./ai.md) | [docs/limitations.md](./docs/limitations.md) |

---

## 1. Problem Understanding

### Chosen sub-problem: Construction & Demolition Waste Management

Construction and demolition activities generate significant quantities of waste, but the journey from reporting waste to collection, processing and recycling can be fragmented. Citizens and builders may not have a simple way to report waste and track what happens after a report is submitted. Collection teams need clear information about what needs to be collected and where it is located, while processing teams need traceability of recovered materials.

**ReBuild Mysore** addresses this gap by creating a unified digital workflow for construction-waste management. Instead of treating a waste report as an isolated complaint, the platform tracks it through analysis, verification, prioritization, collection, processing and recycling.

The MVP demonstrates a connected workflow where a waste report can progress from initial submission to measurable recycling impact.

### What "solved" looks like for us

A construction-waste report should have a clear lifecycle:

**Report → Analyze → Verify → Prioritize → Assign → Collect → Process → Recycle → Measure Impact**

The system provides visibility into this lifecycle for the relevant users.

---

## 2. Target Users & Mysuru Context

| User | Their situation | What they need from us |
|---|---|---|
| **Citizen** | Encounters construction or demolition waste in their locality | Report waste, provide evidence/location and track the report |
| **Builder** | Generates construction waste during project activities | Report and manage waste responsibly and coordinate its movement |
| **Collection Team** | Handles assigned waste collection operations | View assignments, locations and collection requirements |
| **Processing Team** | Receives collected construction waste for processing | Track incoming material, processing and material recovery |
| **Admin** | Oversees the overall waste-management workflow | Monitor reports, operations, analytics and impact |

### Local context we designed for

The MVP is designed around a Mysuru-focused construction-waste management workflow. It considers location-based reporting, coordination between operational roles, traceability of waste movement and visibility into recycling outcomes.

The current demonstration uses seeded/demo data and demonstration collection zones. It does **not** claim to represent official municipal boundaries, live municipal operations or live municipal datasets.

---

## 3. Solution Overview

**ReBuild Mysore** is a civic-tech platform that connects construction-waste reporting with the downstream collection, processing and recycling workflow.

A report can be analyzed, verified and prioritized before being assigned for collection. After collection, the material can be tracked through processing and recovery, allowing the system to measure the resulting recycling impact.

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
```

---

## 4. Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Leaflet / map-based location selection

### Backend & Data

- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase database services

### AI & Decision Support

- Waste-report analysis
- Waste classification
- Duplicate-report detection
- Priority scoring
- Rule-based verification and routing

### Development

- Git & GitHub
- VS Code
- Docker-based development support where applicable

---

## 5. Supabase Architecture

Supabase is used as the application's persistent backend and database layer.

The final architecture separates the application workflow from direct database access through repository and service layers. This allows the domain workflow to remain decoupled from the underlying persistence implementation.

The system uses Supabase for:

- User authentication
- Persistent application data
- PostgreSQL relational storage
- Role-based application data
- Waste reports and lifecycle information
- Collection and processing records
- Analytics and impact data

See [docs/architecture.md](./docs/architecture.md) for the detailed architecture and data flow.

---

## 6. End-to-End Workflow

The platform follows the lifecycle:

```text
User
  ↓
Report Waste
  ↓
Analyze
  ↓
Verify
  ↓
Prioritize
  ↓
Assign Collection
  ↓
Collect Waste
  ↓
Process Material
  ↓
Recycle / Recover
  ↓
Measure Environmental Impact
```

Each stage contributes information to the next stage, creating a traceable waste lifecycle rather than an isolated reporting system.

---

## 7. Key Features

### Waste Reporting

Users can submit construction-waste reports with:

- Waste details
- Location
- Evidence
- Quantity and relevant characteristics
- Additional report information

### Analysis & Verification

The system evaluates submitted reports using analysis and verification logic to identify waste characteristics, potential duplicates and report validity.

### Priority Management

Reports can be prioritized using multiple factors such as:

- Waste characteristics
- Location
- Quantity
- Verification information
- Operational requirements

### Collection Workflow

Collection teams can view and manage assigned waste collection activities and update the lifecycle of a report.

### Processing & Recovery

Processing teams can record incoming material, processing information and recovered materials.

### Traceability

The platform maintains a lifecycle view of waste from the original report through collection, processing and recycling.

### Impact Measurement

The system calculates environmental-impact indicators based on the recorded material recovery and recycling information.

---

## 8. User Roles

The application supports role-specific workflows for:

- **Citizen**
- **Builder**
- **Collection Team**
- **Processing Team**
- **Admin**

Access to application functionality is controlled through the application's authentication and role-management flow.

---

## 9. AI Usage

AI-assisted functionality is used as a decision-support component rather than as an autonomous authority.

The project uses AI-related logic for areas such as:

- Waste classification
- Report analysis
- Duplicate detection
- Priority/decision support

Where deterministic rules are used instead of a trained model, the system documents them as rule-based logic rather than presenting them as machine-learning predictions.

See [ai.md](./ai.md) for the project's AI disclosure.

---

## 10. Data & Demonstration Scope

The current MVP is designed to demonstrate the complete application workflow.

The demonstration environment may contain:

- Seeded Mysuru-focused data
- Demonstration collection zones
- Test users
- Test waste reports
- Demonstration processing and recycling records

These datasets are intended for demonstration and evaluation. They should not be interpreted as official municipal datasets or live municipal operational data.

---

## 11. Limitations

The MVP has limitations that are documented separately.

These include limitations related to:

- Demonstration/seeded data
- Real-world municipal integration
- Network availability
- AI model maturity
- Operational deployment
- Scale and production infrastructure

See [docs/limitations.md](./docs/limitations.md) for the detailed limitations and known constraints.

---

## 12. Setup

To run the project locally, configure the required environment variables and Supabase project credentials, install the project dependencies and start the frontend/backend components as described in:

[docs/setup.md](./docs/setup.md)

---

## 13. Project Documentation

| Document | Purpose |
|---|---|
| [`docs/setup.md`](./docs/setup.md) | Local setup and Supabase configuration |
| [`docs/architecture.md`](./docs/architecture.md) | System architecture and data flow |
| [`docs/constraints.md`](./docs/constraints.md) | Hard constraints and implementation boundaries |
| [`docs/limitations.md`](./docs/limitations.md) | Known limitations and demonstration scope |
| [`ai.md`](./ai.md) | AI usage and disclosure |
| [`resource.md`](./resource.md) | Final submission resources and artifacts |

---

## 14. Submission

**HackMysuru 1.0 — Phase 1**

**Team:** `HM26-2449`

**Project:** ReBuild Mysore

**Theme:** Civic Governance & Clean Mysuru

The final submission resources, decision log, presentation and demonstration video will be linked through [`resource.md`](./resource.md).