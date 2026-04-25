# MentorX

A full-stack mentorship platform connecting mentors and mentees. Built with ASP.NET Core 9 backend and React 19 + TypeScript frontend.

---

## Tech Stack

### Backend
- **Framework:** ASP.NET Core 9
- **Database:** PostgreSQL 16
- **ORM:** Entity Framework Core 9 with Npgsql
- **Authentication:** JWT Bearer tokens + Google OAuth 2.0
- **API Documentation:** Swagger / OpenAPI
- **File Storage:** AWS S3
- **Calendar Integration:** Google Calendar API
- **Containerization:** Docker & Docker Compose

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI + shadcn/ui (radix-maia style)
- **Routing:** TanStack Router
- **State Management:** Redux Toolkit
- **Data Fetching:** TanStack React Query + Axios
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Editor:** TinyMCE React
- **Icons:** Lucide React

---

## Project Structure

```
mentor-x/
├── backend/                    # ASP.NET Core Web API
│   ├── Configurations/         # Service & JWT/CORS configurations
│   ├── Controllers/            # API controllers (Auth, Booking, Forum, Mentor, etc.)
│   ├── Middleware/             # Exception handling & auth middleware
│   ├── Migrations/             # EF Core database migrations
│   ├── Models/                 # Entity models, DTOs, enums
│   ├── Services/               # Business logic services & interfaces
│   ├── Utils/                  # Helper utilities
│   ├── appsettings.json        # App configuration
│   ├── backend.csproj          # Project file
│   ├── Dockerfile              # Backend Docker image
│   └── docker-compose.yml      # Docker orchestration
│
└── frontend/                   # React SPA
    ├── src/
    │   ├── api/                # Axios instances & API endpoint definitions
    │   ├── components/         # Reusable UI components
    │   │   ├── ui/             # Shadcn/Radix atomic components
    │   │   ├── dashboard/      # Dashboard-specific components
    │   │   ├── features/       # Feature-based components (forum, user-mgmt)
    │   │   └── landing/        # Landing page sections
    │   ├── hooks/              # Custom React hooks
    │   ├── layouts/            # Page layout wrappers (Admin, Public, User)
    │   ├── lib/                # Utility functions
    │   ├── pages/              # Route-mapped page components
    │   │   ├── admin/          # Admin pages
    │   │   ├── mentor/         # Mentor dashboard pages
    │   │   ├── user/           # User pages
    │   │   └── public/         # Public pages (landing, forum, mentors listing)
    │   ├── routes/             # TanStack Router route trees
    │   ├── store/              # Redux slices & store configuration
    │   ├── types/              # Shared TypeScript types
    │   ├── utils/              # Route guards & helpers
    │   ├── App.tsx             # Root component
    │   └── main.tsx            # Application entry point
    ├── components.json         # shadcn/ui configuration
    ├── index.html              # HTML entry point
    ├── package.json            # Dependencies & scripts
    ├── tsconfig.json           # TypeScript configuration
    └── vite.config.ts          # Vite configuration
```

---

## Features

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Google OAuth 2.0 sign-in
- Role-based access control (User, Mentor, Admin)

### Mentorship
- Browse and search mentor profiles
- Book mentoring sessions with calendar scheduling
- Mentor availability management
- Google Calendar integration for event sync
- Session status tracking (Pending, Confirmed, Completed, Cancelled)

### Payments
- Appointment payment processing
- Payment status tracking for users and mentors
- Admin payment overview and management

### Reviews & Ratings
- Post-session mentor reviews
- Average rating calculation and display on mentor profiles

### Forum & Community
- Topic-based forum discussions
- Rich-text editor (TinyMCE) for posts
- Public community space for knowledge sharing

### Admin Dashboard
- Mentor application verification workflow
- User management
- Payment status oversight
- Platform statistics and analytics

### UI/UX
- Responsive design with Tailwind CSS
- Dark/light theme support
- Loading states and smooth transitions
- Toast notifications (Sonner)
- Google Analytics integration (production)

---

## Getting Started

### Prerequisites
- [.NET 9 SDK](https://dotnet.microsoft.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Node.js](https://nodejs.org/) (for frontend)
- [Bun](https://bun.sh/) (recommended) or npm

### Backend Setup
```bash
cd backend
dotnet restore
dotnet ef database update   # Apply migrations
dotnet run
```

### Frontend Setup
```bash
cd frontend
bun install
bun dev
```

### Docker
```bash
cd backend
docker-compose up -d
```

