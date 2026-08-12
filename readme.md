# TrustHire — Trusted Recruitment Platform

<div align="center">

![TrustHire](https://img.shields.io/badge/TrustHire-Trusted%20Recruitment-blueviolet?style=for-the-badge)
![NestJS](https://img.shields.io/badge/NestJS-11-red?style=flat-square&logo=nestjs)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

**A trusted, full-stack recruitment platform connecting candidates with verified companies.**

*No fake listings. No scams. Just trusted connections.*

</div>

---

## 📚 Table of Contents

- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Application Workflow](#-application-workflow)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Usage](#-usage)
- [Test Credentials](#-test-credentials)
- [API Overview](#-api-overview)
- [Database Overview](#-database-overview)
- [Project Structure](#-project-structure)
- [Docker](#-docker)
- [Scripts](#-scripts)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Project Overview

TrustHire is a full-stack recruitment platform designed to reduce fraudulent job listings and improve trust between candidates, recruiters, and employers.

The platform uses company verification, role-based access control, OTP verification, audit logging, blacklist management, risk scoring, and secure authentication to create a safer recruitment environment.

### Core Roles

| Role | Responsibilities |
|---|---|
| 👤 **Candidate** | Create a profile, search jobs, apply for jobs, track applications, and communicate with recruiters |
| 💼 **Recruiter** | Register a company, complete verification, publish jobs, review applications, and manage hiring |
| 🛡️ **Admin** | Verify companies, manage users, monitor audit logs, handle blacklists, and view platform analytics |

---

## ✨ Features

### 🔐 Authentication & User Management

- User registration and login
- JWT access and refresh tokens
- Logout and refresh-token invalidation
- Email verification through OTP
- Phone verification through OTP
- Password hashing with **Argon2**
- Role-based access control
- Candidate, Recruiter, and Admin roles
- Profile management
- Skills and experience management
- Education information
- Resume and LinkedIn profile support

### 🏢 Company Management

- Company registration
- Recruiter-to-company association
- Company profile management
- Verification workflow
- Verification document uploads
- Company risk scoring
- Blacklisting with reason tracking
- Automatic job deactivation when a company is blocked

Company verification flow:

```text
PENDING
   ↓
UNDER_REVIEW
   ↓
APPROVED / REJECTED / BLOCKED
💼 Job Management
Create jobs for approved companies
Update and delete jobs
Search and filter jobs
Keyword filtering
Location filtering
Job-type filtering
Salary-range filtering
Skills filtering
Pagination
Deadline validation
Automatic deactivation for blocked companies
📄 Application Management
Apply to jobs
Resume and cover-letter support
Duplicate-application prevention
Application deadline validation
Application tracking
Recruiter application management

Application lifecycle:

PENDING
   ↓
REVIEWED
   ↓
SHORTLISTED
   ↓
INTERVIEW_SCHEDULED
   ↓
ACCEPTED / REJECTED
🛡️ Admin Management
Admin dashboard
Platform statistics
Company verification
Approve/reject/block companies
User management
Block/unblock users
Audit-log viewer
Suspicious-activity monitoring
Reports and analytics
Blacklist management
💬 Communication
User-to-user messaging
Notifications
Application-status notifications
Comprehensive audit logging
🛠️ Technology Stack
Frontend
Technology	Purpose
Next.js 16	React framework using the App Router
React 19	UI library
TypeScript	Type-safe development
Tailwind CSS v4	Utility-first styling
shadcn/ui	Reusable UI components
TanStack Query	Server-state management
Axios	HTTP client
Zod	Schema validation
React Hook Form	Form management
Framer Motion	UI animations
Lucide React	Icons
Backend
Technology	Purpose
NestJS 11	Scalable Node.js backend framework
TypeScript	Type-safe backend development
Prisma ORM 5	Database ORM and migrations
Passport.js	Authentication strategies
JWT	Access and refresh token authentication
Argon2	Secure password hashing
BullMQ	Background job processing
Helmet	Security headers
Class Validator	DTO validation
Class Transformer	Request transformation
Database & Infrastructure
Technology	Purpose
PostgreSQL 16	Primary relational database
Redis 7	Caching, OTP storage, and queues
Docker Compose	Container orchestration
nginx	Reverse proxy
AWS S3	File storage
Git	Version control
🏗️ System Architecture
                         ┌──────────────────────┐
                         │      End Users       │
                         │ Candidate / Recruiter│
                         │        / Admin       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Next.js 16      │
                         │     React 19 FE      │
                         │      Port 3000       │
                         └──────────┬───────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌──────────────────────┐
                         │      NestJS 11       │
                         │      Backend API     │
                         │      Port 3001       │
                         └──────────┬───────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
       │ Prisma ORM   │      │   Redis 7    │      │   AWS S3     │
       │              │      │ Cache / OTP  │      │ File Storage │
       └──────┬───────┘      │   / BullMQ   │      └──────────────┘
              │              └──────────────┘
              ▼
       ┌──────────────┐
       │ PostgreSQL16 │
       │   Database   │
       └──────────────┘
🔄 Application Workflow
🚀 Installation
Prerequisites

Install:

Node.js 18+
npm or yarn
Docker Desktop
Git

Verify:

node --version
npm --version
docker --version
docker compose version
git --version
1. Clone the Repository
git clone <your-repository-url>
cd trusthire
2. Configure Environment
cp .env.example .env

Update .env with your configuration.

3. Start PostgreSQL and Redis
docker compose up -d postgres redis

Check containers:

docker ps

Test PostgreSQL:

docker exec -it trusthire-postgres pg_isready -U trusthire

Test Redis:

docker exec -it trusthire-redis redis-cli ping

Expected:

PONG
4. Install Dependencies
npm run install:all
5. Run Database Migration
cd be
npx prisma migrate dev
6. Seed the Database
node prisma/seed.js
cd ..
7. Start the Application
npm run dev
⚙️ Environment Variables

Create .env from .env.example.

Example:

POSTGRES_USER=trusthire
POSTGRES_PASSWORD=change-me-strong-password
POSTGRES_DB=trusthire

DATABASE_URL=postgresql://trusthire:change-me-strong-password@postgres:5432/trusthire?schema=public

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

ENCRYPTION_KEY=

CORS_ORIGIN=http://localhost

NEXT_PUBLIC_API_URL=http://localhost/api/v1

Generate secure secrets:

openssl rand -hex 32

⚠️ Never commit .env or production secrets to GitHub.

▶️ Usage
Development

Start both frontend and backend:

npm run dev
Frontend
npm run dev:fe

Runs at:

http://localhost:3000
Backend
npm run dev:be

Runs at:

http://localhost:3001
🔑 Test Credentials

These accounts are for local development and testing only.

Role	Username / Email	Password
👑 Admin	admin@trusthire.dev	Admin@123
👤 Candidate	candidate@trusthire.dev	Candidate@123
💼 Recruiter	recruiter@trusthire.dev	Recruiter@123
Admin
Username: admin@trusthire.dev
Password: Admin@123
Candidate
Username: candidate@trusthire.dev
Password: Candidate@123
Recruiter
Username: recruiter@trusthire.dev
Password: Recruiter@123

⚠️ Do not use these seeded credentials in production.

🔌 API Overview

All API endpoints use:

/api/v1
Authentication
Method	Endpoint	Description
POST	/auth/register	Register user
POST	/auth/login	Login
POST	/auth/logout	Logout
POST	/auth/refresh	Refresh token
POST	/auth/verify-email	Verify email
POST	/auth/verify-phone	Verify phone
POST	/auth/resend-otp	Resend OTP
GET	/auth/profile	Get profile
PATCH	/auth/profile	Update profile
Companies
Method	Endpoint	Description
POST	/companies/register	Register company
GET	/companies/profile	Get company
GET	/companies/status	Get verification status
PATCH	/companies/profile	Update company
POST	/companies/upload-documents	Upload documents
Jobs
Method	Endpoint	Description
GET	/jobs	Search jobs
GET	/jobs/:id	Job details
POST	/jobs	Create job
PATCH	/jobs/:id	Update job
DELETE	/jobs/:id	Delete job
Applications
Method	Endpoint	Description
POST	/applications	Apply for job
GET	/applications/me	My applications
GET	/applications/company	Company applications
GET	/applications/job/:jobId	Job applications
PATCH	/applications/:id/status	Update application
Admin
Method	Endpoint	Description
GET	/admin/dashboard	Dashboard statistics
GET	/admin/companies	List companies
POST	/admin/companies	Create company
PATCH	/admin/companies/:id	Update company
DELETE	/admin/companies/:id	Delete company
POST	/admin/approve-company/:id	Approve company
POST	/admin/reject-company/:id	Reject company
POST	/admin/block-company/:id	Block company
POST	/admin/block-user/:id	Block/unblock user
GET	/admin/audit-logs	Audit logs
GET	/admin/reports	Reports
GET	/admin/blacklist	Blacklist management
🗄️ Database Overview
User
├── Recruiter
├── Application
├── AuditLog
├── Sent Messages
└── Received Messages

Company
├── Recruiters
├── Jobs
└── AuditLogs

Job
└── Applications

BlacklistedCompany
└── Domain / Email blacklist

Notification
└── User notifications
Main Enums
Enum	Values
UserRole	CANDIDATE, RECRUITER, ADMIN
VerificationStatus	UNVERIFIED, EMAIL_VERIFIED, PHONE_VERIFIED, FULLY_VERIFIED
CompanyStatus	PENDING, UNDER_REVIEW, APPROVED, REJECTED, BLOCKED
JobType	FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, REMOTE, FREELANCE
ApplicationStatus	PENDING, REVIEWED, SHORTLISTED, INTERVIEW_SCHEDULED, ACCEPTED, REJECTED, WITHDRAWN
📁 Project Structure
trusthire/
│
├── docker-compose.yml
├── docker/
├── package.json
│
├── be/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   │
│   └── src/
│       ├── main.ts
│       ├── app.module.ts
│       ├── auth/
│       ├── company/
│       ├── job/
│       ├── application/
│       ├── admin/
│       ├── message/
│       ├── upload/
│       ├── prisma/
│       └── common/
│
├── fe/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── jobs/
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── providers/
│   │   ├── shared/
│   │   └── ui/
│   │
│   ├── hooks/
│   └── lib/
│
└── db/
🐳 Docker

Start the full application stack:

docker compose up -d --build

Stop services:

docker compose down

Reset containers and volumes:

docker compose down -v

⚠️ docker compose down -v removes persistent database volumes.

Docker Services
Service	Port	Purpose
PostgreSQL	5432	Database
Redis	6379	Cache / OTP / queues
Backend	3001	NestJS API
Frontend	3000	Next.js
nginx	80	Reverse proxy

Full Docker application:

http://localhost
📜 Scripts
Command	Description
npm run dev	Start frontend and backend
npm run dev:be	Start backend
npm run dev:fe	Start frontend
npm run build:be	Build backend
npm run build:fe	Build frontend
npm run install:all	Install all dependencies
cd be && npm run seed	Seed database
cd be && npm run test	Run unit tests
cd be && npm run test:e2e	Run e2e tests
🔒 Security

TrustHire uses:

JWT authentication
Argon2 password hashing
Role-based authorization
OTP verification
Helmet security headers
Audit logging
Suspicious-activity tracking
Company and user blocking
Blacklist management
Environment-based secrets
Never Commit
.env
Production passwords
JWT secrets
AWS credentials
Private API keys
Database credentials
🤝 Contributing

Contributions are welcome.

1. Fork the Repository

Create your own fork on GitHub.

2. Create a Feature Branch
git checkout -b feature/your-feature-name
3. Make Your Changes

Follow the existing project structure and coding conventions.

4. Run Tests
cd be
npm run test
npm run test:e2e
5. Build the Project
npm run build:be
npm run build:fe
6. Commit
git add .
git commit -m "feat: add your feature"
7. Push
git push origin feature/your-feature-name
8. Open a Pull Request

Include:

What changed
Why the change was needed
How it was tested
Any required environment changes
🧪 Testing

Run backend unit tests:

cd be
npm run test

Run end-to-end tests:

npm run test:e2e

For new features, add or update tests where appropriate.

🗺️ Future Improvements

Potential future improvements include:

AI-powered candidate/job matching
Automated fraud detection
Advanced company risk analysis
Interview scheduling integrations
Resume parsing
Candidate recommendation engine
Recruiter analytics
Real-time messaging
Mobile application
Advanced notification services
📄 License

This project is licensed under the MIT License.

<div align="center">

Built with ❤️ using NestJS, Next.js, React, Prisma, PostgreSQL, Redis, Docker & shadcn/ui.

TrustHire — Building a safer recruitment ecosystem.
</div> ```
