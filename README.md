# School Scheduler

[![CI/CD Pipeline](https://github.com/mcarthey/SchoolScheduler/actions/workflows/ci.yml/badge.svg)](https://github.com/mcarthey/SchoolScheduler/actions/workflows/ci.yml)

A school class scheduling application built with ASP.NET Core and Angular.

## Project Structure

```
SchoolScheduler/
├── SchoolScheduler.Api/          # ASP.NET Core Web API
├── SchoolScheduler.Api.Tests/    # Backend integration tests
├── SchoolScheduler.Data/          # EF Core data layer
└── scheduler-ui/                  # Angular frontend
```

## Prerequisites

- .NET 10.0 SDK
- Node.js 22.x
- SQL Server (LocalDB or Express)

## Getting Started

### Backend

```bash
# Restore dependencies
dotnet restore

# Create database migration (first time only)
dotnet ef migrations add InitialCreate --project SchoolScheduler.Data --startup-project SchoolScheduler.Api

# Run the API
cd SchoolScheduler.Api
dotnet run
```

The API will be available at:
- HTTPS: https://localhost:7217
- HTTP: http://localhost:5031
- Swagger: https://localhost:7217/swagger

### Frontend

```bash
# Install dependencies
cd scheduler-ui
npm install

# Run development server
npm start
```

The app will be available at http://localhost:4200

## Running Tests

### Backend Tests

```bash
# Run all backend tests
dotnet test

# Run with code coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Frontend Tests

```bash
cd scheduler-ui

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## API Endpoints

| Method | Endpoint   | Description          |
|--------|------------|----------------------|
| GET    | /classes   | Get all classes      |
| POST   | /classes   | Create a new class   |

## Class Model

```typescript
{
  id?: number;
  name: string;           // Required, max 200 chars
  term: string;           // Semester, Half, Year
  durationType: string;   // Block, Skinny
  startDate: string;      // ISO date format
  endDate: string;        // ISO date format
  minutesPerSession: number;  // 1-600
  priority: number;       // 1-10
}
```

## Development Workflow

1. Create a feature branch: `feature/your-feature-name`
2. Make your changes
3. Add tests for new functionality
4. Run tests locally: `dotnet test` and `npm test`
5. Commit with conventional commit format: `feat: add new feature`
6. Push and create a pull request

## CI/CD

The project uses GitHub Actions for continuous integration:

- **Backend**: Builds, tests, and validates .NET code
- **Frontend**: Builds, tests Angular application
- **Integration**: Validates cross-layer compatibility

## Architecture Notes

- **Backend**: Minimal API pattern with EF Core
- **Frontend**: Standalone Angular components (no NgModules)
- **Database**: SQL Server with EF Core migrations
- **Testing**: xUnit (backend), Vitest (frontend)

## Future Enhancements

- Visual calendar-based scheduling
- Schedule conflict detection
- Multiple schedule generation
- Priority-based optimization
- Drag-and-drop interface

## License

Private educational project
