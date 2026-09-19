ReBuild Mysore — Setup Guide


1. Overview
This document explains how to obtain, configure, and run the ReBuild Mysore project locally.
The project is maintained in the GitHub repository:
`https://github.com/dev-nithin14/HM26-2449-SUBMISSION`
A deployed version of the MVP is also available at:
`https://hm-26-2449-submission.vercel.app/`


2. Prerequisites
Before setting up the project, ensure that the following are available:
Git
Node.js 20 or later, including npm
A code editor such as Visual Studio Code
A modern web browser
Internet connectivity for cloning the repository and installing dependencies


3. Clone the Repository
Open a terminal or Command Prompt and navigate to the location where you want to store the project.
Clone the repository using:
```bash
git clone https://github.com/dev-nithin14/HM26-2449-SUBMISSION.git
```
Move into the project directory:
```bash
cd HM26-2449-SUBMISSION
```
4. Open the Project
The project can be opened in Visual Studio Code using:
```bash
code .
```
Alternatively, open Visual Studio Code manually and select the cloned `HM26-2449-SUBMISSION` folder.


5. Project Structure
The repository follows the Phase 1 documentation structure:
```text
HM26-2449-SUBMISSION/
├── .gitignore
├── README.md
├── resource.md
├── ai.md
├── docs/
│   ├── architecture.md
│   ├── constraints.md
│   ├── limitations.md
│   └── setup.md
├── resource-templates/
└── src/
      ├── backend/
      └── frontend/
```
The `src/backend/` directory contains the Express REST API. The `src/frontend/` directory contains the React and Vite application. Each directory has its own `package.json`; there is no root-level npm workspace or install script.
The `docs/` directory contains the project's technical documentation.


6. Install Dependencies
Install backend dependencies:
```bash
cd src/backend
npm install
```
Install frontend dependencies:
```bash
cd ../frontend
npm install
```
7. Environment Configuration
The backend reads optional values from `src/backend/.env`. Create it from the example file if you want to configure the port or future integrations:
```bash
cd src/backend
copy .env.example .env
```
On macOS or Linux, use `cp .env.example .env` instead.
The current MVP does not require Supabase or an AI provider key. The Supabase and `AI_PROVIDER_KEY` entries in `.env.example` are reserved for future integrations. The default backend configuration is:
Variable	Default	Purpose
`PORT`	`5000`	Backend API port
`NODE_ENV`	`development`	Runtime environment label
`SUPABASE_URL`	empty	Future persistent database integration
`SUPABASE_SERVICE_ROLE_KEY`	empty	Future server-side Supabase integration
`SUPABASE_ANON_KEY`	empty	Future Supabase client integration
`AI_PROVIDER_KEY`	empty	Future hosted AI/vision integration
Do not commit:
API keys
Passwords
Private tokens
Secret credentials
Other sensitive configuration values
Environment files containing secrets should be excluded through `.gitignore`.
If you keep the defaults, no additional environment configuration is necessary.


8. Run the Application
The frontend and backend run as separate development processes. Open two terminals.
In terminal 1, start the backend:
```bash
cd HM26-2449-SUBMISSION/src/backend
npm run dev
```
The API is available at `http://localhost:5000`, with a health check at `http://localhost:5000/api/health`.
In terminal 2, start the frontend:
```bash
cd HM26-2449-SUBMISSION/src/frontend
npm run dev
```
Open `http://localhost:5173` in a browser. Vite proxies frontend `/api` requests to `http://localhost:5000`.
Production builds
Build the backend:
```bash
cd src/backend
npm run build
npm start
```
Build the frontend:
```bash
cd src/frontend
npm run build
npm run preview
```
9. Production Deployment
The Phase 1 MVP is deployed using Vercel.
Live application:
`https://hm-26-2449-submission.vercel.app/`
For future deployments, changes can be committed and pushed to the GitHub repository. If the Vercel project is connected to the repository, the deployment process can then be handled through the configured deployment workflow.

10. Basic Verification
After starting the application, verify the following:
The application loads successfully.
The main user interface is displayed.
The primary ReBuild Mysore user journey can be completed.
Important navigation elements work correctly.
No unexpected errors appear in the browser console.
Open `http://localhost:5000/api/health` and confirm that the API reports an online status.
The application behaves correctly at the deployed MVP URL.


11. Troubleshooting
Application does not start
Check that:
The correct project directory is open.
Dependencies have been installed separately in `src/backend` and `src/frontend`.
Node.js 20 or later is installed and available as `node --version`.
The terminal does not report missing packages or configuration values.
Frontend cannot reach the API
Confirm that both development servers are running and that the backend responds at `http://localhost:5000/api/health`. The frontend proxy is configured for port `5000`; change `PORT` only if the proxy configuration is updated as well.
Dependency errors
If the project uses a package manager, verify that the dependency configuration file is present and run the appropriate installation command again.
Avoid manually installing unrelated packages unless they are required by the project.
Environment variable errors
The current MVP does not require database or AI provider credentials. If a local `.env` file exists, confirm that it contains valid values and that it is located at `src/backend/.env`.
Never commit secret values to GitHub.
Deployment issues
Check the Vercel deployment logs and compare the deployment configuration with the project's local configuration.


12. Development Workflow
A recommended workflow for contributing to the project is:
```text
Clone repository
      ↓
Open project
      ↓
Install backend dependencies
      ↓
Install frontend dependencies
      ↓
Configure local environment if required
      ↓
Run backend and frontend development servers
      ↓
Test changes locally
      ↓
Commit changes
      ↓
Push changes to GitHub
      ↓
Verify deployed application
```
13. Notes
This setup guide intentionally avoids assuming technologies, commands, environment variables, databases, or services that are not confirmed by the project's source configuration.
As the project evolves, this document should be updated whenever the installation process, runtime requirements, environment configuration, or deployment workflow changes.