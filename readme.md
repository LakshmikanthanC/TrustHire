# TrustHire — Trusted Recruitment Platform

<div align="center">

![TrustHire](https://img.shields.io/badge/TrustHire-Trusted%20Recruitment-blueviolet?style=for-the-badge)
![NestJS](https://img.shields.io/badge/NestJS-11-red?style=flat-square&logo=nestjs)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)

**Connect with verified companies and discover opportunities that match your skills. No fake listings, no scams — just trusted connections.**

</div>

---

## Overview

TrustHire is a full-stack recruitment platform designed to eliminate fraudulent job listings and untrusted employers. It provides a multi-level verification system for companies, role-based dashboards for candidates, recruiters, and admins, and comprehensive audit logging for transparency.

### Why TrustHire?

- **Verified Companies** — Every company undergoes a rigorous verification process (`PENDING → UNDER_REVIEW → APPROVED/REJECTED`) before posting jobs.
- **Trusted Employers** — Candidates connect only with approved and verified employers.
- **Fraud Prevention** — Blacklist management, suspicious activity detection, and company risk scoring.
- **Full Audit Trail** — Every action (login, job posting, application status change, etc.) is logged for complete transparency.
- **OTP Verification** — Email and phone number verification via OTP to ensure genuine users.

---

## Features

### Authentication & User Management
- Register, login, logout with JWT access + refresh tokens
- Email verification via OTP
- Phone verification via OTP
- Profile management (skills, experience, education, resume, LinkedIn)
- Role-based access control (Candidate, Recruiter, Admin)
- Password hashing with **Argon2**

### Company Module
- Company registration with recruiter association
- Multi-step verification workflow (`PENDING → UNDER_REVIEW → APPROVED/REJECTED/BLOCKED`)
- Document upload support for verification
- Company profile management
- Blacklisting with reason tracking
- Risk score computation

### Job Module
- Create, update, delete jobs (Recruiters only, company must be APPROVED)
- Advanced search with filters (keyword, location, job type, salary range, skills)
- Pagination support
- Auto-deactivation of jobs when the company is blocked

### Application Module
- Apply for jobs with resume & cover letter
- Duplicate application prevention
- Deadline validation
- Application status tracking (`PENDING → REVIEWED → SHORTLISTED → INTERVIEW_SCHEDULED → ACCEPTED/REJECTED`)
- Recruiter can view and manage applications for their company's jobs

### Admin Module
- Dashboard with statistics (users, companies, jobs, applications)
- Company verification (approve/reject/block)
- User management (block/unblock)
- Audit logs viewer with search & filters
- Reports & analytics (suspicious activities, top companies by jobs/applications)
- Blacklist management

### Additional Features
- Messaging system between users
- Notification system
- Comprehensive audit logging for all critical actions
- Pagination, filtering, and search across modules

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **NestJS 11** | Node.js framework for building scalable server-side applications |
| **Prisma ORM 5** | Type-safe database client and migrations |
| **PostgreSQL 16** | Primary database |
| **Redis 7** | Caching, session management, and OTP storage (via BullMQ) |
| **Passport.js** | Authentication strategies (JWT) |
| **Argon2** | Password hashing |
| **JWT** | Access tokens (15m) + Refresh tokens (7d) |
| **BullMQ** | Background job processing |
| **Helmet** | Security headers |
| **Class-validator / Class-transformer** | DTO validation |

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework with App Router |
| **React 19** | UI library |
| **Tailwind CSS v4** | Utility-first CSS framework |
| **shadcn/ui** | Reusable component library |
| **TanStack Query** | Server state management |
| **Axios** | HTTP client |
| **Zod** | Schema validation |
| **React Hook Form** | Form management |
| **Framer Motion** | Animations |
| **Lucide React** | Icons |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Docker Compose** | PostgreSQL 16 + Redis 7 + BE + FE + nginx containers |
| **AWS SDK** | S3 file uploads (resumes, documents, profile pictures) |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     TrustHire Platform                           │
├────────────────────┬─────────────────────────────────────────────┤
│   Frontend         │   Backend                                   │
│   (Next.js 16)     │   (NestJS 11)                               │
│   Port: 3000       │   Port: 3001                                │
├────────────────────┼─────────────────────────────────────────────┤
│                    │   Modules:                                  │
│  ┌──────────────┐  │    ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Public      │  │    │  Auth    │  │  Company │  │   Job    │ │
│  │  Pages       │  │    │  Module  │  │  Module  │  │  Module  │ │
│  │  (Home,      │◄─┼───►│          │  │          │  │          │ │
│  │  Jobs)       │  │    └──────────┘  └──────────┘  └──────────┘ │
│  └──────────────┘  │    ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  ┌──────────────┐  │    │Application│ │  Admin   │  │ Prisma   │ │
│  │ Dashboard    │  │    │  Module  │  │  Module  │  │  Service │ │
│  │ (Role-based) │◄─┼───►│          │  │          │  │          │ │
│  └──────────────┘  │    └──────────┘  └──────────┘  └──────────┘ │
│                    │                         │                   │
└────────────────────┴─────────────────────────┼───────────────────┘
                                               │
                                    ┌──────────▼──────────┐
                                    │   PostgreSQL 16      │
                                    │   + Redis 7          │
                                    │   (Docker)           │
                                    └─────────────────────┘
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **npm** or **yarn**
- **Docker Desktop** (for PostgreSQL & Redis)
- **Git**

### Setting Up Docker, PostgreSQL & Redis

The project uses Docker Compose to run PostgreSQL and Redis as containers, so you don't need to install them directly on your machine.

#### 1. Install Docker

Download and install **Docker Desktop** from [docker.com](https://www.docker.com/products/docker-desktop/):

- **Windows / macOS** — Install Docker Desktop and make sure it is running.
- **Linux** — Install the Docker Engine + Docker Compose plugin:

  ```bash
  sudo apt-get update
  sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
  ```

Verify the installation:

```bash
docker --version
docker compose version
```

#### 2. Start PostgreSQL & Redis

Make sure Docker Desktop is running, then from the project root:

```bash
docker compose up -d postgres redis
```

This creates and starts two containers:

| Container | Image | Port | Purpose |
|---|---|---|---|
| `trusthire-postgres` | `postgres:16-alpine` | `5432` | PostgreSQL database |
| `trusthire-redis` | `redis:7-alpine` | `6379` | Redis cache / OTP storage |

> **Note:** Run this from the project root (where `docker-compose.yml` lives) so the containers are created with the name, ports, and credentials defined in that file.

#### 3. Verify the containers

```bash
# List running containers (should show trusthire-postgres and trusthire-redis with status "Up")
docker ps

# Test PostgreSQL connection
docker exec -it trusthire-postgres pg_isready -U trusthire

# Test Redis connection
docker exec -it trusthire-redis redis-cli ping   # should reply PONG
```

#### 4. Stop / reset the containers

```bash
# Stop PostgreSQL & Redis (data is preserved in volumes)
docker compose stop postgres redis

# Start them again later
docker compose start postgres redis

# Completely remove containers (data is still kept in volumes)
docker compose rm

# Remove containers AND delete all data (fresh start)
docker compose down -v
```

> The default database credentials come from the `POSTGRES_*` variables in your `.env` file. If none are set, Compose falls back to user `trusthire`, password `trusthire_secret_2024`, database `trusthire`.

### Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone <your-repo-url> trusthire
cd trusthire

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# 3. Start infrastructure (PostgreSQL + Redis)
docker compose up -d postgres redis

# 4. Install all dependencies
npm run install:all

# 5. Run database migrations & seed
cd be
npx prisma migrate dev
node prisma/seed.js
cd ..

# 6. Start development servers (BE + FE concurrently)
npm run dev
```

The backend runs at **http://localhost:3001** and the frontend at **http://localhost:3000**.

### Quick Start (Full Docker Stack)

```bash
# 1. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, JWT secrets, ENCRYPTION_KEY, etc.

# 2. Build & start everything (PostgreSQL, Redis, BE, FE, nginx)
docker compose up -d --build
```

The app is served at **http://localhost** via nginx.

### Individual Commands

```bash
# Run only backend
npm run dev:be

# Run only frontend
npm run dev:fe

# Build backend
npm run build:be

# Build frontend
npm run build:fe

# Backend unit tests
cd be && npm run test

# Backend e2e tests
cd be && npm run test:e2e
```

---


### Setting Up Docker, PostgreSQL & Redis

The project uses Docker Compose to run PostgreSQL and Redis as containers, so you don't need to install them directly on your machine.

#### 1. Install Docker

Download and install **Docker Desktop** from [docker.com](https://www.docker.com/products/docker-desktop/):

- **Windows / macOS** — Install Docker Desktop and make sure it is running.
- **Linux** — Install the Docker Engine + Docker Compose plugin:

  ```bash
  sudo apt-get update
  sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
  ```

Verify the installation:

```bash
docker --version
docker compose version
```

#### 2. Start PostgreSQL & Redis

Make sure Docker Desktop is running, then from the project root:

```bash
docker compose up -d postgres redis
```

This creates and starts two containers:

| Container | Image | Port | Purpose |
|---|---|---|---|
| `trusthire-postgres` | `postgres:16-alpine` | `5432` | PostgreSQL database |
| `trusthire-redis` | `redis:7-alpine` | `6379` | Redis cache / OTP storage |

> **Note:** Run this from the project root (where `docker-compose.yml` lives) so the containers are created with the name, ports, and credentials defined in that file.

#### 3. Verify the containers

```bash
# List running containers (should show trusthire-postgres and trusthire-redis with status "Up")
docker ps

# Test PostgreSQL connection
docker exec -it trusthire-postgres pg_isready -U trusthire

# Test Redis connection
docker exec -it trusthire-redis redis-cli ping   # should reply PONG
```

#### 4. Stop / reset the containers

```bash
# Stop PostgreSQL & Redis (data is preserved in volumes)
docker compose stop postgres redis

# Start them again later
docker compose start postgres redis

# Completely remove containers (data is still kept in volumes)
docker compose rm

# Remove containers AND delete all data (fresh start)
docker compose down -v
```

> The default database credentials come from the `POSTGRES_*` variables in your `.env` file. If none are set, Compose falls back to user `trusthire`, password `trusthire_secret_2024`, database `trusthire`.

## Environment Variables

Create a `.env` file in the root directory based on `.env.example`:

```env
# PostgreSQL (used by docker-compose)
POSTGRES_USER=trusthire
POSTGRES_PASSWORD=change-me-strong-password
POSTGRES_DB=trusthire

# Backend database URL (service name "postgres" inside the compose network)
DATABASE_URL=postgresql://trusthire:change-me-strong-password@postgres:5432/trusthire?schema=public

# Backend secrets - generate with: openssl rand -hex 32
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ENCRYPTION_KEY=

# Allowed browser origin for the backend (public site URL)
CORS_ORIGIN=http://localhost

# Frontend API base URL, inlined into the JS bundle at build time
NEXT_PUBLIC_API_URL=http://localhost/api/v1
```

---

## API Overview

All API routes are prefixed with `/api/v1`.

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login with email & password |
| POST | `/auth/logout` | Logout (invalidates refresh token) |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/verify-email` | Verify email with OTP |
| POST | `/auth/verify-phone` | Verify phone with OTP |
| POST | `/auth/resend-otp` | Resend verification OTP |
| GET | `/auth/profile` | Get authenticated user's profile |
| PATCH | `/auth/profile` | Update profile |

### Companies (`/api/v1/companies`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/companies/register` | Register a new company |
| GET | `/companies/profile` | Get company profile |
| GET | `/companies/status` | Get company verification status |
| PATCH | `/companies/profile` | Update company profile |
| POST | `/companies/upload-documents` | Upload verification documents |

### Jobs (`/api/v1/jobs`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/jobs` | List/search jobs (with filters) |
| GET | `/jobs/:id` | Get job details |
| POST | `/jobs` | Create job (Recruiter) |
| PATCH | `/jobs/:id` | Update job (Recruiter) |
| DELETE | `/jobs/:id` | Delete job (Recruiter) |

### Applications (`/api/v1/applications`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/applications` | Apply for a job |
| GET | `/applications/me` | Get user's applications |
| GET | `/applications/company` | Get applications for recruiter's company |
| GET | `/applications/job/:jobId` | Get applications for a specific job |
| PATCH | `/applications/:id/status` | Update application status |

### Admin (`/api/v1/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Dashboard statistics |
| GET | `/admin/companies` | List all companies |
| POST | `/admin/companies` | Create a company (admin) |
| PATCH | `/admin/companies/:id` | Update company details |
| DELETE | `/admin/companies/:id` | Delete a company |
| POST | `/admin/approve-company/:id` | Approve company verification |
| POST | `/admin/reject-company/:id` | Reject company verification |
| POST | `/admin/block-company/:id` | Block a company |
| POST | `/admin/block-user/:id` | Block/unblock a user |
| GET | `/admin/audit-logs` | View audit logs |
| GET | `/admin/reports` | Reports and analytics |
| GET | `/admin/blacklist` | View/Manage blacklisted companies |

---

## Database Schema

```
User (candidate/recruiter/admin)
  ├── Recruiter (company association)
  ├── Application (job applications)
  ├── AuditLog
  ├── Sent Messages
  └── Received Messages

Company
  ├── Recruiters
  ├── Jobs
  └── AuditLogs

Job
  └── Applications

BlacklistedCompany (domain/email-based blacklist)

Notification (per user)
```

### Key Enums

| Enum | Values |
|------|--------|
| **UserRole** | `CANDIDATE`, `RECRUITER`, `ADMIN` |
| **VerificationStatus** | `UNVERIFIED`, `EMAIL_VERIFIED`, `PHONE_VERIFIED`, `FULLY_VERIFIED` |
| **CompanyStatus** | `PENDING`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `BLOCKED` |
| **JobType** | `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`, `REMOTE`, `FREELANCE` |
| **ApplicationStatus** | `PENDING`, `REVIEWED`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `ACCEPTED`, `REJECTED`, `WITHDRAWN` |
| **AuditAction** | `LOGIN`, `REGISTER`, `COMPANY_REGISTER`, `COMPANY_APPROVED`, `JOB_POSTED`, `APPLICATION_SUBMITTED`, `SUSPICIOUS_ACTIVITY`, etc. |

---

## Test Credentials

Seeded users for local development:

| Role | Email | Password |
|------|-------|----------|
| **Admin**     | `admin@trusthire.dev`     | `Admin@123`     |
| **Candidate** | `candidate@trusthire.dev` | `Candidate@123` |
| **Recruiter** | `recruiter@trusthire.dev` | `Recruiter@123` |

> The candidate user is pre-configured with skills (React, TypeScript, Node.js, PostgreSQL), 3 years of experience, and a sample bio.

---

## Project Structure

```
trusthire/
├── docker-compose.yml       # PostgreSQL + Redis + BE + FE + nginx
├── docker/                  # Additional Docker configurations (nginx)
├── package.json             # Root workspace scripts (concurrently)
│
├── be/                      # Backend - NestJS
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── seed.js          # Seed data
│   │   └── migrations/      # Database migrations
│   └── src/
│       ├── main.ts          # Entry point (CORS, Helmet, ValidationPipe)
│       ├── app.module.ts    # Root module
│       ├── auth/            # Auth module (register, login, JWT, OTP)
│       ├── company/         # Company module (registration, verification)
│       ├── job/             # Job module (CRUD, search)
│       ├── application/     # Application module (apply, status)
│       ├── admin/           # Admin module (dashboard, reports, audit)
│       ├── message/         # Messaging module
│       ├── upload/          # File upload module
│       ├── prisma/          # Prisma service
│       └── common/          # Guards, decorators, filters, interceptors
│
├── fe/
│   └── fe/                  # Frontend - Next.js
│       ├── app/             # App Router pages
│       │   ├── page.tsx     # Landing page
│       │   ├── auth/        # Login & Register pages
│       │   ├── dashboard/   # Admin, Candidate, Recruiter dashboards
│       │   └── jobs/        # Job listings & details
│       ├── components/
│       │   ├── layout/      # Header, Sidebar, DashboardLayout
│       │   ├── providers/   # Auth, Theme, Query providers
│       │   ├── shared/      # JobCard, StatCard, StatusBadge, etc.
│       │   └── ui/          # shadcn/ui components
│       ├── hooks/           # Custom hooks (use-jobs, use-admin, etc.)
│       └── lib/             # API client, constants, utilities
│
└── db/                      # Database-related files
```

---

## Docker

The `docker-compose.yml` sets up:

- **PostgreSQL 16** (`trusthire-postgres`) on port `5432`
  - User: `trusthire`
  - Password: `trusthire_secret_2024` (default)
  - Database: `trusthire`
- **Redis 7** (`trusthire-redis`) on port `6379`
  - Append-only persistence enabled
- **Backend** (`trusthire-backend`) — NestJS production build
- **Frontend** (`trusthire-frontend`) — Next.js production build
- **nginx** (`trusthire-nginx`) — reverse proxy on port `80`

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Wipe volumes (reset data)
docker compose down -v
```

---

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start BE + FE concurrently |
| `npm run dev:be` | Start backend in watch mode |
| `npm run dev:fe` | Start frontend dev server |
| `npm run build:be` | Build backend |
| `npm run build:fe` | Build frontend |
| `npm run install:all` | Install all dependencies (root, be, fe) |
| `cd be && npm run seed` | Seed the database with test data |
| `cd be && npm run test` | Run backend unit tests |
| `cd be && npm run test:e2e` | Run backend integration tests |

---

## Security Notes

- Never commit `.env` files — they contain secrets.
- Generate strong secrets with `openssl rand -hex 32`.
- Passwords are hashed with **Argon2**.
- All API routes are protected with JWT + role-based guards where applicable.

---

## License

This project is licensed under the MIT License.

---

<div align="center">
  Built with ❤️ using NestJS, Next.js, Prisma & shadcn/ui
</div>
#   T r u s t H i r e  
 #   T r u s t H i r e  
 