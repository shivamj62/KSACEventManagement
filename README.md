# KSAC Event Proposal Management System

> A full-stack web platform that digitises and streamlines the event proposal submission, review, and approval workflow at the **KIIT Student Activity Centre (KSAC), KIIT University**.

---

## Overview

Managing event proposals at KSAC previously involved manual paperwork, email chains, and no centralised tracking. This system replaces that entirely with a structured, role-aware digital workflow — from a student submitting a proposal to four reviewers independently approving it, all with automated PDF generation and email notifications at every stage.

---

## Features

### For Students
- **Guided multi-step form** (7 steps) with auto-save on every navigation — resume anytime without losing progress
- **Dynamic tables** for budget, logistics, sponsors, and venue with auto-calculated totals
- **Visual status pipeline** — see exactly where a proposal is in the approval chain
- **PDF preview** before final submission; download at any time

### For Reviewers (FIC + KSAC Core Team)
- **Reviewer dashboard** listing all assigned proposals with submission dates and status
- **Inline PDF viewer** — review the full proposal without leaving the page
- **Independent decisions** — Approve, Request Changes, or Reject with mandatory comments
- Decision aggregation is automatic and race-condition safe (Firestore transactions)

### System
- **Automated PDF generation** from a configurable template with `{{PLACEHOLDER}}` substitution
- **Email notifications** at every key status transition with PDF attachment
- **Unique Proposal IDs** in `KSAC-YYYY-XXXX` format, atomically generated
- **Role-based access control** enforced at both API and Firestore security rule levels

---

## Proposal Lifecycle

```
drafting → in_process → accepted
                     ↘ rejected
                     ↘ review_requested → in_process (loop)
```

Each proposal passes through up to 4 independent reviewers (1 Faculty In-Charge + 3 KSAC Core members). The outcome is determined by aggregation rules: unanimous approval required for acceptance; a single rejection overrides all others.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | Firebase Cloud Functions (Node.js 18), Express.js |
| Database | Firebase Firestore (NoSQL) |
| Auth | Firebase Authentication |
| File Storage | Firebase Storage |
| PDF Generation | pdfmake |
| Email | Nodemailer + SMTP |
| Form Handling | React Hook Form + Zod |
| Data Fetching | TanStack Query |

---

## Project Structure

```
/
├── client/               # React + Vite frontend
│   └── src/
│       ├── pages/        # Route-level components
│       ├── components/   # Reusable UI + form steps
│       ├── hooks/        # useAuth, useProposal, etc.
│       └── services/     # Axios API wrappers
├── functions/            # Firebase Cloud Functions
│   └── src/
│       ├── routes/       # Express route handlers
│       ├── services/     # PDF, email, approval logic
│       ├── middleware/   # Auth verification + role guards
│       ├── triggers/     # Firestore onUpdate triggers
│       └── templates/   # Configurable PDF template
└── shared/               # Shared TypeScript types
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore, Auth, Storage, and Functions enabled

### Local Development

```bash
# Clone the repo
git clone https://github.com/your-username/ksac-proposal-system.git
cd ksac-proposal-system

# Install dependencies
cd client && npm install
cd ../functions && npm install

# Start Firebase emulators (Auth, Firestore, Storage, Functions)
cd functions && npm run emulate

# In a separate terminal, start the frontend
cd client && npm run dev
```

The emulator suite seeds test users (admin, FIC, 4 KSAC core members, students) and sample proposals in each status on first run.

### Environment Variables

Create `functions/.env`:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=yourpassword
FROM_EMAIL=noreply@ksac.kiit.ac.in
```

---

## API Reference (Summary)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Student self-registration |
| GET | `/api/auth/me` | Get authenticated user profile |
| POST | `/api/admin/assign-role` | Assign FIC / KSAC core role (admin only) |
| GET | `/api/users/fic` | List FIC users (for form dropdown) |
| GET | `/api/users/ksac-core` | List KSAC core members |
| POST | `/api/proposals` | Create new draft |
| PATCH | `/api/proposals/:id/draft` | Auto-save form progress |
| POST | `/api/proposals/:id/submit` | Final submission |
| POST | `/api/proposals/:id/review` | Submit reviewer decision |
| POST | `/api/proposals/:id/resubmit` | Re-submit after changes requested |
| GET | `/api/proposals` | List proposals (role-aware) |
| GET | `/api/proposals/:id` | Get proposal detail |

---

## Security Model

- All Firestore reads and writes are governed by security rules — no client can access data outside their role
- Students can only read/write their own proposals, and only when status permits editing
- Reviewers can only access proposals they are explicitly assigned to
- PDF download URLs are scoped to the proposal owner and assigned reviewers
- Role assignment for privileged roles (FIC, KSAC Core) is admin-controlled, not self-declared

---

## Status

> Currently in active development. Backend (API, pipeline logic, PDF generation, email notifications) is being built first, followed by the React frontend.

---

## Author

Built by **[Your Name]** — Computer Science, KIIT University  
[LinkedIn](#) · [Portfolio](#) · [Email](#)

---

*This project is not officially affiliated with KIIT University IT infrastructure. It is a student-led initiative developed for KSAC's internal operations.*
