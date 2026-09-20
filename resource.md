# HackMysuru 1.0 — Phase 1 Resources

## Team Details

**Team ID:** HM26-2449  
**Project:** ReBuild Mysore — Turning Construction Waste into Community Value  
**Institution:** Maharaja Institute of Technology Mysore

### Team Members

| Name | Role | Profile |
|---|---|---|
| Nithin B C | Team Lead |- |
| Somashekar N | Developer | - |
| Adithya S Yadav | Developer | - |
| Touheed Khan | Developer | - |

---

## Live MVP

**Live Application:**  
https://frontend-black-two-20.vercel.app/

**Backend API:**  
https://rebuild-mysore-backend-44pn.onrender.com

**Backend Health Check:**  
https://rebuild-mysore-backend-44pn.onrender.com/api/health

The deployed MVP demonstrates the core ReBuild Mysore workflow for reporting, analysing, verifying, prioritising, assigning, collecting, processing and tracking construction waste.

---

## Source Code

**GitHub Repository:**  
https://github.com/dev-nithin14/HM26-2449-SUBMISSION

The repository contains the frontend, backend, service/repository architecture, documentation and supporting implementation files.

---

# Submission Artifacts

## 1. Decision Log

**Decision Log PDF:**  
https://drive.google.com/file/d/1C7nk-ZhYoaZR8XaGkHq80LbZjHV5ZF3q/view?usp=drive_link

**SHA-256 — first 16 characters:**  
72f334b1b44c822e

The SHA-256 value corresponds to the final Decision Log PDF submitted for the Phase 1 submission.

---

## 2. Presentation

**Presentation PDF:**  
https://drive.google.com/file/d/1S7OqyERhoywJV9Y0HT0W42k_xKrZdSga/view?usp=drive_link

**SHA-256 — first 16 characters:**  
9893d1ffb2b6bcf3

## 3. Demo Video

**Video:**  
https://drive.google.com/file/d/1ydYaPqazPkoHaS7izbdmg_2GkRwwcRVB/view?usp=sharing

**SHA-256 — first 16 characters:**  
40d26d5b8a4d9388

### Video Chapter Timestamps

- 00:00 — Problem and Hook
- 01:00 — Personas and Use Case
- 02:00 — Core MVP Flow
- 04:00 — Bad Input / Validation Test
- 05:00 — Architecture
- 06:00 — Data Model and APIs
- 07:00 — Core Logic and AI Disclosure
- 08:00 — Decisions and Trade-offs
- 09:00 — Scaling Discussion
- 09:40 — Final Summary

---

# Project Overview

ReBuild Mysore is a construction-waste management platform designed to connect waste reporting, verification, prioritisation, collection, processing and recycling into a traceable workflow.

The system focuses on making construction waste easier to report, manage and route toward reuse or recycling instead of allowing reusable material to become unmanaged waste.

## Core Workflow

**Report → Analyze → Verify → Prioritize → Assign → Collect → Process → Recycle → Measure Impact**

---

# Technical Architecture

### Frontend

- React
- TypeScript
- Vite
- Responsive mobile-first interface
- Leaflet / OpenStreetMap for location selection
- Recharts for analytics

### Backend

- Node.js
- Express
- TypeScript
- REST APIs
- Service layer
- Repository layer

### Database and Authentication

- Supabase PostgreSQL
- Supabase Authentication
- Persistent application data
- Role-aware application workflows

### Deployment

- Frontend: Vercel
- Backend: Render
- Database and Authentication: Supabase

### AI

The MVP includes a prototype AI-analysis layer used as decision support.

Prototype analysis considers signals such as:

- Waste/material type
- Quantity
- Image quality
- Contamination
- Recyclability
- Duplicate probability

AI outputs are treated as decision-support signals and are not presented as a production-grade autonomous decision system.

---

# Core Application Flow

### 1. Report

A user submits construction-waste information including:

- Waste type
- Quantity
- Location
- Image/evidence

### 2. Analyze

The system generates prototype analysis signals for the submitted report.

### 3. Verify

Reports can be reviewed and checked before entering downstream operations.

### 4. Prioritize

Priority is determined using multiple factors including:

- Quantity
- Waste type
- Report age
- Location sensitivity
- Recyclability
- Duplicate probability

### 5. Assign

Verified reports can be assigned for collection.

### 6. Collect

Collection activity is tracked through the workflow.

### 7. Process

Collected material can be moved into processing stages.

### 8. Recycle

The system tracks the material toward reuse/recycling outcomes.

### 9. Measure Impact

The platform provides impact-oriented tracking for processed/recycled material.

---

# Data and Scope

The MVP uses seeded/demo Mysuru records and project-defined demonstration collection zones.

These records are intended for demonstrating the system workflow and are **not claimed to represent official municipal boundaries, live municipal datasets or production municipal operations**.

---

# Current Limitations

- The current system is online-first and depends on network access for API/backend/Supabase operations.
- Offline-first operation is not implemented in the MVP.
- AI analysis is prototype-level decision support.
- No custom production ML model training or measured production ML accuracy is claimed.
- Government-grade identity verification is outside the Phase 1 scope.
- Production-scale municipal authorisation and abuse prevention are outside the MVP scope.
- Demonstration collection zones are not authoritative municipal GIS boundaries.

---

# Key Architectural Decision

The project deliberately uses a layered architecture:

**React Frontend → REST API → Express Backend → Service Layer → Repository Layer → Supabase PostgreSQL**

This separation keeps business logic independent from the persistence implementation and provides a path for future scaling and infrastructure changes.

---

# Decision Log Summary

The selected Phase 1 approach focuses on a lightweight digital platform for discovering and reusing construction materials.

The team considered a larger system involving a more complex backend, database, AI, maps and stakeholder workflows, but rejected that alternative for the 72-hour Phase 1 constraint.

The primary trade-off was **feature breadth versus implementation reliability**.

The team intentionally prioritised a focused MVP that could demonstrate the core concept reliably, while leaving more advanced AI, location-based capabilities and larger workflow expansion for future iterations.

---

# Documentation

Additional technical documentation is available in the repository:

- `README.md` — Project overview and setup
- `docs/setup.md` — Local development and configuration
- `docs/architecture.md` — System architecture
- `docs/constraints.md` — Project constraints
- `docs/limitations.md` — Current limitations and future scope
- `ai.md` — AI usage disclosure

---

# Reviewer Quick Path

For a quick evaluation:

1. Open the **Live MVP**
2. Review the **GitHub Repository**
3. Follow the main reporting workflow
4. Review the architecture documentation
5. Review the **Decision Log**
6. Review the presentation and demo video

---

# AI Usage Disclosure

AI-assisted development tools were used during the project for development assistance, debugging, documentation, ideation and implementation support.

The team reviewed and integrated the resulting work into the project and remains responsible for understanding and explaining the submitted implementation.

The runtime AI component is explicitly treated as a prototype decision-support mechanism rather than a production-grade autonomous AI system.

---

# Phase 1 Submission Checklist

- [x] Public GitHub repository
- [x] Live MVP
- [x] Resource file
- [x] Decision Log PDF
- [x] Presentation PDF
- [x] Demo Video
- [x] Final SHA-256 values
- [x] Final Google Drive links
- [x] Final resource.md verification

---

## Declaration

The links and artifacts listed in this document correspond to the team's Phase 1 submission for **HackMysuru 1.0**.

Any demo data, collection zones, AI outputs or prototype capabilities are presented within the stated scope and limitations of the MVP.