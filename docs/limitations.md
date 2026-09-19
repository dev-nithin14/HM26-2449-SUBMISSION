# Known Limitations & Future Scope

[← Back to README](../README.md)

## What Doesn't Work Yet

| Limitation | Why it exists | What we'd do next |
|---|---|---|
| AI analysis is prototype-level | The current AI layer provides decision-support signals and does not use a measured production ML model | Train and evaluate construction-waste-specific models using a representative dataset |
| Official jurisdiction data is not integrated | The MVP uses project-defined demo collection zones rather than official municipal GIS boundaries | Integrate verified MCC/KGIS or other authorized GIS boundary data |
| Production-grade authentication is not implemented | The hackathon MVP uses fixed client-side demo credentials for role-based evaluation | Integrate secure backend authentication, authorization and session management |
| Complete offline-first reporting is not implemented | API-dependent operations currently require network connectivity | Add local storage, queued submissions, retry handling and synchronization |
| Production-grade abuse prevention is limited | The MVP focuses on validation, duplicate detection signals and verification | Add rate limiting, stronger identity controls, abuse detection and moderation |
| City-scale performance has not been measured | The MVP was developed as a hackathon prototype with demo data | Load-test the platform and optimize database queries, APIs and background processing |

## Edge Cases We Don't Handle

- GPS spoofing or deliberately manipulated location data
- Coordinated spam from multiple accounts or devices
- Highly ambiguous waste images that cannot be reliably classified
- Reports involving locations outside the configured demo collection zones
- Conflicting updates made simultaneously by multiple operational users
- Complete offline synchronization and conflict resolution
- Production-scale authentication and identity verification
- Complex municipal jurisdiction overlaps

These cases are documented as future engineering requirements rather than being presented as solved problems in the MVP.

## Scaling to All of Mysuru

The current system is designed around modular services and repository abstractions, but city-scale deployment would require additional infrastructure and validation.

| What breaks first | Rough numbers | Fix |
|---|---|---|
| API and database load | Not measured during the hackathon | Load testing, indexing, caching and horizontal scaling |
| Image storage and processing | Depends on report volume; not measured | Object storage, image compression and asynchronous processing |
| AI inference workload | Not measured at city scale | Queue-based inference, model optimization and scalable inference services |
| Collection assignment workload | Not measured | Background job processing and operational scheduling |
| Jurisdiction data management | Demo zones only | Integrate authoritative GIS datasets and maintain versioned boundaries |

The MVP does not claim a specific city-scale capacity because performance testing has not yet been completed.

## Roadmap

1. Integrate verified municipal jurisdiction and GIS data.
2. Implement secure production authentication and authorization.
3. Add offline-first reporting with queued synchronization and conflict handling.
4. Train and evaluate construction-waste-specific AI models.
5. Strengthen duplicate, fraud and abuse detection.
6. Integrate real collection-team scheduling and fleet workflows.
7. Expand processing and material-recovery analytics.
8. Conduct load testing and prepare the platform for larger-scale deployment.
9. Add multilingual and Kannada-friendly reporting workflows.