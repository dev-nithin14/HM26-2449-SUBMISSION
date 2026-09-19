# AI Usage Disclosure

[← Back to README](./README.md)

> AI tools are **100% permitted** at HackMysuru 1.0. Disclosing them is **mandatory**.
> Using AI never costs you points. Not being able to explain code you submitted does.
> Reviewers check this file against your commit history and the AI segment of your video.

---

## Summary

| Question | Answer |
|---|---|
| Did we use AI tools during development? | **Yes** |
| Does our product use AI/ML at runtime? | **Yes — prototype AI-analysis layer** |
| Roughly how much of the code was AI-assisted? | **To be finalized by the team after reviewing the codebase** |
| Can every team member explain the AI-assisted code? | **Yes — team members are responsible for understanding and reviewing submitted code** |

---

## 1. AI Tools Used During Development

| Tool | Model / plan | Used by | What we used it for |
|---|---|---|---|
| **Antigravity AI** | AI coding agent | Development team | Application scaffolding, frontend and backend implementation, debugging, iterative development and code assistance |
| **ChatGPT** | GPT model | Development team | Architecture discussions, technical problem solving, debugging, development planning and documentation assistance |

---

## 2. Where AI Helped in the Codebase

| Area / file | Level of AI help | What a human did |
|---|---|---|
| `src/frontend/` | **High** | Team reviewed the generated implementation, tested the UI and modified it according to the project requirements |
| `src/backend/` | **High** | Team reviewed backend logic, APIs and services, tested the implementation and made required changes |
| Repository / data-access layer | **High** | Team reviewed the repository abstraction and verified how application data flows through the backend |
| AI-analysis layer | **High** | Team defined the intended analysis workflow, reviewed the implementation and tested the resulting behavior |
| Documentation | **Medium** | Team provided the project-specific information, reviewed generated content and made final decisions |

### Human responsibility

AI-generated code was treated as development assistance rather than automatically correct code.

The team reviewed, modified and tested the implementation and remained responsible for the final architecture, functionality and submitted code.

---

## 3. AI Inside the Product (runtime)

| Model / API | What it does in our product | Hosted where | Trained / fine-tuned by us? |
|---|---|---|---|
| **Prototype AI-analysis service** | Analyzes construction-waste reports using factors such as waste composition, recyclability, image quality, contamination, duplicate probability and confidence | Application backend / prototype service | **No custom model training in the current MVP** |

- **Accuracy we measured:** Not measured as a production ML model.
- **What happens when the model is wrong:** The AI output is treated as an analysis/recommendation within the workflow and is not presented as a guaranteed decision.
- **Does it work offline?** The current AI-analysis capability should not be considered a production offline ML system.
- **Citizen data sent to third parties:** No production third-party AI data-sharing claim is made unless an external AI provider is explicitly configured.
- **Cost at city scale:** Not measured for the current prototype.

### Important prototype disclosure

The current AI-analysis implementation is a **prototype layer** intended to demonstrate how AI-assisted waste analysis can participate in the ReBuild Mysore workflow.

It should not be interpreted as a production-validated computer-vision model or as a claim of measured real-world classification accuracy.

---

## 4. Key Prompts (optional)

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
- The team retained responsibility for understanding the submitted implementation.
- AI suggestions were not treated as authoritative when they conflicted with the application's architecture or requirements.

---

## 6. What We Deliberately Did Not Use AI For

- Final team decisions and project ownership.
- Final evaluation of whether the solution meets the hackathon problem.
- Blind acceptance of generated code.
- Final testing and verification of the submitted application.
- Claims about real-world impact or production performance without supporting evidence.

---

**Declaration:** We confirm that this disclosure represents the team's AI-assisted development process and that the team is responsible for understanding and explaining the submitted implementation.

**Signed:** `Team Leader name` on behalf of `Team Name` · `19 September 2026`