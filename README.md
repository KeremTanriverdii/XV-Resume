# ResumeXCreator (XV-Resume)

ResumeXCreator is an AI-powered resume optimization, cover letter generator, cold outreach message creator, and ATS analysis platform. Built on an enterprise Nx monorepo architecture, it combines Next.js 16 App Router on the frontend with a scalable .NET 10 Web API backend powered by Google Gemini AI, SignalR real-time streaming, and PostgreSQL.

## Features

- Contextual AI Resume Tailoring: Scrapes job posting URLs and aligns candidate profiles with job requirements.
- Multi-Language Target Generation: Generates tailored CVs, Cover Letters, and Cold Messages concurrently across multiple languages (English, Turkish, German, French, Spanish, Italian).
- Real-Time Progress Streaming: Broadcasts live generation milestones using SignalR Hub connection.
- Tailored Cover Letter & Cold Outreach Tabs: Interactive workspace tabs for copying, inline editing, and exporting custom cover letters and recruiter outreach messages.
- Quick ATS Match Analysis: Provides match percentage scoring, keyword feedback, and gap analysis.
- Smart PDF Export: Container-level page break rules preventing orphaned headers and broken section layouts.
- Advanced Performance Infrastructure: Built-in route loading skeletons, TanStack Query in-memory caching, SWC tree-shaking, and next/image WebP/AVIF auto-compression.
- Resilient API Architecture: Exponential backoff retry policies for external Gemini API rate limits and IDistributedCache support ready for Redis deployment.

## Architecture and Tech Stack

### Frontend (apps/web)

- Framework: Next.js 16 (App Router) with React 19 and TypeScript
- Styling: TailwindCSS v4 and Radix UI Primitives
- State & Data Fetching: TanStack Query v5 (React Query) and Zustand
- Real-time Client: @microsoft/signalr
- Internationalization: next-intl
- PDF Generation: html2pdf.js with container page-break avoidance

### Backend (apps/api)

- Framework: .NET 10 C# Web API
- ORM & Database: Entity Framework Core 10 with Npgsql (PostgreSQL)
- AI Engine: Google Gemini 3.1 Flash Lite via structured response schemas
- Real-time Hub: ASP.NET Core SignalR
- Resilience & Rate Limiting: Exponential Backoff retry policies and fixed-window rate limiters per endpoint type
- Authentication: Supabase Auth with JWT Bearer validation

## Project Structure

```
ResumeXCreator/
├── apps/
│   ├── api/
│   │   ├── ResumeXCreator.Api/           # Endpoints, Program.cs, SignalR Hubs
│   │   ├── ResumeXCreator.Domain/        # Domain Entities & Interfaces
│   │   ├── ResumeXCreator.Infrastructure/ # EF Core DbContext, Repositories, Gemini API
│   │   └── ResumeXCreator.Services/      # Application Business Logic & DTOs
│   └── web/
│       └── src/
│           ├── app/                       # Next.js App Router ([locale]/dashboard)
│           ├── components/                # UI Components, Templates & Tabs
│           ├── hooks/                     # Custom React Hooks (useSignalR)
│           ├── providers/                  # QueryProvider, AuthProvider, AppSidebar
│           ├── services/                   # Frontend API Client Services
│           └── utils/                     # PDF Exporter, Title Formatting
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- .NET 10.0 SDK
- PostgreSQL database instance or Supabase project

### Environment Configuration

#### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5075/api/v1
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

#### Backend (`apps/api/ResumeXCreator.Api/appsettings.Development.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=resumexcreator;Username=postgres;Password=yourpassword"
  },
  "Authentication": {
    "ValidIssuer": "https://your-supabase-project.supabase.co/auth/v1",
    "ValidAudience": "authenticated",
    "JwtSecret": "your_jwt_secret"
  },
  "Gemini": {
    "ApiKey": "your_gemini_api_key"
  }
}
```

### Running Locally

To run all applications concurrently using Nx:

```bash
# Run both Frontend and Backend in development mode
npm run dev:all

# Run Frontend only
npm run dev:web

# Run Backend API only
npm run dev:api
```

Frontend will run at `http://localhost:3000` and API at `http://localhost:5075`.

## Building for Production

```bash
# Typecheck web application
npx tsc --noEmit -p apps/web/tsconfig.json

# Build frontend application
npx nx build web

# Build backend API
dotnet build apps/api/ResumeXCreator.Api/ResumeXCreator.Api.csproj -c Release
```

## License

This project is licensed under the MIT License.
