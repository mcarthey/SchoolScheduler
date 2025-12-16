# School Scheduler

[![CI/CD Pipeline](https://github.com/mcarthey/SchoolScheduler/actions/workflows/ci.yml/badge.svg)](https://github.com/mcarthey/SchoolScheduler/actions/workflows/ci.yml)

Lightweight POC that lets users create and view class schedules using a calendar-first interface. Backend is a .NET 10 minimal API with EF Core; for Dev/Testing it uses the EF InMemory provider. The UI is Angular 21 with FullCalendar for rich scheduling UX.

## Architecture
- **SchoolScheduler.Api**: .NET 10 minimal API, Swagger enabled in Development, CORS open to http://localhost:4200, HTTPS at https://localhost:7217 (HTTP at http://localhost:5031). Chooses EF provider based on environment/config (InMemory for Development/Testing by default).
- **SchoolScheduler.Data**: EF Core model (ClassModel) and SchedulerDbContext; ships with UseInMemory=true by default.
- **scheduler-ui**: Angular 21 SPA with FullCalendar calendar views, hitting environment.apiUrl (default https://localhost:7217).

## Project Structure

```
SchoolScheduler/
 SchoolScheduler.Api/          # ASP.NET Core Web API
 SchoolScheduler.Api.Tests/    # Backend integration tests
 SchoolScheduler.Data/         # EF Core data layer
 scheduler-ui/                 # Angular 21 frontend with calendar
```

## Prerequisites

- .NET 10 SDK (10.0.1xx) installed and on PATH.
- Node.js 20+ with npm (Angular 21 compatible). Angular CLI is pulled locally via 
pm install.
- Optional: SQL Server only if you want persistent storage instead of the in-memory POC database.
- Optional: dotnet-ef CLI for migrations when switching to SQL Server: dotnet tool install -g dotnet-ef.

## Database Setup

**Default (recommended for Dev/Testing):** In-memory database. No SQL instance or migrations needed.

**Optional persistent SQL Server:**
1) Set Database:UseInMemory to alse and provide DefaultConnection in SchoolScheduler.Api/appsettings.json.
2) Run migrations:
   `bash
   dotnet ef migrations add InitialCreate \
     --project SchoolScheduler.Data \
     --startup-project SchoolScheduler.Api \
     --output-dir Migrations

   dotnet ef database update --project SchoolScheduler.Data --startup-project SchoolScheduler.Api
   `

## Running the Application

### 1. Start the API (backend)

From the repo root:
`bash
dotnet run --project SchoolScheduler.Api --launch-profile https
`

- In Development/Testing it runs with an in-memory database and seeds "English 10".
- Swagger UI is available at https://localhost:7217/swagger in Development.
- If HTTPS cert is untrusted, run dotnet dev-certs https --trust once.

### 2. Start the Angular app (frontend)

From the repo root:
`bash
cd scheduler-ui
npm install
npm run start
`

- Served at http://localhost:4200 (matches the API CORS policy and environment.apiUrl).
- The UI will call https://localhost:7217/classes for class data.

### 3. Validate the setup

1) Open http://localhost:4200 in your browser.
2) You should see a calendar view with the seeded "English 10" class.
3) Add a new class: set the name, term, duration type, date range, meeting days/time, and priority.
4) The class should appear on the calendar immediately after saving.
5) Drag class blocks to reschedule them (updates are persisted to the API).
6) View multiple schedule options in the "Explore Schedules" tab.

API sanity check (optional):
`bash
curl -k https://localhost:7217/classes
`
Should return the seeded "English 10" plus any classes you added.

## Run Automated Tests

`bash
dotnet test
`

Tests spin up the API in a Testing environment using the in-memory database to verify GET/POST class flows.

## Troubleshooting

- **CORS**: only http://localhost:4200 is allowed by default; adjust in Program.cs if you use a different origin.
- **Persistence**: in-memory data resets on restart. Switch to SQL Server (see Database Setup) for durable storage.
- **Port mismatch**: if you change the API port, update scheduler-ui/src/app/environment.ts to match.
- **HTTPS certificate**: if browser blocks requests to https://localhost:7217, run dotnet dev-certs https --trust.

## UI Architecture

The Angular frontend is organized as follows:
- **app.ts**: Root component with routing provider setup.
- **calendar.component.ts**: Main week/day view calendar powered by FullCalendar.
- **class.service.ts**: HTTP client for /classes endpoint + local scheduling state.
- **edit-class-modal.component.ts**: Form for creating/editing classes with live preview on calendar.
- **conflict-detector.service.ts**: Detects overlapping classes and generates warnings.
- **schedule-explorer.component.ts**: UI for browsing multiple candidate schedules (stubbed).

## API Endpoints

| Method | Endpoint   | Description          |
|--------|------------|----------------------|
| GET    | /classes   | Get all classes      |
| POST   | /classes   | Create a new class   |

## Class Model

Backend domain model:
`typescript
{
  id?: number;
  name: string;                   // Required, max 200 chars
  term: string;                   // Semester, Half, Year
  durationType: string;           // Block, Skinny
  startDate: string;              // ISO date format
  endDate: string;                // ISO date format
  minutesPerSession: number;      // 1-600
  priority: number;               // 1-10
}
`

**UI Extensions (local only, not persisted to backend yet):**
- daysOfWeek?: number[]  Days 0-6 (Sun-Sat) when class meets
- startTime?: string  HH:mm format for meeting start time
- endTime?: string  HH:mm format for meeting end time

These UI fields enable the calendar to display and reschedule class blocks. When the backend evolves to support recurrence, these will be sent to the API.

## Known Limitations & Future Enhancements

1. **Meeting Schedule**: Currently, the UI adds daysOfWeek and startTime/endTime fields locally (not persisted to backend). When the backend evolves to support recurrence, these will be sent to the API.
2. **Schedule Generation**: The "Explore Schedules" tab is a UI stub; backend optimization/constraint solver will be integrated later.
3. **Drag & Drop**: Changes are persisted immediately to the API; no draft/undo workflow yet.
4. **Browser Support**: Tested on Chrome; Firefox and Safari compatibility pending.

## Development Workflow

1. Create a feature branch: eature/your-feature-name
2. Make your changes
3. Add tests for new functionality
4. Run tests locally: dotnet test and 
pm test
5. Commit with conventional commit format: eat: add new feature
6. Push and create a pull request

## License

Private educational project
