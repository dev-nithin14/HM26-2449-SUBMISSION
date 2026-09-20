# Known Limitations & Future Scope

[← Back to README](../README.md)

## What Doesn't Work Yet

| Limitation | Why it exists | What we'd do next |
|---|---|---|
| **AI analysis is prototype-level** | The current AI/decision-support layer is intended for demonstration and does not represent a production-validated construction-waste ML system | Train and evaluate construction-waste-specific models using a representative dataset and measurable evaluation metrics |
| **Official jurisdiction data is not integrated** | The MVP uses project-defined demonstration collection zones rather than verified official municipal GIS boundaries | Integrate authorized MCC/KGIS or other authoritative GIS datasets |
| **Production-scale identity verification is not implemented** | Supabase Authentication provides application authentication, but the MVP does not implement government-grade identity verification or production-scale identity management | Add stronger identity verification, authorization controls and operational account-management processes |
| **Complete offline-first reporting is not implemented** | Network-dependent operations require connectivity to communicate with the application backend and Supabase | Add local storage, queued submissions, retry handling, synchronization and conflict resolution |
| **Production-grade abuse prevention is limited** | The MVP focuses on validation, duplicate-detection signals and verification rather than a full production moderation system | Add rate limiting, stronger identity controls, abuse detection, moderation workflows and audit mechanisms |
| **City-scale performance has not been measured** | The MVP was developed and evaluated as a hackathon prototype and has not undergone comprehensive city-scale load testing | Conduct load testing and optimize database queries, APIs, storage, background processing and infrastructure |
| **Live municipal operational integration is not implemented** | The MVP demonstrates the workflow using project data rather than live municipal systems | Integrate authorized municipal systems and operational data through approved APIs or data-sharing mechanisms |

---

## Edge Cases We Don't Fully Handle

The MVP does not fully address every possible real-world operating condition, including:

- GPS spoofing or deliberately manipulated location data
- Coordinated spam from multiple accounts or devices
- Highly ambiguous waste images that cannot be reliably classified
- Reports involving locations outside the configured demonstration collection zones
- Conflicting updates made simultaneously by multiple operational users
- Complete offline synchronization and conflict resolution
- Government-grade identity verification
- Complex municipal jurisdiction overlaps
- Large-scale operational scheduling across multiple collection teams
- Adversarial or intentionally misleading waste-report information

These cases are documented as future engineering and deployment requirements rather than being presented as completely solved problems.

---

## Authentication Scope

The final MVP uses **Supabase Authentication** for application authentication.

This replaces the earlier prototype approach based on fixed client-side demo credentials.

However, the authentication implementation should not be interpreted as a complete production identity-management system. A real municipal deployment could require additional controls such as:

- Stronger identity verification
- Account recovery and lifecycle management
- Administrative approval workflows
- Audit logging
- Role-management governance
- Additional security monitoring
- Integration with authorized institutional or government identity systems

Therefore, the limitation is **production-scale identity assurance**, rather than the absence of authentication.

---

## Offline Connectivity Limitation

The current MVP is **not fully offline-first**.

Core operations that require communication with the backend or Supabase depend on network availability.

In a low-connectivity environment, the current system may not be able to immediately:

- Submit a new report
- Synchronize updates
- Retrieve the latest server-side information
- Complete operations that require backend connectivity

A future offline-first implementation would use:

```text
User Action
     ↓
Local Storage
     ↓
Offline Queue
     ↓
Network Available
     ↓
Synchronization
     ↓
Conflict Resolution
     ↓
Supabase
```

This is a future enhancement and is not claimed as a completed feature of the MVP.

---

## Scaling to All of Mysuru

The current system is designed around modular application components and repository abstractions, but city-scale deployment would require additional infrastructure, operational validation and performance testing.

| What requires further validation | Current status | Future approach |
|---|---|---|
| **API and database load** | Not comprehensively measured during the hackathon | Load testing, indexing, caching and horizontal scaling |
| **Image storage and processing** | City-scale storage requirements are not measured | Object storage, compression and asynchronous processing |
| **AI inference workload** | City-scale inference capacity is not measured | Queue-based inference, model optimization and scalable inference services |
| **Collection assignment workload** | Large-scale operational scheduling is not measured | Background job processing and operational scheduling systems |
| **Jurisdiction data management** | Demonstration zones are used | Integrate authoritative GIS datasets and maintain versioned boundaries |
| **Concurrent user activity** | Large-scale concurrent usage is not measured | Stress testing, monitoring and infrastructure scaling |

The MVP does **not** claim a specific city-scale capacity because comprehensive performance testing has not yet been completed.

---

## Data & Demonstration Scope

The application may use seeded or demonstration data for evaluation.

The demonstration data:

- Is intended to demonstrate the application's workflow.
- Does not represent a live municipal dataset.
- Does not establish official municipal collection zones.
- Should not be interpreted as real-time municipal operational information.

Future deployment would require validated data sources and appropriate authorization for accessing municipal datasets.

---

## AI Scope

The AI-related functionality is intended as **decision support** rather than an autonomous authority.

The current implementation may use analysis, classification, duplicate-detection or prioritization logic to support the waste-management workflow.

The system does not claim that these outputs are equivalent to a production-certified or independently validated municipal decision system.

Future versions should include:

- Construction-waste-specific training datasets
- Quantitative model evaluation
- Human validation
- Bias and error analysis
- Monitoring of model performance
- Model versioning
- Clear fallback behaviour when confidence is low

---

## Roadmap

1. Integrate verified municipal jurisdiction and GIS data.
2. Strengthen production authentication, authorization and identity verification.
3. Add offline-first reporting with queued synchronization and conflict handling.
4. Train and evaluate construction-waste-specific AI models.
5. Strengthen duplicate, fraud and abuse detection.
6. Integrate real collection-team scheduling and fleet workflows.
7. Expand processing and material-recovery analytics.
8. Conduct comprehensive load testing and prepare the platform for larger-scale deployment.
9. Add multilingual and Kannada-friendly reporting workflows.
10. Integrate with authorized municipal systems where appropriate.

---

## Final Scope Statement

ReBuild Mysore is a **Phase 1 MVP** demonstrating a connected construction-waste management lifecycle:

**Report → Analyze → Verify → Prioritize → Assign → Collect → Process → Recycle → Measure Impact**

The project demonstrates the digital workflow and supporting data architecture while clearly distinguishing prototype capabilities from requirements for a production municipal deployment.