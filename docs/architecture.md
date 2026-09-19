# Architecture

[← Back to README](../README.md)

## System Diagram

```mermaid
flowchart LR
    A[React Frontend] --> B[REST API]
    B --> C[Express Backend]
    C --> D[Service Layer]

    D --> E[AI Analysis Service]
    D --> F[Verification Service]
    D --> G[Priority Service]
    D --> H[Routing / Jurisdiction Service]
    D --> I[Collection Service]
    D --> J[Processing Service]

    E --> K[Repository Layer]
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K

    K --> L[(Supabase PostgreSQL)]

    C --> M[Analytics APIs]
    M --> 
    Request Walkthrough
Example: Citizen submits a construction-waste report
1. Citizen opens the report wizard and enters waste details, location, quantity and image.
2. React frontend validates the input using React Hook Form and Zod.
3. Frontend sends POST /api/reports to the Express backend.
4. Backend validates the request and creates the report through ReportRepository.
5. The AI Analysis Service evaluates the submitted image/data and produces prototype analysis such as waste composition, recyclability, contamination, image quality and duplicate probability.
6. Verification Service checks for possible duplicate or nearby reports.
7. Priority Service calculates a priority level using factors such as quantity, waste type, age, location sensitivity, recyclability and duplicate probability.
8. Routing/Jurisdiction Service determines the applicable demo collection zone.
9. The report is assigned to the appropriate collection workflow.
10. Collection and processing teams update the report as it moves through collection, sorting, processing and recycling.
11. Analytics APIs aggregate operational and impact data for the admin dashboard.
Components
Component	Responsibility	Tech	Code location
Frontend	Citizen and operational dashboards, report wizard and workflow UI	React, TypeScript, Vite, Tailwind, shadcn/ui	src/frontend/
API	REST API and request handling	Node.js, Express, TypeScript	src/backend/
Validation	Request and form validation	Zod	src/backend/, src/frontend/
Service Layer	Business logic for analysis, verification, prioritization, routing, collection and processing	TypeScript	src/backend/
Repository Layer	Data-access abstraction between services and persistence	TypeScript	src/backend/
AI Analysis	Prototype construction-waste image/data analysis	TypeScript prototype service	src/backend/
Database	Persistent application data	Supabase PostgreSQL	Supabase / repository layer
Maps	Location display and mapping	Leaflet, OpenStreetMap	src/frontend/
Analytics	Operational and environmental impact metrics	REST APIs, Recharts	src/backend/, src/frontend/


Data Model
#chatgpt-mermaid-_r_2ro_{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px;fill:rgb(255, 255, 255);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-_r_2ro_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_2ro_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-_r_2ro_ .error-icon{fill:rgba(54, 54, 54, 0.96);}#chatgpt-mermaid-_r_2ro_ .error-text{fill:rgb(255, 255, 255);stroke:rgb(255, 255, 255);}#chatgpt-mermaid-_r_2ro_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-_r_2ro_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-_r_2ro_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-_r_2ro_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-_r_2ro_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-_r_2ro_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-_r_2ro_ .marker{fill:rgba(255, 255, 255, 0.498);stroke:rgba(255, 255, 255, 0.498);}#chatgpt-mermaid-_r_2ro_ .marker.cross{stroke:rgba(255, 255, 255, 0.498);}#chatgpt-mermaid-_r_2ro_ svg{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px;}#chatgpt-mermaid-_r_2ro_ p{margin:0;}#chatgpt-mermaid-_r_2ro_ .entityBox{fill:rgb(82, 66, 33);stroke:rgb(217, 163, 55);}#chatgpt-mermaid-_r_2ro_ .relationshipLabelBox{fill:rgba(54, 54, 54, 0.96);opacity:0.7;background-color:rgba(54, 54, 54, 0.96);}#chatgpt-mermaid-_r_2ro_ .relationshipLabelBox rect{opacity:0.5;}#chatgpt-mermaid-_r_2ro_ .labelBkg{background-color:rgba(54, 54, 54, 0.5);}#chatgpt-mermaid-_r_2ro_ .edgeLabel{background-color:rgb(24, 24, 24);}#chatgpt-mermaid-_r_2ro_ .edgeLabel .label rect{fill:rgb(24, 24, 24);}#chatgpt-mermaid-_r_2ro_ .edgeLabel .label text{fill:rgb(255, 255, 255);}#chatgpt-mermaid-_r_2ro_ .edgeLabel .label{fill:rgb(217, 163, 55);font-size:14px;}#chatgpt-mermaid-_r_2ro_ .label{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:rgb(255, 255, 255);}#chatgpt-mermaid-_r_2ro_ .edge-pattern-dashed{stroke-dasharray:8,8;}#chatgpt-mermaid-_r_2ro_ .node rect,#chatgpt-mermaid-_r_2ro_ .node circle,#chatgpt-mermaid-_r_2ro_ .node ellipse,#chatgpt-mermaid-_r_2ro_ .node polygon{fill:rgb(82, 66, 33);stroke:rgb(217, 163, 55);stroke-width:1px;}#chatgpt-mermaid-_r_2ro_ .relationshipLine{stroke:rgba(255, 255, 255, 0.498);stroke-width:1px;fill:none;}#chatgpt-mermaid-_r_2ro_ .marker{fill:none!important;stroke:rgba(255, 255, 255, 0.498)!important;stroke-width:1;}#chatgpt-mermaid-_r_2ro_ [data-look=neo].labelBkg{background-color:rgba(54, 54, 54, 0.5);}#chatgpt-mermaid-_r_2ro_ .node .neo-node{stroke:rgb(217, 163, 55);}#chatgpt-mermaid-_r_2ro_ [data-look="neo"].node rect,#chatgpt-mermaid-_r_2ro_ [data-look="neo"].cluster rect,#chatgpt-mermaid-_r_2ro_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-_r_2ro_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_2ro_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-_r_2ro_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-_r_2ro_-gradient);stroke-width:1px;}#chatgpt-mermaid-_r_2ro_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_2ro_ [data-look="neo"].node .neo-line path{stroke:rgb(217, 163, 55);filter:none;}#chatgpt-mermaid-_r_2ro_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-_r_2ro_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_2ro_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-_r_2ro_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-_r_2ro_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_2ro_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-_r_2ro_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-_r_2ro_ :root{--mermaid-font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}PROFILESREPORTSREPORT_IMAGESAI_ANALYSISREPORT_VERIFICATIONREPORT_TIMELINECOLLECTION_ASSIGNMENTSCOLLECTION_TEAMSCOLLECTION_PROOFSPROCESSING_BATCHESMATERIAL_RECOVERYRECYCLED_PRODUCTSNOTIFICATIONSsubmitscontainsanalyzed_byverified_bytracksassigned_toreceivescompleted_withprocessed_inproducesbecomesreceives




Entity	Key fields	Notes
profiles	id, role, name, phone	Application users and role information
reports	id, reporter_id, waste_type, quantity, location, status, priority	Main construction-waste report
report_images	id, report_id, image_url	Images attached to reports
ai_analysis	report_id, composition, recyclability, contamination, duplicate_probability, confidence	Prototype AI analysis results
report_verification	report_id, verification_status, verified_by, notes	Verification outcome
report_timeline	report_id, status, timestamp, actor	Traceability of report lifecycle
collection_teams	id, name, zone, status	Collection team information
collection_assignments	report_id, team_id, assigned_at, status	Links reports to collection teams
collection_proofs	assignment_id, image_url, latitude, longitude	Collection completion evidence
processing_batches	id, batch_code, status, processed_at	Processing and recycling batches
material_recovery	batch_id, material_type, input_quantity, recovered_quantity	Material recovery information
recycled_products	recovery_id, product_name, quantity	Recycled output products
notifications	id, user_id, type, message, read	Workflow notifications


Report Lifecycle
SUBMITTED
    ↓
AI_ANALYZED
    ↓
VERIFICATION_PENDING
    ↓
VERIFIED
    ↓
ASSIGNED
    ↓
COLLECTED
    ↓
SORTING
    ↓
PROCESSING
    ↓
RECYCLED
Reports may also move to states such as REJECTED, DUPLICATE or CANCELLED when applicable.
Key APIs
Method	Endpoint	Purpose
POST	/api/reports	Create a construction-waste report
GET	/api/reports	Retrieve reports
GET	/api/reports/:id	Retrieve a specific report
POST	/api/reports/:id/analyze	Run AI analysis
POST	/api/reports/:id/verify	Verify a report
POST	/api/reports/:id/calculate-priority	Calculate report priority
GET	/api/reports/:id/routing	Determine routing/jurisdiction
POST	/api/reports/:id/assign	Assign a report to a collection team
GET	/api/collections	Collection workflow data
GET	/api/processing	Processing workflow data
GET	/api/analytics/...	Analytics and impact metrics
GET	/api/notifications	User notifications


API Response Format
Success:
{
  "success": true,
  "data": {}
}
Error:
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Description of the error"
  }
}
Tech Stack
Layer	Choice	Why
Frontend	React + TypeScript + Vite	Component-based architecture and fast development
UI	Tailwind CSS + shadcn/ui	Consistent and reusable interface components
Backend	Node.js + Express + TypeScript	Lightweight REST API and shared TypeScript types
Validation	Zod	Runtime validation for API and form inputs
Database	Supabase PostgreSQL	Relational data model suitable for workflow and traceability
AI	Prototype AI Analysis Service	Supports waste classification, recyclability and verification signals
Maps	Leaflet + OpenStreetMap	Lightweight map integration
Charts	Recharts	Dashboard analytics and impact visualisation
Hosting	Vercel	Deployment of the web application


Data Sources
Dataset	Source	Real or synthetic	Used for
Construction-waste reports	Project-generated demo records	Synthetic	Demonstrating report and workflow management
Collection zones	Project-defined demo zones around Mysuru	Synthetic/demo	Demonstrating routing and assignment
Map data	OpenStreetMap	Real	Location and map visualisation
Processing/recovery records	Project-generated demo records	Synthetic	Demonstrating traceability and impact metrics


Architecture Principles
- Modular services: Business logic is separated into focused services.
- Repository abstraction: Data access is separated from business logic.
- Traceability: Reports can be followed from submission through collection, processing and recycling.
- Validation-first APIs: API inputs are validated before business logic executes.
- Prototype-aware AI: AI outputs are treated as analysis signals rather than unquestioned ground truth.
- Demo-safe geography: Collection zones are clearly treated as demonstration data and not official municipal boundaries.
Security and Configuration
- Secrets and API keys are stored through environment variables.
- .env files are excluded from Git.
- Backend validation prevents malformed API requests.
- Role-based application workflows restrict dashboard functionality according to the selected user role.
- The prototype does not claim production-grade authentication or municipal authorization unless explicitly configured.