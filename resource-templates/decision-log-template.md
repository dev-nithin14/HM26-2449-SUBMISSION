# HM26-2449 — PHASE 1 DECISION LOG

**Project:** ReBuild Mysore — Intelligent Construction Waste Management for Mysuru  
**Team:** Nithin B C | Somashekar N | Adithya S Yadav | Touheed Khan  
**Sub-problem:** End-to-end construction-waste coordination  
**Date:** 19 September 2026

## 1. Approach Taken and Alternative Rejected

We chose to build a traceable, role-based workflow that connects construction-waste reporting to verification, prioritisation, collection, processing and material recovery.

A report begins with waste type, quantity, location and image information. Our prototype AI-analysis layer provides signals such as waste composition, recyclability, image quality, contamination and duplicate probability. These signals are combined with operational factors including quantity, waste type, report age, location sensitivity and recyclability to calculate LOW, MEDIUM, HIGH or CRITICAL priority. The report can then move through verification, routing, collection and processing stages.

We considered a simpler complaint or voting system where reports would mainly be ordered by reporting frequency. This would have been easier to implement within 72 hours, but it would not represent the operational factors involved in construction-waste collection and recovery.

## 2. Why We Rejected the Alternative and the Trade-off

| Dimension | Our approach | Rejected alternative |
|---|---|---|
| Prioritisation | Multiple operational factors | Mainly report frequency |
| Verification | Separate verification workflow | Basic submission handling |
| Traceability | Report → Collection → Processing → Recovery | Primarily complaint tracking |
| Implementation effort | Higher | Lower |

The deciding factor was operational usefulness. A frequently reported waste location is not necessarily the most urgent collection task. Quantity, waste type, age, location sensitivity and recyclability can change the priority of a report.

We therefore accepted greater implementation complexity within the 72-hour hackathon in exchange for demonstrating a complete operational lifecycle. We also consciously accepted limitations: the AI layer is a prototype, collection zones are synthetic demo data, and the current MVP is online-first. We chose to document these limitations rather than present them as production-ready capabilities.

## 3. What Could Break at Mysuru Scale?

If ReBuild Mysore expands across approximately 65 wards and surrounding areas, the main challenges would be increased report volume, image processing, verification workload, connectivity and jurisdiction management.

| What breaks first | Why | How we'd fix it |
|---|---|---|
| API/database workload | Thousands of reports could increase request and storage load | Indexing, caching, object storage and horizontal scaling |
| AI processing | Large numbers of images could increase latency | Asynchronous queues and optimized inference |
| Verification workload | More reports would increase duplicate and suspicious cases | Automated pre-filtering and reviewer queues |
| Jurisdiction management | City-wide deployment requires authoritative boundaries | Integrate verified municipal GIS data |
| Connectivity | Patchy connectivity can interrupt API-dependent reporting | Offline queues, retry logic and conflict handling |

Our first scaling change would be to introduce **reliable asynchronous processing**, so image analysis and other background operations do not block the main reporting and operational workflows.

**Core lifecycle:**  
Report → AI Analysis → Verify → Prioritize → Assign → Collect → Process → Recycle → Measure Impact