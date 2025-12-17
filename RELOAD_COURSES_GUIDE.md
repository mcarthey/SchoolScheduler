# ?? Quick Fix: Reload Courses from CSV

## Problem
API returns 17 sample courses instead of 260 from `ohs-courses.csv`

## Cause
Database already has courses seeded, so the seeder skips CSV import.

## Solution

### Option 1: Delete Database (Recommended)
```powershell
# Stop the API (Ctrl+C)

# Delete the database
Remove-Item SchoolScheduler.Api\bin\Debug\net10.0\scheduler.db -Force

# Restart the API
dotnet run --project SchoolScheduler.Api
```

### Option 2: Using Visual Studio
1. Stop debugging (Shift+F5)
2. Navigate to `SchoolScheduler.Api\bin\Debug\net10.0\`
3. Delete `scheduler.db` file
4. Press F5 to restart

### Option 3: Clear All Build Outputs
```powershell
# Clean and rebuild everything
dotnet clean
dotnet build
dotnet run --project SchoolScheduler.Api
```

---

## Verify Success

When API starts, you should see:
```
?? Seeding courses from CSV...
?? Reading courses from: E:\...\ohs-courses.csv
? Added 260 courses to database
? Linked prerequisites for all courses
```

Then test:
- Swagger: `https://localhost:7217/api/courses` ? 260 courses
- Angular: `http://localhost:4200` ? All departments populated

---

## Common Locations for Database File

The SQLite database file `scheduler.db` can be in:
- `SchoolScheduler.Api\bin\Debug\net10.0\scheduler.db`
- `SchoolScheduler.Api\bin\Release\net10.0\scheduler.db`

---

## Why This Happens

The `CourseSeeder.cs` has this check:
```csharp
if (db.Courses.Any())
{
    Console.WriteLine("? Courses already seeded.");
    return; // Exits early!
}
```

This prevents re-seeding on every startup. To reload from CSV after updating it, delete the database first.

---

## Alternative: Add Re-Seed Endpoint

Want to reload courses without restarting? Add this endpoint:

```csharp
// In Program.cs
app.MapPost("/api/admin/reseed", (SchedulerDbContext db) =>
{
    db.Courses.RemoveRange(db.Courses);
    db.SaveChanges();
    CourseSeeder.SeedCourses(db);
    return Results.Ok("Database re-seeded successfully");
});
```

Then call: `POST https://localhost:7217/api/admin/reseed`
