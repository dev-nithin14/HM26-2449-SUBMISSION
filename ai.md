# AI Usage Disclosure

[← Back to README](./README.md)

> AI tools are permitted at HackMysuru 1.0. Disclosing their use is mandatory.
> The team is responsible for understanding, reviewing and explaining the submitted implementation.

---

## Summary

| Question | Answer |
|---|---|
| Did we use AI tools during development? | **Yes** |
| Does our product use AI/ML at runtime? | **Yes — prototype AI-analysis layer** |
| Roughly how much of the code was AI-assisted? | **AI assistance was used extensively across the frontend, backend, debugging and documentation; the team has not assigned a precise percentage.** |
| Can every team member explain the AI-assisted code? | **Yes — team members are responsible for understanding and reviewing the submitted implementation.** |

---

## 1. AI Tools Used During Development

| Tool | Model / plan | Used by | What we used it for |
|---|---|---|---|
| **Antigravity AI** | AI coding agent | Development team | Application scaffolding, frontend and backend implementation, debugging, iterative development and code assistance |
| **ChatGPT** | GPT model | Development team | Architecture discussions, technical problem solving, debugging, development planning and documentation assistance |

AI was used as a development aid. Generated output was reviewed and adapted to the project's requirements rather than being accepted without verification.

---

## 2. Where AI Helped in the Codebase

| Area / file | Level of AI help | What a human did |
|---|---|---|
| `src/frontend/` | **High** | Team reviewed the generated implementation, tested the UI and modified it according to project requirements |
| `src/backend/` | **High** | Team reviewed backend logic, APIs and services, tested the implementation and made required changes |
| Repository / data-access layer | **High** | Team reviewed the repository abstraction and verified how application data flows through the backend |
| AI-analysis layer | **High** | Team defined the intended analysis workflow, reviewed the implementation and tested the resulting behavior |
| Documentation | **Medium** | Team provided project-specific information, reviewed generated content and made final decisions |

### Human responsibility

AI-generated code was treated as development assistance rather than automatically correct code.

The team reviewed, modified and tested the implementation and remained responsible for the final architecture, functionality and submitted code.

---

## 3. AI Inside the Product (Runtime)

| Model / API | What it does in our product | Hosted where | Trained / fine-tuned by us? |
|---|---|---|---|
| **Prototype AI-analysis service** | Analyzes construction-waste reports using factors such as waste composition, recyclability, image quality, contamination, duplicate probability and confidence | Application backend / prototype service | **No custom model training in the current MVP** |

### Runtime AI scope

- **Accuracy measured:** Not measured as a production ML model.
- **What happens when the analysis is wrong:** AI output is treated as an analysis/recommendation within the workflow and is not presented as a guaranteed decision.
- **Offline operation:** The AI-analysis capability is not a production offline ML system and should not be considered fully offline.
- **Third-party AI data sharing:** The project does not claim production third-party AI data sharing unless an external AI provider is explicitly configured.
- **City-scale cost:** Not measured for the current prototype.

### Important prototype disclosure

The current AI-analysis implementation is a **prototype layer** intended to demonstrate how AI-assisted waste analysis can participate in the ReBuild Mysore workflow.

It should not be interpreted as a production-validated computer-vision model or as a claim of measured real-world classification accuracy.

AI analysis is therefore treated as **decision support**, with verification and operational workflow stages remaining separate from the AI output.

---

## 4. Key Prompts

The team used AI-assisted prompts for tasks including:

1. Application architecture and repository-layer design.
2. Frontend and backend implementation assistance.
3. Debugging and resolving implementation issues.
4. Database and persistence architecture discussions.
5. Documentation and submission preparation.

The final implementation was reviewed and adapted by the team rather than being accepted blindly.

---

## 5. How We Verified AI Output

- AI-generated implementation was run and tested during development.
- Frontend and backend functionality was tested through the application's actual workflow.
- Generated code was reviewed and modified when it did not match project requirements.
- API behavior and frontend/backend integration were tested during development.
- Supabase integration and persistent data workflows were tested as part of the final application.
- The team retained responsibility for understanding the submitted implementation.
- AI suggestions were not treated as authoritative when they conflicted with the application's architecture or requirements.

---

## 6. What We Deliberately Did Not Use AI For

- Final team decisions and project ownership.
- Final evaluation of whether the solution meets the hackathon problem.
- Blind acceptance of generated code.
- Final testing and verification of the submitted application.
- Claims about real-world impact or production performance without supporting evidence.
- Treating prototype AI outputs as guaranteed or authoritative decisions.

---

## 7. AI and Data Responsibility

The application distinguishes between AI-assisted analysis and persistent application data.

Supabase is used for application authentication and persistent PostgreSQL data storage. Supabase itself is not being presented as the project's AI model.

The project does not claim that production municipal data was used to train a custom AI model.

The current AI layer remains a prototype and would require representative construction-waste datasets, quantitative evaluation and validation before production deployment.

---

## Declaration

We confirm that this disclosure represents the team's AI-assisted development process.

The team is responsible for understanding, reviewing, testing and explaining the submitted implementation.

**Team:** `HM26-2449`  
**Project:** `ReBuild Mysore`  
**Date:** `19 September 2026`