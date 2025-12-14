# SchoolScheduler

Lightweight POC that lets users create and view class schedules. Backend is a .NET 10 minimal API with EF Core; for Dev/Testing it uses the EF InMemory provider. The UI is Angular 21.

## Architecture
- SchoolScheduler.Api: .NET 10 minimal API, Swagger enabled in Development, CORS open to `http://localhost:4200`, HTTPS at `https://localhost:7217` (HTTP at `http://localhost:5031`). Chooses EF provider based on environment/config (InMemory for Development/Testing by default).
- SchoolScheduler.Data: EF Core model (`ClassModel`) and `SchedulerDbContext`; ships [SchoolScheduler.Data/appsettings.Development.json](SchoolScheduler.Data/appsettings.Development.json) with `UseInMemory=true`.
- scheduler-ui: Angular 21 SPA hitting `environment.apiUrl` (default `https://localhost:7217`).

## Prerequisites
- .NET 10 SDK (10.0.1xx preview) installed and on PATH.
- Node 20+ with npm (Angular 21 compatible). Angular CLI is pulled locally via `npm install`.
- Optional: SQL Server only if you want persistent storage instead of the in-memory POC database.
- Optional: dotnet-ef CLI for migrations when switching to SQL Server: `dotnet tool install -g dotnet-ef`.

## Database setup
- Default (recommended for Dev/Testing): In-memory database. No SQL instance or migrations needed.
- Optional persistent SQL Server:
  1) Set `Database:UseInMemory` to `false` and provide `DefaultConnection` in [SchoolScheduler.Api/appsettings.json](SchoolScheduler.Api/appsettings.json) and [SchoolScheduler.Data/appsettings.Development.json](SchoolScheduler.Data/appsettings.Development.json).
  2) Create and apply migrations:
     ```bash
     dotnet ef migrations add InitialCreate \
       --project SchoolScheduler.Data \
       --startup-project SchoolScheduler.Api \
       --output-dir Migrations

     dotnet ef database update --project SchoolScheduler.Data --startup-project SchoolScheduler.Api
     ```

## Run the API (backend)
From the repo root:
```bash
dotnet run --project SchoolScheduler.Api --launch-profile https
```
- In Development/Testing it runs with an in-memory database and seeds “English 10”.
- Swagger UI is available at `https://localhost:7217/swagger` in Development.
- If HTTPS cert is untrusted, run `dotnet dev-certs https --trust` once.

## Run automated tests
```bash
dotnet test
```
- Tests spin up the API in a Testing environment using the in-memory database to verify GET/POST class flows.

## Run the Angular app (frontend)
```bash
cd scheduler-ui
npm install
npm run start
```
- Served at `http://localhost:4200` (matches the API CORS policy and `environment.apiUrl`).
- The UI will call `https://localhost:7217/classes` for data.

## Quick POC validation
1) Start the API.
2) Start the Angular dev server.
3) Browse to `http://localhost:4200` and add a class. It should appear in the list after saving.
4) API sanity check (optional):
	```bash
	curl -k https://localhost:7217/classes
	```
	Should return the seeded “English 10” plus any classes you added.

## Troubleshooting
- CORS: only `http://localhost:4200` is allowed by default; adjust in `Program.cs` if you use a different origin.
- Persistence: in-memory data resets on restart. Switch to SQL Server (see Database setup) for durable storage.
- Port mismatch: if you change the API port, update `scheduler-ui/src/app/environment.ts` to match.
