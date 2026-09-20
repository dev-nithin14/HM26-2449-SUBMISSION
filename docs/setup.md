# ReBuild Mysore — Setup Guide

## 1. Overview

This document explains how to obtain, configure, and run the ReBuild Mysore project locally.

The project is maintained in the GitHub repository:

`https://github.com/dev-nithin14/HM26-2449-SUBMISSION`

A deployed version of the MVP is also available at:

`https://hm-26-2449-submission.vercel.app/`

The final MVP uses **Supabase** as the persistent backend and database layer, including Supabase Authentication and PostgreSQL-based data storage.

---

## 2. Prerequisites

Before setting up the project, ensure that the following are available:

- Git
- Node.js 20 or later
- npm
- Visual Studio Code or another suitable code editor
- A modern web browser
- Internet connectivity
- Access to the project's configured Supabase environment

---

## 3. Clone the Repository

Open a terminal or Command Prompt and navigate to the location where you want to store the project.

Clone the repository:

```bash
git clone https://github.com/dev-nithin14/HM26-2449-SUBMISSION.git
```

Move into the project directory:

```bash
cd HM26-2449-SUBMISSION
```

---

## 4. Open the Project

The project can be opened in Visual Studio Code using:

```bash
code .
```

Alternatively, open Visual Studio Code manually and select the cloned `HM26-2449-SUBMISSION` folder.

---

## 5. Project Structure

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

The `src/backend/` directory contains the backend application and API logic.

The `src/frontend/` directory contains the React/Vite application.

The `docs/` directory contains the project's technical documentation.

Supabase provides the persistent PostgreSQL database and authentication services used by the final MVP.

---

## 6. Install Dependencies

The frontend and backend have separate dependency configurations.

### Backend

```bash
cd src/backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

---

## 7. Supabase Configuration

The final MVP is connected to Supabase for persistent application data and authentication.

The project already contains the required Supabase client configuration used by the application. Local setup should therefore use the existing environment-variable structure rather than introducing a separate configuration format.

The frontend Supabase configuration uses the following environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
```

The values must correspond to the Supabase project configured for ReBuild Mysore.

The Supabase project URL is the project URL provided by Supabase. Do not append `/rest/v1/` to the URL when using it as `VITE_SUPABASE_URL`.

### Security

Do not commit secret credentials to GitHub.

In particular, never expose or commit:

- Supabase service-role keys
- Supabase secret keys
- Private API keys
- Passwords
- Authentication secrets
- Private tokens

The frontend should use only the public client-side Supabase credential intended for browser applications.

---

## 8. Database Configuration

The application uses the Supabase PostgreSQL database for persistent data.

The required database schema, entities and relationships are documented in:

`docs/architecture.md`

The Supabase project must contain the database structures required by the application.

Where applicable, Supabase authentication and database access policies should be configured to allow the intended role-based operations while preventing unauthorized access.

The Supabase dashboard can be used to inspect:

- Authentication users
- Database tables
- Stored application records
- Database policies
- Application data created during testing

---

## 9. Run the Application Locally

The frontend and backend run as separate development processes.

Open two terminals.

### Terminal 1 — Backend

```bash
cd HM26-2449-SUBMISSION/src/backend
npm run dev
```

The backend runs on the port configured by the project.

### Terminal 2 — Frontend

```bash
cd HM26-2449-SUBMISSION/src/frontend
npm run dev
```

Vite will display the local frontend URL in the terminal, normally similar to:

```text
http://localhost:5173
```

Open the displayed URL in a browser.

---

## 10. Verify Supabase Connectivity

After starting the application, verify the following:

1. The application loads successfully.
2. The login/authentication flow works.
3. Authenticated users can access the appropriate role-based workflow.
4. Waste reports can be submitted.
5. Submitted data is persisted in Supabase.
6. Stored data can be retrieved by the application.
7. Collection and processing workflow updates are persisted.
8. No unexpected authentication or database errors appear in the browser console.

The Supabase dashboard can be used during testing to confirm that application records are being created and updated.

---

## 11. Basic Application Verification

After starting the application, verify:

- [ ] Application loads successfully.
- [ ] Navigation works correctly.
- [ ] Authentication works.
- [ ] Role-specific functionality works.
- [ ] Waste reporting workflow works.
- [ ] Location/report information can be submitted.
- [ ] Report data is stored.
- [ ] Stored data can be retrieved.
- [ ] Collection workflow works as implemented.
- [ ] Processing workflow works as implemented.
- [ ] Recycling/impact information can be recorded.
- [ ] No unexpected browser-console errors appear.

---

## 12. Production Deployment

The Phase 1 MVP is deployed using Vercel.

Live application:

`https://hm-26-2449-submission.vercel.app/`

The production deployment uses the project's configured environment and Supabase connection.

For future changes:

```text
Update source code
      ↓
Test locally
      ↓
Commit changes
      ↓
Push to GitHub
      ↓
Vercel deployment
      ↓
Verify production application
      ↓
Verify Supabase connectivity
```

Production environment variables must be configured through the deployment platform and must not be committed to the repository.

---

## 13. Troubleshooting

### Application does not start

Check that:

- Node.js 20 or later is installed.
- The correct project directory is open.
- Backend dependencies are installed.
- Frontend dependencies are installed.
- Required environment configuration is available.

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

---

### Frontend cannot communicate with the backend

Confirm that:

- The backend development server is running.
- The frontend development server is running.
- The configured API URL/port matches the project configuration.
- No browser console errors are preventing requests.

---

### Supabase authentication fails

Check:

- Supabase project URL.
- Supabase public client credential.
- Authentication configuration.
- User account availability.
- Browser console errors.
- Supabase authentication logs.

Do not use a service-role or secret key in frontend code.

---

### Database operations fail

Check:

- The application is connected to the intended Supabase project.
- Required database tables exist.
- Table columns match the application's expected schema.
- Required relationships are configured.
- Supabase access policies permit the intended operation.
- The configured environment variables are correct.

Use the Supabase dashboard to inspect database records and errors.

---

### Environment-variable errors

Check that:

- The environment file is located where the application expects it.
- Variable names exactly match the names used by the source code.
- The Supabase URL is correct.
- The public client key is correct.
- Development servers have been restarted after changing environment variables.

Never commit secret values to GitHub.

---

### Deployment issues

Check:

1. Vercel deployment logs.
2. Production environment variables.
3. Supabase project configuration.
4. Authentication configuration.
5. Browser console errors.
6. Network/API errors.
7. Supabase database and authentication logs.

---

## 14. Development Workflow

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
Verify Supabase configuration
      ↓
Run backend and frontend
      ↓
Test authentication
      ↓
Test database operations
      ↓
Test complete waste lifecycle
      ↓
Verify Supabase records
      ↓
Commit changes
      ↓
Push changes to GitHub
      ↓
Verify deployed application
```

---

## 15. Notes

ReBuild Mysore is a Phase 1 MVP intended to demonstrate an end-to-end construction-waste management workflow.

The final architecture uses Supabase for persistent PostgreSQL data storage and authentication.

The demonstration environment may contain seeded or test data and should not be interpreted as live municipal operational data.

For the system architecture and data model, refer to:

`docs/architecture.md`

For known limitations, refer to:

`docs/limitations.md`

For AI disclosure, refer to:

`ai.md`